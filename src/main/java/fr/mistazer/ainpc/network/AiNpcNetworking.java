package fr.mistazer.ainpc.network;

import fr.mistazer.ainpc.AiNpcMod;
import fr.mistazer.ainpc.dialogue.AiNpcDialogue;
import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;
import net.fabricmc.fabric.api.networking.v1.ServerPlayNetworking;
import net.minecraft.entity.Entity;
import net.minecraft.network.PacketByteBuf;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Identifier;

import java.util.UUID;

public final class AiNpcNetworking {
    public static final Identifier OPEN_CHAT_S2C = AiNpcMod.id("open_chat");
    public static final Identifier CHAT_MESSAGE_C2S = AiNpcMod.id("chat_message");
    public static final Identifier CHAT_RESPONSE_S2C = AiNpcMod.id("chat_response");

    private AiNpcNetworking() {
    }

    public static void registerServerReceivers() {
        ServerPlayNetworking.registerGlobalReceiver(CHAT_MESSAGE_C2S, (server, player, handler, buf, responseSender) -> {
            UUID npcUuid = buf.readUuid();
            String message = buf.readString(512).trim();

            server.execute(() -> handleChatMessage(player, npcUuid, message));
        });
    }

    private static void handleChatMessage(ServerPlayerEntity player, UUID npcUuid, String message) {
        if (message.isBlank()) {
            return;
        }

        Entity entity = player.getServerWorld().getEntity(npcUuid);
        if (!(entity instanceof AiNpcEntity npc)) {
            player.sendMessage(Text.literal("Cette IA n'existe plus."), false);
            return;
        }
        if (npc.squaredDistanceTo(player) > 16.0D * 16.0D) {
            player.sendMessage(Text.literal(npc.getName().getString() + " est trop loin pour t'entendre."), false);
            return;
        }

        String response = AiNpcDialogue.answer(npc, player, message);
        sendResponse(player, npc, response);
    }

    public static void openChat(ServerPlayerEntity player, AiNpcEntity npc) {
        PacketByteBuf buf = PacketByteBufs.create();
        buf.writeUuid(npc.getUuid());
        buf.writeString(limit(npc.getName().getString(), 128));
        buf.writeString(limit(npc.getPersonality().displayName(), 128));
        buf.writeString(limit(npc.getStateSummary(), 256));
        buf.writeString(limit(npc.createOpeningLine(player), 512));
        ServerPlayNetworking.send(player, OPEN_CHAT_S2C, buf);
    }

    public static void sendResponse(ServerPlayerEntity player, AiNpcEntity npc, String response) {
        PacketByteBuf buf = PacketByteBufs.create();
        buf.writeUuid(npc.getUuid());
        buf.writeString(limit(npc.getName().getString(), 128));
        buf.writeString(limit(response, 512));
        ServerPlayNetworking.send(player, CHAT_RESPONSE_S2C, buf);
    }

    private static String limit(String value, int maxLength) {
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }
}
