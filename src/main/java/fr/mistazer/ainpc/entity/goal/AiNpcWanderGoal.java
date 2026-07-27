package fr.mistazer.ainpc.entity.goal;

import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.minecraft.entity.ai.goal.WanderAroundFarGoal;

public final class AiNpcWanderGoal extends WanderAroundFarGoal {
    private final AiNpcEntity npc;

    public AiNpcWanderGoal(AiNpcEntity npc, double speed) {
        super(npc, speed);
        this.npc = npc;
    }

    @Override
    public boolean canStart() {
        return npc.canMoveAutonomously() && super.canStart();
    }

    @Override
    public boolean shouldContinue() {
        return npc.canMoveAutonomously() && super.shouldContinue();
    }
}
