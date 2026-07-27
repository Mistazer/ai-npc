package fr.mistazer.ainpc.entity;

import fr.mistazer.ainpc.dialogue.AiNpcDialogue;
import fr.mistazer.ainpc.entity.goal.AiNpcFollowPlayerGoal;
import fr.mistazer.ainpc.entity.goal.AiNpcReturnHomeGoal;
import fr.mistazer.ainpc.entity.goal.AiNpcWaitGoal;
import fr.mistazer.ainpc.entity.goal.AiNpcWanderGoal;
import fr.mistazer.ainpc.network.AiNpcNetworking;
import net.minecraft.entity.EntityData;
import net.minecraft.entity.EntityType;
import net.minecraft.entity.SpawnReason;
import net.minecraft.entity.ai.goal.EscapeDangerGoal;
import net.minecraft.entity.ai.goal.LookAroundGoal;
import net.minecraft.entity.ai.goal.LookAtEntityGoal;
import net.minecraft.entity.ai.goal.SwimGoal;
import net.minecraft.entity.attribute.DefaultAttributeContainer;
import net.minecraft.entity.attribute.EntityAttributes;
import net.minecraft.entity.data.DataTracker;
import net.minecraft.entity.data.TrackedData;
import net.minecraft.entity.data.TrackedDataHandlerRegistry;
import net.minecraft.entity.mob.MobEntity;
import net.minecraft.entity.mob.PathAwareEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.nbt.NbtElement;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.server.world.ServerWorld;
import net.minecraft.sound.SoundEvent;
import net.minecraft.sound.SoundEvents;
import net.minecraft.text.Text;
import net.minecraft.util.ActionResult;
import net.minecraft.util.Hand;
import net.minecraft.util.math.BlockPos;
import net.minecraft.world.LocalDifficulty;
import net.minecraft.world.ServerWorldAccess;
import net.minecraft.world.World;

import java.util.Locale;
import java.util.UUID;

public class AiNpcEntity extends PathAwareEntity {
    private static final TrackedData<String> PERSONALITY = DataTracker.registerData(AiNpcEntity.class, TrackedDataHandlerRegistry.STRING);
    private static final TrackedData<String> ACTIVITY = DataTracker.registerData(AiNpcEntity.class, TrackedDataHandlerRegistry.STRING);
    private static final TrackedData<Integer> TRUST = DataTracker.registerData(AiNpcEntity.class, TrackedDataHandlerRegistry.INTEGER);
    private static final TrackedData<Integer> MOOD = DataTracker.registerData(AiNpcEntity.class, TrackedDataHandlerRegistry.INTEGER);

    private UUID followingPlayerUuid;
    private int followUntilAge;
    private BlockPos homePos;
    private String lastInterlocutorName = "";

    public AiNpcEntity(EntityType<? extends AiNpcEntity> entityType, World world) {
        super(entityType, world);
        this.setCanPickUpLoot(false);
    }

    public static DefaultAttributeContainer.Builder createAiNpcAttributes() {
        return MobEntity.createMobAttributes()
                .add(EntityAttributes.GENERIC_MAX_HEALTH, 24.0D)
                .add(EntityAttributes.GENERIC_MOVEMENT_SPEED, 0.28D)
                .add(EntityAttributes.GENERIC_FOLLOW_RANGE, 32.0D);
    }

    @Override
    protected void initDataTracker() {
        super.initDataTracker();
        this.dataTracker.startTracking(PERSONALITY, AiNpcPersonality.FRIENDLY.id());
        this.dataTracker.startTracking(ACTIVITY, AiNpcActivity.IDLE.id());
        this.dataTracker.startTracking(TRUST, 0);
        this.dataTracker.startTracking(MOOD, 55);
    }

    @Override
    protected void initGoals() {
        this.goalSelector.add(0, new SwimGoal(this));
        this.goalSelector.add(1, new EscapeDangerGoal(this, 1.25D));
        this.goalSelector.add(2, new AiNpcWaitGoal(this));
        this.goalSelector.add(3, new AiNpcFollowPlayerGoal(this));
        this.goalSelector.add(4, new AiNpcReturnHomeGoal(this));
        this.goalSelector.add(5, new AiNpcWanderGoal(this, 0.85D));
        this.goalSelector.add(6, new LookAtEntityGoal(this, PlayerEntity.class, 8.0F));
        this.goalSelector.add(7, new LookAroundGoal(this));
    }

