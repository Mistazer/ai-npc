package fr.mistazer.ainpc.registry;

import fr.mistazer.ainpc.AiNpcMod;
import net.fabricmc.fabric.api.item.v1.FabricItemSettings;
import net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;
import net.minecraft.item.Item;
import net.minecraft.item.ItemGroups;
import net.minecraft.item.SpawnEggItem;
import net.minecraft.registry.Registries;
import net.minecraft.registry.Registry;

public final class ModItems {
    public static final Item AI_NPC_SPAWN_EGG = Registry.register(
            Registries.ITEM,
            AiNpcMod.id("ai_npc_spawn_egg"),
            new SpawnEggItem(ModEntities.AI_NPC, 0x2D3648, 0x6EE7B7, new FabricItemSettings())
    );

    private ModItems() {
    }

    public static void register() {
        ItemGroupEvents.modifyEntriesEvent(ItemGroups.SPAWN_EGGS).register(entries -> entries.add(AI_NPC_SPAWN_EGG));
        AiNpcMod.LOGGER.debug("Objets AI NPC enregistrés");
    }
}
