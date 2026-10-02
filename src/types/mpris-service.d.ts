declare module 'mpris-service' {
  interface PlayerOptions { name: string; identity: string; supportedUriSchemes?: string[]; supportedMimeTypes?: string[] }
  interface Player { playbackStatus: string; loopStatus: string; rate: number; volume: number; position: number; metadata: Record<string, unknown>; on(event: string, listener: (...args: unknown[]) => void): void; quit(): void }
  export default function createPlayer(options: PlayerOptions): Player;
}
