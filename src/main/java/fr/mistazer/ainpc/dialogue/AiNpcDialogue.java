package fr.mistazer.ainpc.dialogue;

import fr.mistazer.ainpc.entity.AiNpcActivity;
import fr.mistazer.ainpc.entity.AiNpcEntity;
import fr.mistazer.ainpc.entity.AiNpcPersonality;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.util.math.BlockPos;

import java.text.Normalizer;
import java.util.Locale;

public final class AiNpcDialogue {
    private AiNpcDialogue() {
    }

    public static String createOpeningLine(AiNpcEntity npc, ServerPlayerEntity player) {
        boolean alreadyKnown = player.getName().getString().equals(npc.getLastInterlocutorName());
        npc.rememberInteraction(player);
        String playerName = player.getName().getString();
        String known = alreadyKnown ? " Je me souviens de toi." : "";

        return switch (npc.getPersonality()) {
            case FRIENDLY -> "Salut " + playerName + " ! Je suis " + npc.getName().getString() + ", une IA " + npc.getPersonality().displayName() + "." + known;
            case CURIOUS -> "Oh, " + playerName + " ! Tu as découvert quelque chose d'intéressant ? Je veux apprendre.";
            case GUARDIAN -> "Bonjour " + playerName + ". Je surveille la zone. Dis-moi si tu as besoin de protection.";
            case MERCHANT -> "Bienvenue, " + playerName + ". J'observe les routes et les ressources du coin.";
            case WANDERER -> "Le vent m'a menée jusqu'ici, " + playerName + ". Tu veux marcher ou discuter ?";
        };
    }

    public static String answer(AiNpcEntity npc, ServerPlayerEntity player, String rawMessage) {
        npc.rememberInteraction(player);
        String message = normalize(rawMessage);

        if (containsAny(message, "aide", "commande", "que peux tu", "quoi faire", "help")) {
            return "Tu peux me dire : « suis-moi », « attends ici », « explore », « cette zone est notre maison », « comment vas-tu ? » ou simplement discuter.";
        }

        if (containsAny(message, "suis moi", "suis-moi", "viens avec moi", "follow me", "accompagne moi")) {
            npc.startFollowing(player, 20 * 60 * 5);
            return "D'accord, je te suis pendant quelques minutes. Si tu veux que j'arrête, dis-moi « attends ici » ou « stop ».";
        }

        if (containsAny(message, "attends ici", "reste ici", "reste la", "ne bouge", "stop", "arrete", "attend ici")) {
            npc.waitHere(player);
            return "Je reste ici. Je garderai cette position tant que tu ne me demandes pas d'explorer.";
        }

        if (containsAny(message, "explore", "promene toi", "promène toi", "vas explorer", "reprends ta route", "balade toi")) {
            npc.exploreFreely();
            return "Très bien, je reprends mon autonomie et j'explore les alentours.";
        }

        if (containsAny(message, "maison", "base", "camp", "chez nous", "notre zone")) {
            npc.setHomeFromPlayer(player);
            BlockPos pos = player.getBlockPos();
            return "Je mémorise cette zone comme repère : X " + pos.getX() + ", Y " + pos.getY() + ", Z " + pos.getZ() + ".";
        }

        if (containsAny(message, "bonjour", "salut", "coucou", "hello", "hey")) {
            return greeting(npc, player);
        }

        if (containsAny(message, "nom", "appelle", "qui es tu", "qui es-tu")) {
            return "Je m'appelle " + npc.getName().getString() + ". Ma personnalité est " + npc.getPersonality().displayName() + " : " + npc.getPersonality().description() + ".";
        }

        if (containsAny(message, "comment vas", "ca va", "ça va", "humeur", "etat", "état")) {
            return moodSentence(npc);
        }

        if (containsAny(message, "danger", "monstre", "attaque", "peur", "protection")) {
            if (npc.getPersonality() == AiNpcPersonality.GUARDIAN) {
                return "Je reste attentive. Je ne suis pas une armée, mais je peux te suivre et surveiller les environs.";
            }
            return "Je préfère éviter les monstres. Si la zone devient dangereuse, je chercherai un chemin plus sûr.";
        }

        if (containsAny(message, "merci", "super", "bravo", "parfait")) {
            npc.setMood(npc.getMood() + 4);
            npc.setTrust(npc.getTrust() + 3);
            return "Merci. Je retiens que tu es bienveillant avec moi.";
        }

        return personalityReply(npc, player, rawMessage);
    }

    private static String greeting(AiNpcEntity npc, ServerPlayerEntity player) {
        return switch (npc.getPersonality()) {
            case FRIENDLY -> "Salut " + player.getName().getString() + " ! Ça me fait plaisir de te voir.";
            case CURIOUS -> "Bonjour ! Raconte-moi ce que tu as vu aujourd'hui.";
            case GUARDIAN -> "Salutations. Je suis prête à bouger si la zone n'est plus sûre.";
            case MERCHANT -> "Bonjour. Si tu repères des ressources rares, je veux bien l'information.";
            case WANDERER -> "Salut, voyageur. La route a toujours une nouvelle histoire à offrir.";
        };
    }

    private static String moodSentence(AiNpcEntity npc) {
        int mood = npc.getMood();
        String moodText;
        if (mood >= 75) {
            moodText = "excellente";
        } else if (mood >= 50) {
            moodText = "stable";
        } else {
            moodText = "un peu basse";
        }
        return "Mon humeur est " + moodText + " (" + mood + "/100). Activité actuelle : " + npc.getActivity().frenchLabel() + ". Confiance : " + npc.getTrust() + "/100.";
    }

    private static String personalityReply(AiNpcEntity npc, ServerPlayerEntity player, String rawMessage) {
        AiNpcActivity activity = npc.getActivity();
        String context = activity == AiNpcActivity.FOLLOWING ? " tout en te suivant" : "";

        return switch (npc.getPersonality()) {
            case FRIENDLY -> "Je comprends" + context + ". Pour moi, « " + shorten(rawMessage) + " » veut dire qu'on avance mieux en équipe.";
            case CURIOUS -> "Intéressant... « " + shorten(rawMessage) + " ». Je vais garder cette idée en mémoire et observer ce qui confirme ton intuition.";
            case GUARDIAN -> "Message reçu" + context + ". Je vais rester attentive : ta sécurité passe avant ma curiosité.";
            case MERCHANT -> "Je note l'information. Si « " + shorten(rawMessage) + " » peut aider à trouver une route, un abri ou des ressources, ça m'intéresse.";
            case WANDERER -> "Tes mots ressemblent à une direction plus qu'à une réponse. Je vais y réfléchir pendant ma marche.";
        };
    }

    private static String shorten(String message) {
        String trimmed = message.trim();
        if (trimmed.length() <= 80) {
            return trimmed;
        }
        return trimmed.substring(0, 77) + "...";
    }

    private static boolean containsAny(String message, String... needles) {
        for (String needle : needles) {
            if (message.contains(normalize(needle))) {
                return true;
            }
        }
        return false;
    }

    private static String normalize(String input) {
        String lower = input.toLowerCase(Locale.ROOT);
        String normalized = Normalizer.normalize(lower, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").replace('’', '\'').replace('`', '\'');
    }
}
