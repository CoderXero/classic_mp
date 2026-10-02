import { describe, expect, it, vi } from 'vitest';
import type { BrowserWindow } from 'electron';
import { resolveVideoSurface } from '../../src/main/linux/video-surface.js';
const windowWithHandle = (handle: Buffer) => ({ getNativeWindowHandle: () => handle }) as unknown as BrowserWindow;
describe('Linux video surface selection', () => { it('selects X11 embedding when a native handle is available', () => { vi.stubEnv('XDG_SESSION_TYPE', 'x11'); vi.stubEnv('WAYLAND_DISPLAY', ''); vi.stubEnv('DISPLAY', ':0'); expect(resolveVideoSurface(windowWithHandle(Buffer.from([0x78, 0x56, 0x34, 0x12]))).mode).toBe('embedded-x11'); vi.unstubAllEnvs(); }); it('selects managed Wayland fallback even when XWayland is also present', () => { vi.stubEnv('XDG_SESSION_TYPE', 'wayland'); vi.stubEnv('WAYLAND_DISPLAY', 'wayland-0'); vi.stubEnv('DISPLAY', ':0'); expect(resolveVideoSurface(windowWithHandle(Buffer.alloc(8))).mode).toBe('managed-wayland'); vi.unstubAllEnvs(); }); });
