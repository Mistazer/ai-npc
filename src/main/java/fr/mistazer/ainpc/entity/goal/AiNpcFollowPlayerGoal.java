package fr.mistazer.ainpc.entity.goal;

import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.minecraft.entity.ai.goal.Goal;
import net.minecraft.entity.player.PlayerEntity;

import java.util.EnumSet;

public final class AiNpcFollowPlayerGoal extends Goal {
    private final AiNpcEntity npc;
    private PlayerEntity target;

    public AiNpcFollowPlayerGoal(AiNpcEntity npc) {
        this.npc = npc;
        this.setControls(EnumSet.of(Control.MOVE, Control.LOOK));
    }

    @Override
    public boolean canStart() {
        target = npc.getFollowTarget();
        return target != null && npc.squaredDistanceTo(target) > 6.25D;
    }

    @Override
    public boolean shouldContinue() {
        target = npc.getFollowTarget();
        return target != null && npc.isFollowingPlayer() && npc.squaredDistanceTo(target) > 3.0D;
    }

    @Override
    public void stop() {
        target = null;
        npc.getNavigation().stop();
    }

    @Override
    public void tick() {
        if (target == null) {
            return;
        }

        npc.getLookControl().lookAt(target, 30.0F, 30.0F);
        if (npc.squaredDistanceTo(target) > 4.0D) {
            npc.getNavigation().startMovingTo(target, 1.05D);
        } else {
            npc.getNavigation().stop();
        }
    }
}