    @Override
    public EntityData initialize(ServerWorldAccess world, LocalDifficulty difficulty, SpawnReason spawnReason, EntityData entityData, NbtCompound entityNbt) {
        EntityData data = super.initialize(world, difficulty, spawnReason, entityData, entityNbt);
        this.setPersistent();

        if (entityNbt == null || !entityNbt.contains("Personality", NbtElement.STRING_TYPE)) {
            setPersonality(AiNpcPersonality.random(this.random));
        }
        if (!hasCustomName()) {
            setCustomName(Text.literal(AiNpcPersonality.randomName(this.random)));
            setCustomNameVisible(true);
        }
        if (getActivity() == AiNpcActivity.IDLE && this.random.nextBoolean()) {
            setActivity(AiNpcActivity.EXPLORING);
        }

        return data;
    }

    @Override
    public void tick() {
        super.tick();

        if (!this.getWorld().isClient) {
            if (isFollowingPlayer() && this.followUntilAge > 0 && this.age > this.followUntilAge) {
                stopFollowing();
            }

            if (this.age % 600 == 0) {
                slowlyEvolveMood();
            }
        }
    }

    private void slowlyEvolveMood() {
        int mood = getMood();
        if (this.random.nextBoolean()) {
            mood++;
        } else {
            mood--;
        }
        setMood(Math.max(20, Math.min(90, mood)));
    }

    @Override
    public ActionResult interactMob(PlayerEntity player, Hand hand) {
        if (hand != Hand.MAIN_HAND) {
            return ActionResult.PASS;
        }

        if (this.getWorld().isClient) {
            return ActionResult.SUCCESS;
        }

        if (player instanceof ServerPlayerEntity serverPlayer) {
            AiNpcNetworking.openChat(serverPlayer, this);
        }

        return ActionResult.CONSUME;
    }

    @Override
    public void writeCustomDataToNbt(NbtCompound nbt) {
        super.writeCustomDataToNbt(nbt);
        nbt.putString("Personality", getPersonality().id());
        nbt.putString("Activity", getActivity().id());
        nbt.putInt("Trust", getTrust());
        nbt.putInt("Mood", getMood());
        nbt.putString("LastInterlocutor", lastInterlocutorName);

        if (followingPlayerUuid != null && isFollowingPlayer()) {
            nbt.putUuid("FollowingPlayer", followingPlayerUuid);
            nbt.putInt("FollowTicks", Math.max(0, followUntilAge - this.age));
        }
        if (homePos != null) {
            nbt.putInt("HomeX", homePos.getX());
            nbt.putInt("HomeY", homePos.getY());
            nbt.putInt("HomeZ", homePos.getZ());
        }
    }

    @Override
    public void readCustomDataFromNbt(NbtCompound nbt) {
        super.readCustomDataFromNbt(nbt);

        if (nbt.contains("Personality", NbtElement.STRING_TYPE)) {
            setPersonality(AiNpcPersonality.fromId(nbt.getString("Personality")));
        }
        if (nbt.contains("Activity", NbtElement.STRING_TYPE)) {
            setActivity(AiNpcActivity.fromId(nbt.getString("Activity")));
        }
        if (nbt.contains("Trust", NbtElement.INT_TYPE)) {
            setTrust(nbt.getInt("Trust"));
        }
        if (nbt.contains("Mood", NbtElement.INT_TYPE)) {
            setMood(nbt.getInt("Mood"));
        }
        if (nbt.contains("LastInterlocutor", NbtElement.STRING_TYPE)) {
            lastInterlocutorName = nbt.getString("LastInterlocutor");
        }
        if (nbt.containsUuid("FollowingPlayer")) {
            followingPlayerUuid = nbt.getUuid("FollowingPlayer");
            followUntilAge = this.age + nbt.getInt("FollowTicks");
            setActivity(AiNpcActivity.FOLLOWING);
        }
        if (nbt.contains("HomeX", NbtElement.INT_TYPE) && nbt.contains("HomeY", NbtElement.INT_TYPE) && nbt.contains("HomeZ", NbtElement.INT_TYPE)) {
            homePos = new BlockPos(nbt.getInt("HomeX"), nbt.getInt("HomeY"), nbt.getInt("HomeZ"));
        }
    }

