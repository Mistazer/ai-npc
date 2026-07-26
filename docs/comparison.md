# Comparaison : pont NeoForge vs SecondBrain (Fabric)

Objectif d'origine (conversation partagée) : un **compagnon Minecraft piloté par
un LLM local** (Ollama), capable de *jouer* (miner, crafter, construire…),
sans dépendre du cloud Player2.

Deux voies sont possibles. Voici une comparaison **fondée sur le code**
(des dépôts `sailex428/SecondBrain` et `sailex428/SecondBrainEngine`, et du
pont `player2-local` de ce dépôt), pas sur des suppositions.

## Verdict rapide

* Si tu veux un compagnon qui **agit vraiment** (mine, craft, construit) en
  local, avec un risque minimal → **SecondBrain (Fabric)** est clairement
  supérieur et plus simple. C'est lui la réalisation complète du rêve de la
  conversation.
* Le **pont NeoForge** garde de la valeur **uniquement** si tu tiens à
  conserver **Player2NPC + PlayerEngine** sur NeoForge, et que tu acceptes
  de faire du reverse-engineering pour que le NPC *agisse* (pas seulement
  cause).

## Ce que chaque voie fait réellement

### SecondBrain (Fabric) — complet et autonome

D'après `SecondBrainEngine/README.md` et `build.gradle.kts` :

> « A serverside fabric lib/mod that combines **Automatone** (pathfinding and
> basic world interactions) with a server-side adaptation of **AltoClef** […] The
> high-level task framework that manages tasks and task chains […] uses Carpet
> to spawn fake `ServerPlayerEntity` instances […] directed through the task
> framework. »

* Moteur d'actions : **AltoClef** (framework d'agents Minecraft
  autonomes) + **Baritone** (pathfinding) + **Automatone** + **Carpet**
  (faux joueurs `ServerPlayerEntity`).
* Exemple officiel : `controller.runUserTask(new ConstructIronGolemTask())`
  → le NPC peut lancer **n'importe quelle tâche AltoClef** (collecter,
  crafter, construire, combattre…).
* LLM local **natif** : dépendance `io.github.ollama4j:ollama4j` (client
  Java Ollama, **aucun bridge nécessaire**). Supporte aussi OpenAI et
  l'app Player2.
* Persistance : `sqlite-jdbc` (mémoire sur disque).
* TTS intégré, GUI `/secondbrain`, multi-NPC.
* Licence LGPL-3.0 (forkable).

→ Le LLM *planifie*, AltoClef *exécute*. Le NPC fait des choses, tout seul.

### Pont NeoForge (`player2-local`) — cerveau uniquement

* Remplace le **cerveau** Player2 (app fermée) par Ollama, en émulant l'API
  locale `127.0.0.1:4315`. Le mod `.jar` n'est pas touché.
* Fournit aujourd'hui des **réponses texte** (dialogue) au format attendu
  par Player2NPC.
* Le **corps** (déplacement, minage) vient de **Player2NPC/PlayerEngine**
  (Baritone), que tu as déjà en JAR.
* ⚠️ **Inconnu critique** : on ne sait pas si Player2NPC sait transformer la
  réponse texte du LLM en **actions** (format d'action de l'app Player2 fermée).
  Le pont tel quel donne un compagnon *bavard*, pas forcément *autonome*.
  Pour qu'il agisse, il faudrait (1) découvrir le format d'action de
  Player2NPC et (2) ajouter du *function calling* au pont — travail
  supplémentaire et incertain.

## Tableau comparatif

| Critère | Pont NeoForge + Player2NPC | SecondBrain (Fabric) |
|---|---|---|
| Modloader | NeoForge 1.21.1 | Fabric (+ Fabric API) |
| LLM local | via pont (Ollama) | **natif** (ollama4j) |
| Reverse-engineering | **nécessaire** (SSE + login ?) | **aucun** |
| Le NPC *parle* | oui (texte) | oui (texte + TTS) |
| Le NPC *agit* (mine/craft) | **incertain** (app fermée) | **oui** (AltoClef + Baritone) |
| Mémoire | par NPC (JSON, notre pont) | SQLite (intégré) |
| Multi-NPC / GUI | basique | oui (`/secondbrain`) |
| Risque global | moyen/élevé | **faible** |
| Contrôle du pipeline | total | via fork LGPL |

## Le point décisif : agir vs parler

La conversation voulait un compagnon qui **joue**. C'est précisément ce que
SecondBrain fait d'emblée (AltoClef). Le pont NeoForge, lui, ne donne
aujourd'hui qu'un cerveau *bavard* à Player2NPC ; la boucle
« LLM → actions » reste du domaine de l'app Player2 fermée, donc à
reverse-engineerer.

## Plan de test sur TA machine (je ne peux pas lancer Minecraft ici)

### A. Valider le pont NeoForge
1. Lance Ollama + `python -m player2_local`.
2. Lance Minecraft + Player2NPC (**sans** l'app Player2 officielle).
3. Fais spawn un NPC et cause-lui. Il doit répondre (texte).
4. **Test d'action** : demande-lui « va miner du fer ». S'il ne bouge
   pas, c'est la limite ci-dessus → il faut capturer le trafic Player2NPC ↔
   app (Wireshark/Fiddler sur `127.0.0.1:4315`) pour le format d'action.

### B. Tester SecondBrain
1. Installe Fabric + Fabric API + SecondBrain (1.20.1 ou 1.21.1).
2. `/secondbrain`, crée un NPC en type `OLLAMA`, colle l'URL Ollama.
3. Demand-lui une tâche (ex. « craft une épée »). AltoClef l'exécute.

## Recommandation

Pour « un compagnon IA qui joue, 100 % local », pars sur **SecondBrain** :
moins de risque, plus complet, déjà prêt. Le pont NeoForge reste utile
**seulement** si tu veux absolument garder Player2NPC/PlayerEngine sur
NeoForge — et dans ce cas, prévois l'étape de capture de trafic.

Le code du pont reste dans ce dépôt (`player2-local/`) : tu peux soit le
poursuivre (ajout du function calling + capture de trafic), soit le laisser
en réserve et adopter SecondBrain.
