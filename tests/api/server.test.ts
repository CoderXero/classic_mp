import { afterEach, describe, expect, it } from 'vitest';
import { createApi } from '../../src/api/server.js';

const state = { status: 'idle', path: null, title: null, position: 0, duration: 0, volume: 100, muted: false, speed: 1, pause: true };
function fakeContext() {
  const memory = { favorites: [] as unknown[], playlists: [] as unknown[] };
  const persistence = {
    getSettings: () => ({}), setSettings: () => undefined, resetSettings: () => undefined,
    history: () => [], saveHistory: () => undefined, deleteHistory: () => undefined, getResume: () => null,
    listFavorites: () => memory.favorites, saveFavorite: (item: unknown) => memory.favorites.push(item), deleteFavorite: () => undefined,
    listPlaylists: () => memory.playlists, savePlaylist: (id: string, name: string) => memory.playlists.push([id, name, '', '']), getPlaylist: () => null, deletePlaylist: () => undefined,
  };
  const mpv = { getState: () => state, open: () => undefined, play: () => undefined, pause: () => undefined, stop: () => undefined, seek: () => undefined, frameStep: () => undefined, setSpeed: () => undefined, setVolume: () => undefined, toggleMute: () => undefined, screenshot: () => 'shot.png', selectTrack: () => undefined, loadSubtitle: () => undefined, loadAudio: () => undefined, setDelay: () => undefined };
  return { mpv, persistence };
}

describe('authenticated local API', () => {
  let api: Awaited<ReturnType<typeof createApi>> | undefined;
  afterEach(async () => { await api?.app.close(); });
  it('rejects requests without the per-launch bearer token', async () => { const context = fakeContext(); api = await createApi({ ...context, version: 'test', screenshotDirectory: '/tmp' } as never); const response = await api.app.inject({ method: 'GET', url: '/api/v1/app/status' }); expect(response.statusCode).toBe(401); });
  it('serves validated favorites with the bearer token', async () => { const context = fakeContext(); api = await createApi({ ...context, version: 'test', screenshotDirectory: '/tmp' } as never); const response = await api.app.inject({ method: 'POST', url: '/api/v1/favorites', headers: { authorization: `Bearer ${api.token}` }, payload: { id: 'f1', name: 'Demo', sourceType: 'file', source: '/tmp/demo.mp4' } }); expect(response.statusCode).toBe(200); expect(JSON.parse(response.body).name).toBe('Demo'); });
});
