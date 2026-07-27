package fr.mistazer.ainpc.client;

import fr.mistazer.ainpc.client.gui.AiNpcChatScreen;
import fr.mistazer.ainpc.client.render.AiNpcRenderer;
import fr.mistazer.ainpc.network.AiNpcNetworking;
import fr.mistazer.ainpc.registry.ModEntities;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayNetworking;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;
import net.minecraft.client.MinecraftClient;
import net.minecraft.network.PacketByteBuf;
import net.minecraft.text.Text;

import java.util.UUID;

public final class AiNpcClient implements ClientModInitializer {
    @Override
    public void onInitializeClient() {
        EntityRendererRegistry.register(ModEntities.AI_NPC, AiNpcRenderer::new);
        registerPackets();
    }

    private static void registerPackets() {
        ClientPlayNetworking.registerGlobalReceiver(AiNpcNetworking.OPEN_CHAT_S2C, (client, handler, buf, responseSender) -> {
            UUID npcUuid = buf.readUuid();
            String npcName = buf.readString(128);
            String personality = buf.readString(128);
            String state = buf.readString(256);
            String opener = buf.readString(512);

            client.execute(() -> client.setScreen(new AiNpcChatScreen(npcUuid, npcName, personality, state, opener)));
        });

        ClientPlayNetworking.registerGlobalReceiver(AiNpcNetworking.CHAT_RESPONSE_S2C, (client, handler, buf, responseSender) -> {
            UUID npcUuid = buf.readUuid();
            String npcName = buf.readString(128);
            String response = buf.readString(512);

            client.execute(() -> handleResponse(client, npcUuid, npcName, response));
        });
    }

    private static void handleResponse(MinecraftClient client, UUID npcUuid, String npcName, String response) {
        if (client.currentScreen instanceof AiNpcChatScreen chatScreen && chatScreen.getNpcUuid().equals(npcUuid)) {
            chatScreen.addNpcMessage(response);
            return;
        }

        if (client.player != null) {
            client.player.sendMessage(Text.translatable("text.ai_npc.chat.closed_response", npcName, response), false);
        }
    }
}
