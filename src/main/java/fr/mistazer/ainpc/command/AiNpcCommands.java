package fr.mistazer.ainpc.command;

import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import fr.mistazer.ainpc.entity.AiNpcEntity;
import fr.mistazer.ainpc.entity.AiNpcPersonality;
import fr.mistazer.ainpc.registry.ModEntities;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.minecraft.command.CommandSource;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.server.world.ServerWorld;
import net.minecraft.text.Text;
import net.minecraft.util.math.Vec3d;

import static net.minecraft.server.command.CommandManager.argument;
import static net.minecraft.server.command.CommandManager.literal;

public final class AiNpcCommands {
    private AiNpcCommands() {
    }

    public static void register() {
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> dispatcher.register(
                literal("ainpc")
                        .then(literal("personnalites")
                                .executes(context -> listPersonalities(context.getSource())))
                        .then(literal("personalities")
                                .executes(context -> listPersonalities(context.getSource())))
                        .then(literal("spawn")
                                .requires(source -> source.hasPermissionLevel(2))
                                .executes(context -> spawn(context.getSource(), null, null))
                                .then(argument("personnalite", StringArgumentType.word())
                                        .suggests((context, builder) -> CommandSource.suggestMatching(AiNpcPersonality.ids(), builder))
                                        .executes(context -> spawn(context.getSource(), StringArgumentType.getString(context, "personnalite"), null))
                                        .then(argument("nom", StringArgumentType.greedyString())
                                                .executes(context -> spawn(
                                                        context.getSource(),
                                                        StringArgumentType.getString(context, "personnalite"),
                                                        StringArgumentType.getString(context, "nom")
                                                )))))
        ));
    }

    private static int listPersonalities(ServerCommandSource source) {
        source.sendFeedback(() -> Text.translatable("command.ai_npc.personalities", AiNpcPersonality.idsAsString()), false);
        return AiNpcPersonality.values().length;
    }

    private static int spawn(ServerCommandSource source, String personalityId, String name) {
        AiNpcPersonality personality = null;
        if (personalityId != null) {
            if (!AiNpcPersonality.isKnown(personalityId)) {
                source.sendError(Text.translatable("command.ai_npc.personality_unknown", AiNpcPersonality.idsAsString()));
                return 0;
            }
            personality = AiNpcPersonality.fromId(personalityId);
        }

        ServerWorld world = source.getWorld();
        AiNpcEntity npc = ModEntities.AI_NPC.create(world);
        if (npc == null) {
            source.sendError(Text.literal("Impossible de créer le PNJ IA."));
            return 0;
        }

        Vec3d pos = source.getPosition();
        npc.refreshPositionAndAngles(pos.x, pos.y, pos.z, 0.0F, 0.0F);
        npc.setPersistent();
        npc.setPersonality(personality == null ? AiNpcPersonality.random(npc.getRandom()) : personality);
        if (name != null && !name.isBlank()) {
            npc.setCustomName(Text.literal(limitName(name.trim())));
        } else {
            npc.setCustomName(Text.literal(AiNpcPersonality.randomName(npc.getRandom())));
        }
        npc.setCustomNameVisible(true);

        world.spawnEntity(npc);
        source.sendFeedback(() -> Text.translatable("command.ai_npc.spawned", npc.getName().getString(), npc.getPersonality().displayName()), true);
        return 1;
    }

    private static String limitName(String name) {
        if (name.length() <= 32) {
            return name;
        }
        return name.substring(0, 29) + "...";
    }
}
