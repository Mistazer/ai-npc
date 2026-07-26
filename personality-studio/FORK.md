# Fourche : skin natif par personnalité (`.png` + `steve`/`alex`)

## Contexte

`NPCConfig.java` (SecondBrain) stocke aujourd'hui : `npcName`, `uuid`,
`isActive`, `llmCharacter` (le prompt) et `llm` (config Ollama/OpenAI/Player2).
**Il n'y a pas de champ skin.** Le skin du NPC dépend de son `npcName`
(utilisé comme `GameProfile` Mojang → skin du compte).

Pour que chaque personnalité porte son **propre `.png`** et son modèle
(**steve** = classique, **alex** = slim), il faut une petite fourche.

## Modifications

### 1. `config/NPCConfig.java`
Ajouter un champ skin et l'exposer dans l'Encdec + le `Builder` :

```java
private String skinPng = "";      // chemin/url vers un .png 64x64
private String skinModel = "steve"; // "steve" | "alex"

// dans le Builder :
public Builder skin(String png, String model) {
    npcConfig.skinPng = png;
    npcConfig.skinModel = model;
    return this;
}

// dans ENDEC :
Endec.STRING.fieldOf("skinPng", NPCConfig::getSkinPng),
Endec.STRING.fieldOf("skinModel", NPCConfig::getSkinModel),
```

### 2. Spawn (`me.sailex.secondbrain` — logique de spawn / `NPCSpawner`)

Au moment de créer le `ServerPlayerEntity` (via Carpet/Automatone),
appliquer le skin :

* si `skinPng` est une **URL** → `player.setSkinTextureUrl(url)`
  (le client charge le `.png` directement) ;
* si c'est un **fichier local** → copier dans le dossier `skins/` du mod
  et référencer par `GameProfile` + `setSkinTexture` ;
* forcer le modèle : `alex` → `player.getAppearance().setModelType(ModelType.SLIM)`,
  `steve` → `ModelType.WIDE`.

### 3. GUI (`client/gui`)

Ajouter dans l'écran d'édition du NPC :
* un champ **« Skin (.png) »** (URL ou upload),
* un sélecteur **« Modèle : steve / alex »**.

## Alternative sans fourche

Nommer le NPC (`npcName`) d'après un **compte Minecraft** dont le
skin est celui voulu (Mojang sert la texture du compte). Simple, mais
limité à des skins de comptes existants. C'est ce que fait le Studio
via le champ `mojang_name`.
