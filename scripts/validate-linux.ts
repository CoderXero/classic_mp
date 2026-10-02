import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const checks: Record<string, boolean> = { mpv: existsSync('/usr/bin/mpv') || existsSync('/bin/mpv'), desktopEntry: existsSync('build/linux/classicmp.desktop'), waylandManagedFallback: process.env.XDG_SESSION_TYPE === 'wayland' || Boolean(process.env.WAYLAND_DISPLAY), x11Available: Boolean(process.env.DISPLAY) };
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? 'PASS' : 'SKIP'} ${name}`);
if (checks.mpv) console.log(execFileSync('mpv', ['--version'], { encoding: 'utf8' }).split('\n')[0]);
if (!checks.desktopEntry) process.exitCode = 1;
