# ClassicMP

ClassicMP is a Linux-first desktop media player with a classic, keyboard-friendly interface. It uses Electron and React for the UI, a loopback-only authenticated REST service for business operations, SQLite for local state, and mpv for playback.

## Development

Requirements: Node.js LTS, mpv, and a Linux desktop environment.

```bash
npm install
npm run typecheck
npm test
npm run build
npm start
```

The renderer is sandboxed, has no Node integration, and never connects to mpv. The local API binds to `127.0.0.1` and requires a cryptographically random per-launch bearer token.

The current UI includes playlist, history/resume, favorites, saved-playlist, theme settings, screenshot, playback-speed, and volume controls. On Linux desktop sessions ClassicMP exposes MPRIS controls when a session D-Bus is available; headless sessions continue without it.

ClassicMP is an independent clean-room implementation inspired by the usability philosophy of MPC-HC and is not affiliated with or endorsed by MPC-HC developers.
