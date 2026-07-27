import { mkdir, copyFile, readdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const toolsDir = join(root, '.ci-tools');
const gradleVersion = '8.8';

function run(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

async function ensureGradle() {
  if (commandExists('gradle')) {
    return { command: 'gradle', argsPrefix: [] };
  }

  await mkdir(toolsDir, { recursive: true });
  const gradleHome = join(toolsDir, `gradle-${gradleVersion}`);
  const gradleBin = join(gradleHome, 'bin', 'gradle');
  if (existsSync(gradleBin)) {
    return { command: gradleBin, argsPrefix: [] };
  }

  const zipPath = join(toolsDir, `gradle-${gradleVersion}-bin.zip`);
  const url = `https://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip`;
  run('curl', ['-L', '--fail', '--retry', '3', '-o', zipPath, url]);
  run('unzip', ['-q', '-o', zipPath, '-d', toolsDir]);
  return { command: gradleBin, argsPrefix: [] };
}

async function copyJarsToOut() {
  const libsDir = join(root, 'build', 'libs');
  const outDir = join(root, 'out');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(libsDir)).filter((file) => file.endsWith('.jar'));
  for (const file of files) {
    await copyFile(join(libsDir, file), join(outDir, file));
  }

  const modJar = files.find((file) => !file.endsWith('-sources.jar')) ?? files[0] ?? 'aucun jar';
  await writeFile(join(outDir, 'index.html'), `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8"><title>AI NPC Fabric 1.20.1</title></head>
  <body>
    <h1>AI NPC Fabric 1.20.1</h1>
    <p>Jar principal : <a href="./${modJar}">${modJar}</a></p>
  </body>
</html>
`);

  console.log(`Jars copied to ${resolve(outDir)}: ${files.join(', ')}`);
}

const gradle = await ensureGradle();
run(gradle.command, [...gradle.argsPrefix, 'build', '--no-daemon', '--stacktrace']);
await copyJarsToOut();
