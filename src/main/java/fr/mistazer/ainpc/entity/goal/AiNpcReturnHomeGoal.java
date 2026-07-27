package fr.mistazer.ainpc.entity.goal;

import fr.mistazer.ainpc.entity.AiNpcEntity;
import net.minecraft.entity.ai.goal.Goal;
import net.minecraft.util.math.BlockPos;

import java.util.EnumSet;

public final class AiNpcReturnHomeGoal extends Goal {
    private static final double MAX_DISTANCE_FROM_HOME = 24.0D;
    private static final double STOP_DISTANCE_FROM_HOME = 4.0D;

    private final AiNpcEntity npc;

    public AiNpcReturnHomeGoal(AiNpcEntity npc) {
        this.npc = npc;
        this.setControls(EnumSet.of(Control.MOVE, Control.LOOK));
    }

    @Override
    public boolean canStart() {
        BlockPos home = npc.getHomePos();
        return home != null && npc.canMoveAutonomously() && squaredDistanceTo(home) > MAX_DISTANCE_FROM_HOME * MAX_DISTANCE_FROM_HOME;
    }

    @Override
    public boolean shouldContinue() {
        BlockPos home = npc.getHomePos();
        return home != null && npc.canMoveAutonomously() && squaredDistanceTo(home) > STOP_DISTANCE_FROM_HOME * STOP_DISTANCE_FROM_HOME;
    }

    @Override
    public void stop() {
        npc.getNavigation().stop();
    }

    @Override
    public void tick() {
        BlockPos home = npc.getHomePos();
        if (home == null) {
            return;
        }
        npc.getNavigation().startMovingTo(home.getX() + 0.5D, home.getY(), home.getZ() + 0.5D, 1.0D);
    }

    private double squaredDistanceTo(BlockPos pos) {
        double dx = npc.getX() - (pos.getX() + 0.5D);
        double dy = npc.getY() - pos.getY();
        double dz = npc.getZ() - (pos.getZ() + 0.5D);
        return dx * dx + dy * dy + dz * dz;
    }
}
