import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { Persistence } from '../../src/persistence/database.js';

const temporary: string[] = [];
afterEach(() => { temporary.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })); });
describe('SQLite persistence', () => { it('round-trips settings, history, favorites, and playlists', async () => { const root = mkdtempSync(join(tmpdir(), 'classicmp-test-')); temporary.push(root); const paths = { config: join(root, 'config'), data: join(root, 'data'), cache: join(root, 'cache'), state: join(root, 'state'), runtime: join(root, 'runtime') }; const db = await Persistence.open(paths); db.setSettings({ theme: 'dark' }); db.saveHistory({ id: 'm1', displayName: 'Demo', identity: 'demo', duration: 120, position: 30, completed: false }); db.saveFavorite({ id: 'f1', name: 'Demo', sourceType: 'file', source: '/tmp/demo.mp4' }); db.savePlaylist('p1', 'Demo list', [{ id: 'i1', sourceType: 'file', source: '/tmp/demo.mp4' }]); expect(db.getSettings()).toEqual({ theme: 'dark' }); expect(db.history()[0]?.[0]).toBe('m1'); expect(db.listFavorites()[0]?.[0]).toBe('f1'); expect(db.getPlaylist('p1')?.items[0]?.[0]).toBe('i1'); db.close(); }); });
