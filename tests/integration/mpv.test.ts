import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MpvAdapter } from '../../src/playback/mpv/MpvAdapter.js';
const available = existsSync('/usr/bin/mpv') || existsSync('/bin/mpv');
describe.skipIf(!available)('real mpv IPC integration', () => { it('starts, observes properties, and shuts down through JSON IPC', async () => { const root = mkdtempSync(join(tmpdir(), 'classicmp-mpv-')); const adapter = new MpvAdapter(); try { await adapter.start(join(root, 'mpv.sock')); expect(adapter.getState().status).toBe('idle'); adapter.setVolume(80); adapter.setSpeed(1.25); expect(adapter.getMediaProperties().tracks).toEqual([]); } finally { adapter.close(); rmSync(root, { recursive: true, force: true }); } }); });
