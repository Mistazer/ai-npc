package fr.mistazer.ainpc.entity.goal;

import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.minecraft.entity.ai.goal.Goal;

import java.util.EnumSet;

public final class AiNpcWaitGoal extends Goal {
    private final AiNpcEntity npc;

    public AiNpcWaitGoal(AiNpcEntity npc) {
        this.npc = npc;
        this.setControls(EnumSet.of(Control.MOVE, Control.JUMP));
    }

    @Override
    public boolean canStart() {
        return npc.isWaiting();
    }

    @Override
    public boolean shouldContinue() {
        return npc.isWaiting();
    }

    @Override
    public void start() {
        npc.getNavigation().stop();
    }

    @Override
    public void tick() {
        npc.getNavigation().stop();
    }
}
