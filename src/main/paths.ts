import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const xdg = (name: string, fallback: string) => process.env[name] || path.join(os.homedir(), fallback);
export interface AppPaths { config: string; data: string; cache: string; state: string; runtime: string; }
export function getAppPaths(): AppPaths { const p = { config: path.join(xdg('XDG_CONFIG_HOME', '.config'), 'classicmp'), data: path.join(xdg('XDG_DATA_HOME', '.local/share'), 'classicmp'), cache: path.join(xdg('XDG_CACHE_HOME', '.cache'), 'classicmp'), state: path.join(xdg('XDG_STATE_HOME', '.local/state'), 'classicmp'), runtime: path.join(process.env.XDG_RUNTIME_DIR || path.join(os.tmpdir(), `classicmp-${process.getuid?.() ?? 'user'}`), 'classicmp') }; Object.values(p).forEach((v) => fs.mkdirSync(v, { recursive: true, mode: 0o700 })); return p; }
