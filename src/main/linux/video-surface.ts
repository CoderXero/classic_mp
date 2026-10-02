import type { BrowserWindow } from 'electron';
export type VideoSurfaceStrategy = { mode: 'embedded-x11' | 'managed-wayland' | 'managed-fallback'; windowId?: string; reason: string };
export function resolveVideoSurface(window: BrowserWindow): VideoSurfaceStrategy {
  const wayland = Boolean(process.env.WAYLAND_DISPLAY) || process.env.XDG_SESSION_TYPE === 'wayland';
  if (!wayland && (process.env.XDG_SESSION_TYPE === 'x11' || process.env.DISPLAY)) { const handle = window.getNativeWindowHandle(); if (handle.length >= 4) return { mode: 'embedded-x11', windowId: `0x${handle.readUInt32LE(0).toString(16)}`, reason: 'X11 native window handle available' }; return { mode: 'managed-fallback', reason: 'X11 session has no usable native window handle' }; }
  if (wayland) return { mode: 'managed-wayland', reason: 'Wayland compositor uses a managed companion surface' };
  return { mode: 'managed-fallback', reason: 'Display protocol was not detected' };
}
