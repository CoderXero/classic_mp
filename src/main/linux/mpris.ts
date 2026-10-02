import type { MpvAdapter } from '../../playback/mpv/MpvAdapter.js';
import type { PlaybackState } from '../../shared/types.js';

export async function startMpris(mpv: MpvAdapter) {
  if (process.platform !== 'linux') return null;
  try {
    const { default: createPlayer } = await import('mpris-service');
    const player = createPlayer({ name: 'classicmp', identity: 'ClassicMP', supportedUriSchemes: ['file', 'http', 'https'], supportedMimeTypes: ['video/mp4', 'video/x-matroska', 'audio/mpeg', 'audio/flac'] });
    const state = () => mpv.getState();
    player.on('play', () => mpv.play()); player.on('pause', () => mpv.pause()); player.on('playpause', () => state().pause ? mpv.play() : mpv.pause()); player.on('stop', () => mpv.stop()); player.on('seek', (offset: unknown) => mpv.seek(Number(offset) / 1000000)); player.on('setposition', (position: unknown) => mpv.seek(Number(position) / 1000000, false)); player.on('volume', (volume: unknown) => mpv.setVolume(Math.max(0, Math.min(130, Number(volume) * 100))));
    const update = (value: PlaybackState) => { player.playbackStatus = value.status === 'playing' ? 'Playing' : value.status === 'paused' ? 'Paused' : 'Stopped'; player.position = value.position * 1000000; player.rate = value.speed; player.volume = value.volume / 100; player.metadata = value.path ? { 'mpris:trackid': `/com/zambeziblue/classicmp/${encodeURIComponent(value.path)}`, 'xesam:url': value.path, 'xesam:title': value.title || value.path } : {}; };
    (mpv as unknown as { on: (event: string, listener: (value: PlaybackState) => void) => void }).on('state', update); update(state()); return player;
  } catch { return null; }
}
