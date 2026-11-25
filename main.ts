import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const log = (msg: string) => console.log(`[sizzle] ${msg}`);
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(rootDir, process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

log('Initializing output directory');
mkdirSync(outDir, { recursive: true });

log('Copying game assets');
cpSync(join(rootDir, 'game'), join(outDir, 'game'), { recursive: true });

const srcScreens = join(rootDir, 'screenshots');
const destScreens = join(outDir, 'screenshots');
if (existsSync(srcScreens)) {
    log('Copying screenshots');
    mkdirSync(destScreens, { recursive: true });
    cpSync(srcScreens, destScreens, { recursive: true });
} else {
    console.warn('[sizzle] Warning: screenshots directory missing');
    mkdirSync(destScreens, { recursive: true });
}

log('Validating screenshot count');
const files = existsSync(destScreens) ? readdirSync(destScreens) : [];
if (files.length === 0 || files.length > 4) {
    throw new Error(`[sizzle] Invalid screenshot count: ${files.length}. Expected 1-4.`);
}

log('Building dossier');
const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000
});

log('Writing dossier.json');
writeFileSync(join(outDir, 'dossier.json'), dossier);

log('Done — game, screenshots and dossier.json are in the output dir.');
