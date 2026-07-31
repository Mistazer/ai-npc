#!/usr/bin/env node
/**
 * Himeko Nova -> Optimizer (Node version)
 * Lit les JSON du serveur privé et génère un export compatible Fribbels.
 * Usage:
 *   node himeko_to_optimizer.js --data ../himeko-nova-sr/gameserver/data --uid 10001 --out optimizer.json
 */

const fs = require('fs');
const path = require('path');

function arg(name, def=null){
  const idx = process.argv.indexOf(`--${name}`);
  if(idx>=0 && process.argv[idx+1]) return process.argv[idx+1];
  return def;
}

const dataDir = arg('data');
const uid = parseInt(arg('uid', '10001'));
const outFile = arg('out', `archive_output-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);

if(!dataDir){
  console.log("Usage: node himeko_to_optimizer.js --data <himeko_dir> --uid 10001 --out out.json");
  process.exit(1);
}

function walk(dir){
  let results=[];
  try{
    const list = fs.readdirSync(dir);
    for(const f of list){
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if(stat.isDirectory()){
        results = results.concat(walk(full));
      } else if(full.endsWith('.json') || full.endsWith('.db') || full.endsWith('.sqlite')){
        results.push(full);
      }
    }
  }catch(e){}
  return results;
}

function extract(json){
  let relics=[], lcs=[], chars=[];
  function recurse(obj){
    if(!obj) return;
    if(Array.isArray(obj)){
      obj.forEach(recurse);
      return;
    }
    if(typeof obj !== 'object') return;
    if(obj.relic_list) relics.push(...obj.relic_list);
    if(obj.relics) relics.push(...obj.relics);
    if(obj.equipment_list) lcs.push(...obj.equipment_list);
    if(obj.avatar_list) chars.push(...obj.avatar_list);
    if(obj.avatars) chars.push(...obj.avatars);
    Object.values(obj).forEach(recurse);
  }
  recurse(json);
  return {relics,lcs,chars};
}

let allRelics=[], allLcs=[], allChars=[];
const files = walk(dataDir);
console.log(`[INFO] Found ${files.length} files under ${dataDir}`);
for(const file of files){
  if(!file.includes(String(uid)) && file.endsWith('.json')){
    // Filtrer par UID si possible, mais on scanne tout et on filtre après
  }
  if(file.endsWith('.json')){
    try{
      const content = JSON.parse(fs.readFileSync(file,'utf8'));
      // Si le fichier a un champ uid et ne correspond pas, skip
      if(content.uid && content.uid !== uid) continue;
      const {relics,lcs,chars} = extract(content);
      allRelics.push(...relics);
      allLcs.push(...lcs);
      allChars.push(...chars);
    }catch(e){}
  }
}

console.log(`[INFO] Total: ${allRelics.length} relics, ${allLcs.length} LC, ${allChars.length} chars`);

function toRelic(r){
  return {
    set: String(r.tid ? Math.floor(r.tid/100) : (r.setId||0)),
    slot: r.slot||1,
    rarity: r.rarity||5,
    level: r.level||15,
    mainstat: r.mainAffix?.type || 'ATK',
    mainvalue: r.mainAffix?.value || 0,
    substats: (r.subAffix||[]).map(s=>({key:s.type||'ATK', value:s.value||0})),
    _uid: r.uniqueId || r.id || Math.random().toString(36)
  };
}
function toLC(e){
  return {
    id: String(e.tid||e.id),
    level: e.level||80,
    superimposition: e.rank||1,
    _uid: e.uniqueId||e.id
  };
}
function toChar(a){
  return {
    id: String(a.avatarId||a.baseAvatarId||a.id),
    level: a.level||80,
    eidolon: a.rank||0
  };
}

const out = {
  source: "himeko_nova_direct_js",
  build: "4.4.53-patched-js",
  version: 4,
  metadata: {uid, trailblazer: "Stelle"},
  relics: allRelics.map(toRelic),
  light_cones: allLcs.map(toLC),
  characters: allChars.map(toChar),
  materials: []
};

fs.writeFileSync(outFile, JSON.stringify(out,null,2), 'utf8');
console.log(`[OK] Exported -> ${outFile}`);
