package fr.mistazer.ainpc.entity;

public enum AiNpcActivity {
    IDLE("idle", "observe les alentours"),
    EXPLORING("exploring", "explore le monde"),
    FOLLOWING("following", "suit un joueur"),
    WAITING("waiting", "attend sur place");

    private final String id;
    private final String frenchLabel;

    AiNpcActivity(String id, String frenchLabel) {
        this.id = id;
        this.frenchLabel = frenchLabel;
    }

    public String id() {
        return id;
    }

    public String frenchLabel() {
        return frenchLabel;
    }

    public static AiNpcActivity fromId(String id) {
        for (AiNpcActivity activity : values()) {
            if (activity.id.equalsIgnoreCase(id)) {
                return activity;
            }
        }
        return IDLE;
    }
}
