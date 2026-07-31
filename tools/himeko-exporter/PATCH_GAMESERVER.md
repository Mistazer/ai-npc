# Patch Himeko-Nova lui-même pour exporter automatiquement

Si ton serveur ne stocke rien en clair (tout en RAM), le plus simple c'est de patcher **le gameserver** pour qu'il écrive un `optimizer.json` à chaque fois que tu demandes ton sac.

## Où patcher ?

Dans `gameserver/` tu as des handlers genre `GetBagScRsp`, `GetAvatarDataScRsp`. Cherche :

```zig
// gameserver/handler/ ou gameserver/packet/
pub fn handleGetBag(...) {
    var relic_list = player.relics;
    var equipment_list = player.equipments;
    // ...
    try conn.send(Packet.init(.GetBagScRsp, .{ .relic_list = relic_list, ... }));
}
```

Ajoute juste après l'envoi :

```zig
// --- DUMP POUR FRIBBELS ---
const std = @import("std");
var file = std.fs.cwd().createFile("optimizer_export.json", .{ .truncate = true }) catch return;
defer file.close();

// Construis une structure simple compatible Fribbels v4
// Tu peux copier la logique de export.py mais en Zig
const dump = .{
    .source = "himeko_nova_server_dump",
    .version = 4,
    .metadata = .{ .uid = player.uid, .trailblazer = "Stelle" },
    .relics = relic_list,
    .light_cones = equipment_list,
    .characters = avatar_list,
};

std.json.stringify(dump, .{ .whitespace = .indent_2 }, file.writer()) catch {};
std.log.info("Exported optimizer.json for uid {d}", .{player.uid});
```

## Version encore plus simple : commande chat

Himeko a des commandes GM en chat (`/give`, `/heal`...). Ajoute-en une `/export` :

Dans `gameserver/command/` :

```zig
pub fn handleExportCommand(player: *Player, args: []const u8) !void {
    const path = try std.fmt.allocPrint(allocator, "export_{d}.json", .{player.uid});
    // même code de dump que ci-dessus
    try player.sendMessage("Export fait ! Fichier: " ++ path);
}
```

Puis dans le jeu, tape `/export` et récupère le fichier dans le dossier du serveur.

## Besoin d'aide ?

Envoie-moi:
- Un screenshot de ton dossier `himeko-nova-sr/gameserver/` (liste fichiers)
- Ou un petit fichier `.json` de `gameserver/data/` (même vide)

Je te ferai le patch exact pour ta version.