    public AiNpcPersonality getPersonality() {
        return AiNpcPersonality.fromId(this.dataTracker.get(PERSONALITY));
    }

    public void setPersonality(AiNpcPersonality personality) {
        this.dataTracker.set(PERSONALITY, personality.id());
    }

    public AiNpcActivity getActivity() {
        return AiNpcActivity.fromId(this.dataTracker.get(ACTIVITY));
    }

    public void setActivity(AiNpcActivity activity) {
        this.dataTracker.set(ACTIVITY, activity.id());
    }

    public int getTrust() {
        return this.dataTracker.get(TRUST);
    }

    public void setTrust(int trust) {
        this.dataTracker.set(TRUST, Math.max(0, Math.min(100, trust)));
    }

    public int getMood() {
        return this.dataTracker.get(MOOD);
    }

    public void setMood(int mood) {
        this.dataTracker.set(MOOD, Math.max(0, Math.min(100, mood)));
    }

    public boolean canMoveAutonomously() {
        AiNpcActivity activity = getActivity();
        return activity == AiNpcActivity.IDLE || activity == AiNpcActivity.EXPLORING;
    }

    public boolean isWaiting() {
        return getActivity() == AiNpcActivity.WAITING;
    }

    public boolean isFollowingPlayer() {
        return getActivity() == AiNpcActivity.FOLLOWING && followingPlayerUuid != null;
    }

    public PlayerEntity getFollowTarget() {
        if (!isFollowingPlayer() || !(this.getWorld() instanceof ServerWorld serverWorld)) {
            return null;
        }
        return serverWorld.getPlayerByUuid(followingPlayerUuid);
    }

    public void startFollowing(ServerPlayerEntity player, int ticks) {
        followingPlayerUuid = player.getUuid();
        followUntilAge = this.age + ticks;
        setActivity(AiNpcActivity.FOLLOWING);
        rememberInteraction(player);
    }

    public void stopFollowing() {
        followingPlayerUuid = null;
        followUntilAge = 0;
        setActivity(AiNpcActivity.IDLE);
        this.getNavigation().stop();
    }

    public void waitHere(ServerPlayerEntity player) {
        followingPlayerUuid = null;
        followUntilAge = 0;
        homePos = this.getBlockPos();
        setActivity(AiNpcActivity.WAITING);
        rememberInteraction(player);
    }

    public void exploreFreely() {
        followingPlayerUuid = null;
        followUntilAge = 0;
        setActivity(AiNpcActivity.EXPLORING);
    }

    public void setHomeFromPlayer(ServerPlayerEntity player) {
        homePos = player.getBlockPos();
        rememberInteraction(player);
    }

    public BlockPos getHomePos() {
        return homePos;
    }

    public String getLastInterlocutorName() {
        return lastInterlocutorName;
    }

    public String getStateSummary() {
        return String.format(Locale.ROOT, "%s, humeur %d/100, confiance %d/100", getActivity().frenchLabel(), getMood(), getTrust());
    }

    public void rememberInteraction(ServerPlayerEntity player) {
        lastInterlocutorName = player.getName().getString();
        setTrust(getTrust() + 1);
        setMood(getMood() + 1);
    }

    public String createOpeningLine(ServerPlayerEntity player) {
        return AiNpcDialogue.createOpeningLine(this, player);
    }

    @Override
    protected SoundEvent getAmbientSound() {
        return SoundEvents.ENTITY_VILLAGER_AMBIENT;
    }

    @Override
    protected SoundEvent getHurtSound(net.minecraft.entity.damage.DamageSource source) {
        return SoundEvents.ENTITY_VILLAGER_HURT;
    }

    @Override
    protected SoundEvent getDeathSound() {
        return SoundEvents.ENTITY_VILLAGER_DEATH;
    }
}
