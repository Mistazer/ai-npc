package fr.mistazer.ainpc.registry;

import fr.mistazer.ainpc.AiNpcMod;
import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricDefaultAttributeRegistry;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricEntityTypeBuilder;
import net.minecraft.entity.EntityDimensions;
import net.minecraft.entity.EntityType;
import net.minecraft.entity.SpawnGroup;
import net.minecraft.registry.Registries;
import net.minecraft.registry.Registry;

public final class ModEntities {
    public static final EntityType<AiNpcEntity> AI_NPC = Registry.register(
            Registries.ENTITY_TYPE,
            AiNpcMod.id("ai_npc"),
            FabricEntityTypeBuilder.create(SpawnGroup.CREATURE, AiNpcEntity::new)
                    .dimensions(EntityDimensions.fixed(0.6F, 1.95F))
                    .trackRangeBlocks(80)
                    .trackedUpdateRate(3)
                    .build()
    );

    private ModEntities() {
    }

    public static void register() {
        FabricDefaultAttributeRegistry.register(AI_NPC, AiNpcEntity.createAiNpcAttributes());
        AiNpcMod.LOGGER.debug("Entités AI NPC enregistrées");
    }
}
