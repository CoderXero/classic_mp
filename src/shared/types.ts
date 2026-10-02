export type MediaSource = { type: 'file' | 'url'; path?: string; url?: string };
export type PlaybackStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'stopped' | 'error';
export interface PlaybackState { status: PlaybackStatus; path: string | null; title: string | null; position: number; duration: number; volume: number; muted: boolean; speed: number; pause: boolean; }
export interface TrackInfo { id: number; type: 'video' | 'audio' | 'sub'; title?: string | undefined; lang?: string | undefined; codec?: string | undefined; default?: boolean | undefined; forced?: boolean | undefined; selected?: boolean | undefined; }
export interface MediaProperties { video: Record<string, unknown>; audio: Record<string, unknown>; metadata: Record<string, unknown>; chapters: unknown[]; tracks: TrackInfo[]; hwdec: string | null; }
export interface ApiBootstrap { baseUrl: string; sessionToken: string; }
