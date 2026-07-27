package fr.mistazer.ainpc.client.render;

import fr.mistazer.ainpc.AiNpcMod;
import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.minecraft.client.render.entity.EntityRendererFactory;
import net.minecraft.client.render.entity.MobEntityRenderer;
import net.minecraft.client.render.entity.model.BipedEntityModel;
import net.minecraft.client.render.entity.model.EntityModelLayers;
import net.minecraft.util.Identifier;

public final class AiNpcRenderer extends MobEntityRenderer<AiNpcEntity, BipedEntityModel<AiNpcEntity>> {
    private static final Identifier TEXTURE = AiNpcMod.id("textures/entity/ai_npc.png");

    public AiNpcRenderer(EntityRendererFactory.Context context) {
        super(context, new BipedEntityModel<>(context.getPart(EntityModelLayers.PLAYER)), 0.5F);
    }

    @Override
    public Identifier getTexture(AiNpcEntity entity) {
        return TEXTURE;
    }
}
