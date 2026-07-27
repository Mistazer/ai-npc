package fr.mistazer.ainpc;

import fr.mistazer.ainpc.command.AiNpcCommands;
import fr.mistazer.ainpc.network.AiNpcNetworking;
import fr.mistazer.ainpc.registry.ModEntities;
import fr.mistazer.ainpc.registry.ModItems;
import net.fabricmc.api.ModInitializer;
import net.minecraft.util.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AiNpcMod implements ModInitializer {
    public static final String MOD_ID = "ai_npc";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        ModEntities.register();
        ModItems.register();
        AiNpcNetworking.registerServerReceivers();
        AiNpcCommands.register();

        LOGGER.info("AI NPC est chargé pour Fabric 1.20.1");
    }

    public static Identifier id(String path) {
        return new Identifier(MOD_ID, path);
    }
}
