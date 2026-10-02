import { spawn, type ChildProcess } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import type { MediaProperties, PlaybackState, TrackInfo } from '../../shared/types.js';

export class MpvAdapter extends EventEmitter {
  private child: ChildProcess | null = null;
  private socket: net.Socket | null = null;
  private id = 0;
  private buffer = '';
  private state: PlaybackState = { status: 'idle', path: null, title: null, position: 0, duration: 0, volume: 100, muted: false, speed: 1, pause: true };
  private properties: MediaProperties = { video: {}, audio: {}, metadata: {}, chapters: [], tracks: [], hwdec: null };

  getState() { return { ...this.state }; }
  getMediaProperties() { return { ...this.properties, tracks: [...this.properties.tracks], chapters: [...this.properties.chapters] }; }

  async start(socketPath: string, binary = 'mpv', forceWindow = true, windowId?: string) {
    fs.rmSync(socketPath, { force: true });
    const args = ['--idle=yes', '--terminal=no', `--input-ipc-server=${socketPath}`, `--force-window=${forceWindow ? 'yes' : 'no'}`, '--no-input-default-bindings'];
    if (windowId) args.push(`--wid=${windowId}`);
    this.child = spawn(binary, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    this.child.on('exit', (code) => { this.state.status = 'error'; this.emit('exit', code); });
    await new Promise<void>((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error('mpv IPC connection timeout')), 5000);
      const connect = () => {
        const socket = net.createConnection(socketPath, () => { clearTimeout(deadline); this.socket = socket; socket.on('data', (data) => this.read(data.toString())); this.observe(); resolve(); });
        socket.once('error', () => { socket.destroy(); if (this.child?.exitCode === null) setTimeout(connect, 50); else { clearTimeout(deadline); reject(new Error('mpv exited')); } });
      };
      connect();
    });
  }

  private read(data: string) { this.buffer += data; let index: number; while ((index = this.buffer.indexOf('\n')) >= 0) { const line = this.buffer.slice(0, index); this.buffer = this.buffer.slice(index + 1); try { const message = JSON.parse(line) as { event?: string; name?: string; data?: unknown }; if (message.event === 'property-change' && message.name) this.property(message.name, message.data); } catch { /* Ignore malformed diagnostic lines. */ } } }
  private property(name: string, value: unknown) {
    if (name === 'pause') { this.state.pause = Boolean(value); this.state.status = this.state.pause ? 'paused' : 'playing'; }
    else if (name === 'time-pos') this.state.position = typeof value === 'number' ? value : 0;
    else if (name === 'duration') this.state.duration = typeof value === 'number' ? value : 0;
    else if (name === 'volume') this.state.volume = typeof value === 'number' ? value : 100;
    else if (name === 'mute') this.state.muted = Boolean(value);
    else if (name === 'speed') this.state.speed = typeof value === 'number' ? value : 1;
    else if (name === 'media-title') this.state.title = typeof value === 'string' ? value : null;
    else if (name === 'track-list' && Array.isArray(value)) this.properties.tracks = value.filter((item): item is TrackInfo => typeof item === 'object' && item !== null && typeof (item as { id?: unknown }).id === 'number').map((item) => ({ id: item.id, type: item.type, title: item.title, lang: item.lang, codec: item.codec, default: item.default, forced: item.forced, selected: item.selected }));
    else if (name === 'chapter-list' && Array.isArray(value)) this.properties.chapters = value;
    else if (name === 'video-params' && typeof value === 'object' && value) this.properties.video = value as Record<string, unknown>;
    else if (name === 'audio-params' && typeof value === 'object' && value) this.properties.audio = value as Record<string, unknown>;
    else if (name === 'metadata' && typeof value === 'object' && value) this.properties.metadata = value as Record<string, unknown>;
    else if (name === 'hwdec-current') this.properties.hwdec = typeof value === 'string' ? value : null;
    this.emit('state', this.getState()); this.emit('properties', this.getMediaProperties());
  }
  private observe() { ['pause', 'time-pos', 'duration', 'volume', 'mute', 'speed', 'media-title', 'track-list', 'chapter-list', 'video-params', 'audio-params', 'metadata', 'hwdec-current'].forEach((name) => this.command('observe_property', [1, name])); }
  command(command: string, args: unknown[] = []) { if (!this.socket) throw new Error('Playback engine is not ready'); this.socket.write(`${JSON.stringify({ command: [command, ...args], request_id: ++this.id })}\n`); }
  open(source: string) { this.state.path = source; this.state.status = 'ready'; this.command('loadfile', [source, 'replace']); this.emit('state', this.getState()); }
  play() { this.command('set_property', ['pause', false]); }
  pause() { this.command('set_property', ['pause', true]); }
  stop() { this.command('stop'); this.state.status = 'stopped'; }
  seek(seconds: number, relative = true) { this.command('seek', [seconds, relative ? 'relative' : 'absolute']); }
  setSpeed(speed: number) { this.command('set_property', ['speed', speed]); }
  setVolume(volume: number) { this.command('set_property', ['volume', volume]); }
  toggleMute() { this.command('cycle', ['mute']); }
  frameStep(back = false) { this.command(back ? 'frame-back-step' : 'frame-step'); }
  selectTrack(kind: 'aid' | 'vid' | 'sid', id: number | 'no') { this.command('set_property', [kind, id]); }
  loadSubtitle(path: string) { this.command('sub-add', [path]); }
  loadAudio(path: string) { this.command('audio-add', [path]); }
  setDelay(kind: 'audio-delay' | 'sub-delay', seconds: number) { this.command('set_property', [kind, seconds]); }
  screenshot(directory: string) { fs.mkdirSync(directory, { recursive: true, mode: 0o700 }); const name = `classicmp-${new Date().toISOString().replaceAll(':', '').replaceAll('.', '')}.png`; this.command('screenshot-to-file', [`${directory}/${name}`, 'video']); return name; }
  close() { try { this.command('quit'); } catch { /* Already stopped. */ } this.socket?.destroy(); this.child?.kill(); this.socket = null; this.child = null; }
}
