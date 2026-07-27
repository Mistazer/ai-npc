package fr.mistazer.ainpc.entity;

import net.minecraft.util.math.random.Random;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum AiNpcPersonality {
    FRIENDLY("amical", "amicale", "chaleureuse et positive"),
    CURIOUS("curieux", "curieuse", "pose beaucoup de questions et aime explorer"),
    GUARDIAN("gardien", "gardienne", "protectrice et attentive aux dangers"),
    MERCHANT("marchand", "marchande", "pragmatique et intéressée par les ressources"),
    WANDERER("voyageur", "voyageuse", "rêveuse, autonome et nomade");

    private static final String[] RANDOM_NAMES = {
            "Alya", "Nox", "Mira", "Eko", "Luna", "Soren", "Iris", "Kael", "Nova", "Orion", "Lyra", "Atlas"
    };

    private final String id;
    private final String displayName;
    private final String description;

    AiNpcPersonality(String id, String displayName, String description) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
    }

    public String id() {
        return id;
    }

    public String displayName() {
        return displayName;
    }

    public String description() {
        return description;
    }

    public static AiNpcPersonality random(Random random) {
        AiNpcPersonality[] values = values();
        return values[random.nextInt(values.length)];
    }

    public static String randomName(Random random) {
        return RANDOM_NAMES[random.nextInt(RANDOM_NAMES.length)];
    }

    public static AiNpcPersonality fromId(String id) {
        for (AiNpcPersonality personality : values()) {
            if (personality.id.equalsIgnoreCase(id)) {
                return personality;
            }
        }
        return FRIENDLY;
    }

    public static boolean isKnown(String id) {
        for (AiNpcPersonality personality : values()) {
            if (personality.id.equalsIgnoreCase(id)) {
                return true;
            }
        }
        return false;
    }

    public static List<String> ids() {
        return Arrays.stream(values()).map(AiNpcPersonality::id).collect(Collectors.toList());
    }

    public static String idsAsString() {
        return String.join(", ", ids());
    }
}
