package fr.mistazer.ainpc.client.gui;

import fr.mistazer.ainpc.network.AiNpcNetworking;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayNetworking;
import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.TextFieldWidget;
import net.minecraft.network.PacketByteBuf;
import net.minecraft.text.OrderedText;
import net.minecraft.text.Text;
import org.lwjgl.glfw.GLFW;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class AiNpcChatScreen extends Screen {
    private static final int PANEL_WIDTH = 420;
    private static final int MAX_VISIBLE_MESSAGES = 12;

    private final UUID npcUuid;
    private final String npcName;
    private final String personality;
    private final String state;
    private final List<ChatLine> messages = new ArrayList<>();

    private TextFieldWidget input;

    public AiNpcChatScreen(UUID npcUuid, String npcName, String personality, String state, String opener) {
        super(Text.translatable("screen.ai_npc.chat.title", npcName));
        this.npcUuid = npcUuid;
        this.npcName = npcName;
        this.personality = personality;
        this.state = state;
        this.messages.add(new ChatLine(true, opener));
    }

    public UUID getNpcUuid() {
        return npcUuid;
    }

    public void addNpcMessage(String message) {
        this.messages.add(new ChatLine(true, message));
    }

    @Override
    protected void init() {
        int panelWidth = Math.min(PANEL_WIDTH, this.width - 32);
        int left = (this.width - panelWidth) / 2;
        int inputY = this.height - 34;
        int buttonWidth = 76;

        this.input = new TextFieldWidget(this.textRenderer, left, inputY, panelWidth - buttonWidth - 8, 20, Text.translatable("screen.ai_npc.chat.placeholder"));
        this.input.setMaxLength(512);
        this.input.setSuggestion("Écris un message...");
        this.addDrawableChild(this.input);

        this.addDrawableChild(ButtonWidget.builder(Text.translatable("screen.ai_npc.chat.send"), button -> sendCurrentMessage())
                .dimensions(left + panelWidth - buttonWidth, inputY, buttonWidth, 20)
                .build());

        this.setInitialFocus(this.input);
    }

    @Override
    public boolean keyPressed(int keyCode, int scanCode, int modifiers) {
        if (keyCode == GLFW.GLFW_KEY_ENTER || keyCode == GLFW.GLFW_KEY_KP_ENTER) {
            sendCurrentMessage();
            return true;
        }
        return super.keyPressed(keyCode, scanCode, modifiers);
    }

    private void sendCurrentMessage() {
        String message = this.input == null ? "" : this.input.getText().trim();
        if (message.isBlank()) {
            return;
        }

        this.messages.add(new ChatLine(false, message));
        this.input.setText("");

        PacketByteBuf buf = PacketByteBufs.create();
        buf.writeUuid(npcUuid);
        buf.writeString(message);
        ClientPlayNetworking.send(AiNpcNetworking.CHAT_MESSAGE_C2S, buf);
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        this.renderBackground(context);

        int panelWidth = Math.min(PANEL_WIDTH, this.width - 32);
        int left = (this.width - panelWidth) / 2;
        int top = 20;
        int bottom = this.height - 44;

        context.fill(left - 8, top - 8, left + panelWidth + 8, bottom + 8, 0xCC111827);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal(npcName + " — " + personality), this.width / 2, top, 0xFFFFFF);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal(state), this.width / 2, top + 12, 0xA7F3D0);

        int y = top + 32;
        int start = Math.max(0, this.messages.size() - MAX_VISIBLE_MESSAGES);
        for (int i = start; i < this.messages.size() && y < bottom; i++) {
            ChatLine line = this.messages.get(i);
            Text text = Text.literal((line.npc ? npcName : "Vous") + " : " + line.message);
            int color = line.npc ? 0xB7F7D4 : 0xFDE68A;

            for (OrderedText orderedText : this.textRenderer.wrapLines(text, panelWidth - 12)) {
                if (y >= bottom) {
                    break;
                }
                context.drawTextWithShadow(this.textRenderer, orderedText, left + 6, y, color);
                y += 10;
            }
            y += 5;
        }

        super.render(context, mouseX, mouseY, delta);
    }

    @Override
    public boolean shouldPause() {
        return false;
    }

    private static final class ChatLine {
        private final boolean npc;
        private final String message;

        private ChatLine(boolean npc, String message) {
            this.npc = npc;
            this.message = message;
        }
    }
}
