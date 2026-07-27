# AI NPC — Mod Minecraft Fabric 1.20.1

AI NPC est un mod **Fabric 1.20.1** qui ajoute des PNJ IA autonomes dans Minecraft. Les PNJ peuvent apparaître dans le monde, se déplacer seuls, suivre un joueur, attendre à un endroit et discuter via une interface de chat en jeu.

Le projet s'inspire de mods comme **Player2NPC** et **Verity JE**, mais l'implémentation actuelle est un MVP autonome : aucune clé API externe n'est nécessaire.

## Fonctionnalités

- Entité personnalisée persistante `PNJ IA` avec texture, nom visible et sons de villageois.
- Œuf d'apparition dans l'onglet des œufs de créatures.
- Comportements autonomes : exploration, attente, suivi du joueur, retour près d'une zone mémorisée, fuite en cas de danger.
- Personnalités persistantes : `amical`, `curieux`, `gardien`, `marchand`, `voyageur`.
- Mémoire simple persistée en NBT : humeur, confiance, dernier interlocuteur, activité actuelle.
- Interface de discussion accessible par clic droit.
- Réponses contextuelles et ordres en langage naturel :
  - `suis-moi`
  - `attends ici`
  - `explore`
  - `cette zone est notre maison`
  - `comment vas-tu ?`
- Commande admin pour ajouter une IA précisément.

## Prérequis

- Minecraft Java **1.20.1**
- Fabric Loader **0.15+**
- Fabric API **0.92.2+1.20.1**
- Java/JDK **17**

Le wrapper Gradle est inclus (`gradlew` / `gradlew.bat`) : tu n'as pas besoin d'installer Gradle séparément.

## Build

### Linux / macOS

```bash
java -version   # doit afficher 17
./gradlew build
```

### Windows PowerShell

Le plus simple est d'utiliser le script fourni, qui cherche automatiquement un JDK 17 installé puis lance Gradle avec ce Java :

```powershell
.\build-java17.bat
```

Sinon, en manuel :

```powershell
java -version   # doit afficher 17
.\gradlew.bat --stop
.\gradlew.bat build
```

Le fichier `.jar` sera généré dans :

```text
build/libs/ai-npc-0.1.0.jar
```

### Si ton terminal utilise encore Java 11

Fabric 1.20.1 a besoin de Java 17. Installe un JDK 17 puis pointe `JAVA_HOME` dessus avant de lancer le build.

Windows PowerShell, exemple avec Eclipse Temurin :

```powershell
winget install EclipseAdoptium.Temurin.17.JDK
.\build-java17.bat
```

Ou en définissant Java à la main :

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
.\gradlew.bat --stop
.\gradlew.bat build
```

Linux, exemple Debian/Ubuntu :

```bash
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
java -version
./gradlew build
```

macOS, exemple Homebrew :

```bash
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
java -version
./gradlew build
```

> Dans cet environnement Arena, le réseau système vers Maven/Fabric est bloqué, donc le build complet n'a pas pu être exécuté ici. Le projet est configuré comme un projet Fabric Loom standard et le wrapper Gradle est fourni.

## Installation

1. Compile le mod avec `gradle build`.
2. Installe Fabric Loader 1.20.1.
3. Place dans ton dossier `mods/` :
   - `ai-npc-0.1.0.jar`
   - `fabric-api-0.92.2+1.20.1.jar`
4. Lance Minecraft.

## Utilisation en jeu

### Ajouter une IA

- En créatif : utilise l'item **Œuf d'apparition de PNJ IA**.
- En commande :

```mcfunction
/ainpc spawn
/ainpc spawn amical Luna
/ainpc spawn gardien Atlas
/ainpc personnalites
```

### Discuter

Fais un clic droit sur un PNJ IA. Une interface de discussion s'ouvre.

Exemples de messages :

```text
Salut
Suis-moi
Attends ici
Explore
Cette zone est notre maison
Comment vas-tu ?
Qui es-tu ?
Aide
```

## Architecture

```text
src/main/java/fr/mistazer/ainpc/
  AiNpcMod.java                  Entrypoint serveur/commun
  client/
    AiNpcClient.java             Entrypoint client
    gui/AiNpcChatScreen.java     Interface de chat
    render/AiNpcRenderer.java    Rendu du PNJ
  command/AiNpcCommands.java     Commandes /ainpc
  dialogue/AiNpcDialogue.java    Moteur de réponses contextuelles
  entity/
    AiNpcEntity.java             Entité IA
    AiNpcActivity.java           États autonomes
    AiNpcPersonality.java        Personnalités
    goal/                        Goals IA Minecraft
  network/AiNpcNetworking.java   Paquets client/serveur
  registry/                      Enregistrement entité + item
```

## Prochaines améliorations possibles

- Ajouter un vrai connecteur LLM optionnel (Ollama local, OpenAI-compatible, LM Studio, etc.).
- Ajouter des skins configurables par personnalité.
- Sauvegarder un historique de conversation plus long.
- Donner des tâches plus avancées aux PNJ : récolte, garde de zone, retour à la base, patrouille.
- Ajouter un écran d'administration pour créer/modifier les IA sans commande.

## Licence

MIT
