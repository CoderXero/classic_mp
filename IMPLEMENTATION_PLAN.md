# ClassicMP implementation plan

- [x] Secure Electron shell, preload bridge, CSP, and single-instance lock
- [x] Loopback REST API with per-launch bearer authentication and Zod request validation
- [x] mpv lifecycle and JSON IPC adapter without shell execution
- [x] SQLite persistence using sql.js and XDG data paths
- [x] React playback controls, file picker, volume, speed, seek, fullscreen, screenshot
- [x] Typecheck, unit-test, and renderer build commands
- [x] Playlist/history/resume/favorites persistence and service routes
- [x] Playlist/history/resume/favorites renderer UI
- [x] Track, subtitle, media-information, and settings API operations
- [x] Track, subtitle, media-information, and advanced settings screens
- [x] MPRIS session-bus runtime service with headless fallback
- [x] Managed mpv companion video window fallback enabled for Linux playback
- [x] Native mpv embedding strategy validation on X11; managed fallback validation on Wayland
- [x] Real-mpv IPC integration, accessibility checks, and Debian/AppImage packaging certification
- [x] Electron launch E2E smoke certification
- [ ] Full Playwright interaction E2E certification on supported desktop sessions

The unchecked items are intentionally isolated behind the current service/API boundaries so they can be added without weakening the renderer trust model.
