# ClassicMP — Production System Specification

**Application name:** ClassicMP  
**Application type:** Linux desktop media player  
**Primary platform:** Linux  
**Desktop framework:** Electron + TypeScript  
**Renderer:** React + TypeScript  
**Playback engine:** mpv controlled through JSON IPC  
**Business interface:** Local REST API  
**Authentication:** Optional OIDC integration using `https://iam.zambeziblue.com/.well-known/openid-configuration` for cloud/remote features only  
**Specification status:** Implementation-ready  
**Target deliverable:** Production-quality open-source desktop media player inspired by the usability and feature philosophy of Media Player Classic - Home Cinema (MPC-HC)

---

## 1. Executive Summary

ClassicMP is a lightweight, keyboard-friendly, Linux-first desktop media player inspired by the interaction model and practical feature set of Media Player Classic - Home Cinema.

ClassicMP is not a source-code port of MPC-HC. It is a clean-room Linux implementation with its own branding, assets, user interface implementation, architecture, and codebase.

The application will use Electron for the desktop shell and user interface, TypeScript across the application, React for renderer components, and mpv as the media playback engine.

The application must preserve the qualities that make classic desktop media players useful:

- fast startup
- uncluttered interface
- strong keyboard control
- broad media-format support
- high-quality video and audio playback
- flexible subtitle handling
- configurable playback behavior
- playlists
- recent-file history
- resume playback
- aspect-ratio and zoom controls
- screenshots
- playback statistics
- media information
- audio/video/subtitle track selection
- frame stepping
- playback-speed control
- fullscreen operation
- always-on-top modes
- multiple-monitor awareness
- Linux desktop integration

Business operations exposed by the desktop application must be accessed through a versioned REST API hosted locally by the ClassicMP process.

The renderer must not directly control mpv, access arbitrary files, execute shell commands, or own privileged operating-system functionality.

The high-level architecture is:

```text
┌─────────────────────────────────────────────────────────────┐
│                         ClassicMP                           │
│                                                             │
│  ┌────────────────────┐                                     │
│  │ Electron Renderer  │                                     │
│  │ React + TypeScript │                                     │
│  └─────────┬──────────┘                                     │
│            │ HTTP / REST                                    │
│            ▼                                                │
│  ┌────────────────────┐                                     │
│  │ Local REST Service │                                     │
│  │ 127.0.0.1 only     │                                     │
│  └─────────┬──────────┘                                     │
│            │                                                │
│            ▼                                                │
│  ┌────────────────────┐        JSON IPC                     │
│  │ Playback Service   │──────────────────────┐              │
│  └────────────────────┘                      │              │
│                                              ▼              │
│                                     ┌────────────────┐      │
│                                     │      mpv       │      │
│                                     │ Playback Core  │      │
│                                     └────────────────┘      │
│                                                             │
│  Main Process owns privileged OS functionality              │
└─────────────────────────────────────────────────────────────┘
```

ClassicMP will initially target:

- Ubuntu 24.04 LTS and newer
- Linux Mint versions based on supported Ubuntu releases
- Debian 12 and newer
- Fedora 40 and newer

The primary release formats will be:

- AppImage
- `.deb`

Flatpak support is planned as a secondary distribution target after the primary desktop integration is stable.

---

## 2. Product Goals

ClassicMP must provide:

1. A familiar classic desktop media-player layout.
2. Excellent local media playback.
3. Broad format support through mpv and its underlying media stack.
4. Reliable subtitle support.
5. Fast access to common media controls.
6. Keyboard-first operation.
7. Low UI complexity.
8. Configurable behavior without requiring hand-edited configuration files.
9. Linux desktop integration.
10. Secure Electron defaults.
11. A clean separation between UI, REST business APIs, and the playback engine.
12. A codebase that can be maintained by humans or AI coding agents.
13. Automated testing and reproducible packaging.
14. No dependency on a remote service for ordinary local playback.
15. Graceful behavior when offline.

---

## 3. Non-Goals

Version 1 will not attempt to provide:

- a Windows implementation
- a macOS implementation
- Blu-ray decryption
- DVD or Blu-ray DRM circumvention
- proprietary streaming-service integration
- Netflix, Hulu, Prime Video, Disney+, or similar DRM streaming
- torrent downloading
- peer-to-peer streaming
- media-server functionality
- a Plex/Jellyfin replacement
- video editing
- transcoding studio functionality
- live television tuner support
- media recording from capture cards
- arbitrary third-party Electron plugins
- arbitrary mpv Lua script installation from the Internet
- an embedded web browser
- cloud dependence for basic media playback

Future versions may add selected capabilities where technically and legally appropriate.

---

## 4. Clean-Room / Compatibility Position

ClassicMP is inspired by the workflow and feature philosophy of MPC-HC.

The implementation must not:

- copy MPC-HC source code into ClassicMP
- copy MPC-HC artwork, icons, logos, or trademarks
- reproduce copyrighted UI assets
- claim to be MPC-HC
- imply endorsement by MPC-HC developers
- reuse trademark-confusing branding

Functional similarities such as play/pause controls, seek bars, track menus, fullscreen controls, subtitle selection, playlists, and keyboard shortcuts are ordinary media-player behaviors and may be implemented independently.

The project must use original:

- application name
- logo
- icon set
- installer artwork
- theme assets
- screenshots
- documentation

The project name is:

**ClassicMP**

Suggested desktop display name:

**ClassicMP Media Player**

Suggested application identifier:

```text
com.zambeziblue.classicmp
```

---

## 5. Product Philosophy

ClassicMP should feel like a traditional desktop application rather than a streaming-service UI.

The design priorities are:

1. Playback first.
2. Minimal chrome.
3. Immediate response.
4. Keyboard accessibility.
5. Native-like menus.
6. Dense but understandable settings.
7. No advertisements.
8. No content recommendations.
9. No telemetry by default.
10. No account requirement for local playback.

The default main window should resemble the functional shape of classic media players:

```text
┌──────────────────────────────────────────────────────────────┐
│ File  View  Play  Navigate  Favorites  Help                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                        VIDEO AREA                            │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 00:14:23 ━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━ 01:42:10            │
├──────────────────────────────────────────────────────────────┤
│ ◀◀   ▶/❚❚   ■   ▶▶      🔊 ━━━━━━━      1.00x      ⛶        │
└──────────────────────────────────────────────────────────────┘
```

The renderer must support compact mode where menu/status/toolbars can be hidden.

---

## 6. Technology Stack

### 6.1 Desktop Shell

Use:

- Electron
- Node.js
- TypeScript
- React
- Vite

Use strict TypeScript.

Required TypeScript options include:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

### 6.2 Playback Engine

Use mpv as the playback engine.

ClassicMP launches and supervises an mpv subprocess.

ClassicMP communicates with mpv exclusively through its supported command/property interface using JSON IPC over a Unix domain socket.

ClassicMP must not:

- parse mpv terminal output as a control protocol
- simulate keyboard input into mpv
- expose the mpv IPC socket to external untrusted processes
- construct unsafe shell command strings from user or API input

mpv should normally launch with:

```text
--idle=yes
--terminal=no
--input-ipc-server=<private-socket>
--force-window=no
--no-input-default-bindings
```

Additional settings will be generated from ClassicMP configuration.

ClassicMP should use its own mpv configuration directory to prevent unexpected behavior caused by the user's standalone mpv configuration.

Example:

```text
$XDG_CONFIG_HOME/classicmp/mpv/
```

### 6.3 Local Database

Use SQLite for local persistent state.

SQLite stores:

- application preferences requiring structured storage
- playback history
- resume positions
- favorites
- playlists
- recent files
- per-file settings
- bookmark metadata
- media metadata cache

Do not store OAuth tokens in SQLite.

Use a lightweight, actively maintained Node SQLite library.

Database schema changes must use numbered migrations.

### 6.4 Secure Credential Storage

If remote account functionality is enabled, use the operating system's Secret Service API where available.

Supported implementations may include:

- GNOME Keyring
- KDE Wallet through compatible Secret Service integration

If secure secret storage is unavailable:

- do not silently store refresh tokens in plaintext
- inform the user
- allow session-only authentication
- provide clear configuration behavior

---

## 7. System Architecture

### 7.1 Major Components

ClassicMP consists of:

1. Electron main process
2. Electron preload layer
3. React renderer
4. Local REST API server
5. Playback service
6. mpv subprocess
7. Persistence service
8. Metadata service
9. Thumbnail/preview service
10. Subtitle service
11. Playlist service
12. Settings service
13. Linux integration service
14. Optional authentication service
15. Optional update service

### 7.2 Trust Boundaries

```text
LOWER TRUST
┌─────────────────────────────┐
│ React Renderer              │
│ HTML / CSS / UI State       │
└──────────────┬──────────────┘
               │ authenticated loopback REST
               ▼
┌─────────────────────────────┐
│ Local REST Service          │
│ Validation + authorization  │
└──────────────┬──────────────┘
               │ internal calls
               ▼
┌─────────────────────────────┐
│ Trusted Main Services       │
│ Playback / Files / Storage  │
└──────────────┬──────────────┘
               │ JSON IPC
               ▼
┌─────────────────────────────┐
│ mpv Process                 │
└─────────────────────────────┘

HIGHER TRUST
```

The renderer is not permitted to:

- spawn processes
- execute commands
- read arbitrary files directly
- access Node.js modules
- access environment variables
- connect directly to the mpv IPC socket
- write application configuration files directly

---

## 8. Electron Security Configuration

Every BrowserWindow must use:

```typescript
{
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false
  }
}
```

The renderer must load only packaged local application content.

The application must not use:

- `nodeIntegration: true`
- `contextIsolation: false`
- `webSecurity: false`
- `allowRunningInsecureContent: true`
- `eval`
- remote JavaScript
- remote HTML as the application UI

A restrictive Content Security Policy must be defined.

Initial policy:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
media-src 'self' blob:;
connect-src 'self' http://127.0.0.1:*;
object-src 'none';
frame-src 'none';
base-uri 'none';
form-action 'none';
```

The implementation should eliminate `'unsafe-inline'` for styles if practical.

---

## 9. REST API Architecture

### 9.1 Purpose

ClassicMP uses a local REST API as the application's business-logic boundary.

The React renderer calls REST endpoints instead of directly manipulating the playback service, database, or filesystem.

### 9.2 Binding

The REST service must:

- bind only to `127.0.0.1`
- use an ephemeral port by default
- never bind to `0.0.0.0`
- never expose the API over the LAN by default

At startup:

1. main process generates a cryptographically random session token
2. main process starts REST server
3. REST server binds to loopback
4. preload layer exposes only REST connection bootstrap information to the packaged renderer
5. renderer sends the session token through an authorization header
6. REST server rejects requests without the valid session token

Example:

```http
Authorization: Bearer <ephemeral-local-session-token>
```

The token:

- is generated at every application launch
- is never persisted
- must be at least 256 bits of cryptographically secure entropy
- must never be logged

### 9.3 API Prefix

```text
/api/v1
```

### 9.4 Response Envelope

Successful requests may return direct typed resources.

Errors must use:

```json
{
  "error": {
    "code": "PLAYBACK_NOT_READY",
    "message": "Playback engine is not ready.",
    "details": {},
    "requestId": "uuid"
  }
}
```

### 9.5 Standard Error Codes

Use:

- 400 — invalid request
- 401 — invalid local application session
- 403 — operation prohibited
- 404 — resource not found
- 409 — state conflict
- 413 — request/file too large
- 422 — validation error
- 429 — request rate limited
- 500 — unexpected internal error
- 502 — mpv/backend interaction failure
- 503 — playback service unavailable

---

## 10. REST API Contract

### 10.1 Application

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/app/status` | Application and playback-service health |
| GET | `/api/v1/app/version` | Application/API version |
| POST | `/api/v1/app/quit` | Gracefully quit ClassicMP |
| POST | `/api/v1/app/restart` | Restart application when supported |

### 10.2 Playback

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/playback` | Current playback state |
| POST | `/api/v1/playback/open` | Open media |
| POST | `/api/v1/playback/play` | Start/resume |
| POST | `/api/v1/playback/pause` | Pause |
| POST | `/api/v1/playback/toggle` | Toggle play/pause |
| POST | `/api/v1/playback/stop` | Stop |
| POST | `/api/v1/playback/seek` | Seek |
| POST | `/api/v1/playback/frame-step` | Advance one frame |
| POST | `/api/v1/playback/frame-back-step` | Step backward when supported |
| PUT | `/api/v1/playback/speed` | Change playback rate |
| PUT | `/api/v1/playback/volume` | Set volume |
| POST | `/api/v1/playback/mute` | Toggle/set mute |
| PUT | `/api/v1/playback/loop` | Configure repeat behavior |

Example open request:

```json
{
  "source": {
    "type": "file",
    "path": "/home/user/Videos/movie.mkv"
  },
  "mode": "replace"
}
```

Supported source types:

- file
- directory
- URL
- playlist

URL playback must support an allow/deny policy.

Local REST calls must never accept `file://` URLs as a substitute for validated paths.

### 10.3 Tracks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/playback/tracks` | List video/audio/subtitle tracks |
| PUT | `/api/v1/playback/tracks/audio` | Select audio track |
| PUT | `/api/v1/playback/tracks/video` | Select video track |
| PUT | `/api/v1/playback/tracks/subtitle` | Select subtitle track |
| POST | `/api/v1/playback/subtitles/load` | Load external subtitle |
| POST | `/api/v1/playback/audio/load` | Load external audio track |

### 10.4 Video

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/video/settings` | Current video settings |
| PUT | `/api/v1/video/aspect-ratio` | Set aspect ratio |
| PUT | `/api/v1/video/zoom` | Set zoom |
| PUT | `/api/v1/video/pan` | Pan video |
| PUT | `/api/v1/video/rotation` | Rotate video |
| PUT | `/api/v1/video/deinterlace` | Configure deinterlacing |
| PUT | `/api/v1/video/hardware-decoding` | Configure hwdec |
| POST | `/api/v1/video/screenshot` | Take screenshot |

### 10.5 Audio

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/audio/settings` | Current audio settings |
| PUT | `/api/v1/audio/device` | Select output device |
| PUT | `/api/v1/audio/delay` | Adjust A/V sync |
| PUT | `/api/v1/audio/normalize` | Configure normalization if supported |
| PUT | `/api/v1/audio/channels` | Channel-layout preference |

### 10.6 Subtitles

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/subtitles/settings` | Subtitle settings |
| PUT | `/api/v1/subtitles/delay` | Adjust subtitle timing |
| PUT | `/api/v1/subtitles/style` | Change local subtitle presentation |
| POST | `/api/v1/subtitles/reload` | Reload subtitle |
| POST | `/api/v1/subtitles/find-local` | Scan for matching local subtitle files |

### 10.7 Playlist

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/playlist` | Current playlist |
| POST | `/api/v1/playlist/items` | Add item(s) |
| DELETE | `/api/v1/playlist/items/:id` | Remove item |
| PUT | `/api/v1/playlist/items/reorder` | Reorder |
| POST | `/api/v1/playlist/clear` | Clear playlist |
| POST | `/api/v1/playlist/shuffle` | Shuffle |
| PUT | `/api/v1/playlist/repeat` | Repeat mode |
| POST | `/api/v1/playlist/save` | Save playlist |
| POST | `/api/v1/playlist/load` | Load playlist |

### 10.8 History / Resume

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/history` | Recent playback |
| DELETE | `/api/v1/history` | Clear history |
| DELETE | `/api/v1/history/:id` | Delete one item |
| GET | `/api/v1/resume/:mediaId` | Resume information |
| DELETE | `/api/v1/resume/:mediaId` | Forget position |

### 10.9 Favorites

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/favorites` | List favorites |
| POST | `/api/v1/favorites` | Add favorite |
| PUT | `/api/v1/favorites/:id` | Update favorite |
| DELETE | `/api/v1/favorites/:id` | Delete favorite |

### 10.10 Media Information

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/media/current` | Current media metadata |
| GET | `/api/v1/media/properties` | Detailed properties |
| POST | `/api/v1/media/probe` | Probe a selected local media file |

### 10.11 Settings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/settings` | Get settings |
| GET | `/api/v1/settings/:section` | Get section |
| PUT | `/api/v1/settings/:section` | Update section |
| POST | `/api/v1/settings/reset` | Reset settings |
| POST | `/api/v1/settings/export` | Export settings |
| POST | `/api/v1/settings/import` | Import settings |

### 10.12 Keyboard Bindings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/keybindings` | List bindings |
| PUT | `/api/v1/keybindings` | Replace/update bindings |
| POST | `/api/v1/keybindings/reset` | Restore defaults |

---

## 11. Playback Engine Integration

### 11.1 mpv Lifecycle

The playback service owns the mpv lifecycle.

Startup:

```text
ClassicMP Main
   ↓
Generate private runtime directory
   ↓
Generate IPC socket path
   ↓
Spawn mpv
   ↓
Connect JSON IPC socket
   ↓
Register property observers
   ↓
Mark playback service READY
```

Shutdown:

```text
Save resume position
   ↓
Send mpv quit command
   ↓
Wait for process
   ↓
Terminate if timeout exceeded
   ↓
Delete socket/runtime artifacts
```

### 11.2 Private Runtime Directory

Use:

```text
$XDG_RUNTIME_DIR/classicmp/<instance-id>/
```

Fallback:

```text
/tmp/classicmp-<uid>/<instance-id>/
```

Permissions:

```text
0700
```

IPC socket must not be world-readable or world-writable.

### 11.3 mpv Process Rules

Spawn mpv using an argument array.

Never use:

```text
shell: true
```

for mpv launch.

Never concatenate untrusted values into a command string.

Use:

```typescript
spawn(mpvBinary, args, {
  shell: false,
  stdio: [...]
})
```

### 11.4 Property Observation

Observe at minimum:

- `pause`
- `idle-active`
- `core-idle`
- `time-pos`
- `duration`
- `percent-pos`
- `volume`
- `mute`
- `speed`
- `filename`
- `path`
- `media-title`
- `playlist-pos`
- `playlist-count`
- `track-list`
- `chapter-list`
- `chapter`
- `aid`
- `sid`
- `vid`
- `audio-delay`
- `sub-delay`
- `video-params`
- `audio-params`
- `metadata`
- `demuxer-cache-state`
- `hwdec-current`

REST state should be derived from the playback-service state cache rather than issuing synchronous mpv queries for every renderer update.

### 11.5 Event Model

The local service should support event delivery through Server-Sent Events.

Endpoint:

```text
GET /api/v1/events
```

Events include:

```text
playback.state
playback.position
playback.file-loaded
playback.end-file
playback.error
track.changed
playlist.changed
settings.changed
media.metadata
engine.restarted
```

Use SSE instead of high-frequency polling.

Position updates should be throttled to approximately 4–10 updates per second.

---

## 12. Video Output Integration

### 12.1 Preferred Design

ClassicMP must use a video-rendering strategy that keeps mpv responsible for rendering quality.

Implementation phase 1 should use an embedded native child window where technically reliable under the supported Electron/Linux stack.

Because Linux display systems differ, the implementation must validate behavior under:

- X11
- XWayland
- Wayland

If reliable native embedding is not achievable for a supported compositor, ClassicMP may use a managed companion video window visually coordinated with the Electron controls.

The implementation agent must not fake playback by drawing decoded frames through the renderer unless specifically approved, because this would add significant CPU/GPU transfer overhead and complexity.

### 12.2 Wayland Strategy

Wayland support is mandatory but may use a separate managed playback surface if native child embedding is compositor-dependent.

The UI must preserve:

- synchronized movement
- fullscreen mode
- always-on-top
- resize behavior
- monitor selection
- focus semantics

Testing must cover GNOME and KDE Plasma.

### 12.3 Fullscreen

Fullscreen must:

- hide standard controls after configurable inactivity
- reveal controls on mouse movement
- keep keyboard commands active
- support Escape to exit
- restore previous window bounds
- work on the monitor containing the player window

---

## 13. Hardware Acceleration

ClassicMP exposes hardware decoding settings while allowing mpv to perform hardware selection.

Default:

```text
Hardware decoding: Auto
```

Modes:

- Auto
- Disabled
- Advanced/manual

Advanced mode may expose available mpv-supported APIs detected on the system.

ClassicMP must not assume a specific GPU vendor.

Supported environments should include:

- Intel
- AMD
- NVIDIA

If hardware decode initialization fails:

1. log sanitized diagnostics
2. fall back to software decode if mpv supports fallback
3. display a non-blocking warning only when useful
4. never crash the entire application solely because hwdec failed

---

## 14. Supported Media

Format support is delegated primarily to mpv and its underlying codec stack.

ClassicMP should not maintain a hardcoded marketing claim that every listed format is always supported.

The application should register common Linux MIME associations for media such as:

### Video

- MP4
- MKV
- WebM
- AVI
- MOV
- MPEG
- M4V
- TS/M2TS
- OGV
- FLV where supported

### Audio

- MP3
- AAC/M4A
- FLAC
- OGG/Vorbis
- Opus
- WAV
- WMA where supported
- ALAC where supported

### Playlists

- M3U
- M3U8
- PLS

### Subtitles

- SRT
- ASS
- SSA
- VTT
- SUB
- SUP where supported by the playback engine

Actual capability must be discovered/tested against the bundled/system playback stack.

---

## 15. Main Window Specification

### 15.1 Regions

The default main window contains:

1. application menu
2. video viewport
3. seek/timeline region
4. transport toolbar
5. audio controls
6. playback speed indicator
7. status bar

### 15.2 Menu Structure

#### File

- Open File…
- Open Multiple Files…
- Open Directory…
- Open URL…
- Open Disc/Device… if supported
- Recent Files
- Clear Recent Files
- Save Playlist…
- Load Playlist…
- Properties
- Exit

#### View

- Minimal Interface
- Hide Menu
- Hide Controls
- Hide Status Bar
- Playlist
- Media Information
- Statistics
- Always on Top
  - Never
  - While Playing
  - Always
- Zoom
- Fullscreen

#### Play

- Play/Pause
- Stop
- Previous
- Next
- Seek Forward
- Seek Backward
- Jump To…
- Frame Step
- Playback Speed
- Repeat
- Shuffle
- Audio Track
- Subtitle Track
- Video Track

#### Navigate

- Previous Chapter
- Next Chapter
- Chapter List
- Title/Edition where available

#### Favorites

- Add Favorite
- Manage Favorites

#### Help

- Keyboard Shortcuts
- Troubleshooting
- About ClassicMP

### 15.3 Transport Controls

Default controls:

```text
Previous | Play/Pause | Stop | Next | Volume | Mute | Speed | Fullscreen
```

Toolbar customization is a post-v1 enhancement.

---

## 16. Seek Bar

The seek bar must support:

- click-to-seek
- drag-to-seek
- mouse-wheel seeking when configured
- chapter markers
- current-time tooltip
- total duration
- buffered/cache indication where meaningful
- optional thumbnail preview

Time display modes:

- elapsed / total
- elapsed / remaining
- elapsed only

Seek granularity:

- small step
- medium step
- large step

Defaults:

```text
Small: 5 seconds
Medium: 30 seconds
Large: 5 minutes
```

All configurable.

---

## 17. Video Preview Thumbnails

Optional seek-bar previews should be implemented as an asynchronous thumbnail service.

Requirements:

- disabled by default on very low-resource systems only if detection justifies it
- cache per-media thumbnails
- bounded cache size
- generation must not stall playback
- cancellation when media changes
- no duplicate generation jobs
- cache stored under XDG cache directory

Suggested path:

```text
$XDG_CACHE_HOME/classicmp/thumbnails/
```

If mpv/ffmpeg helper processes are used:

- use argument arrays
- validate paths
- no shell execution

---

## 18. Playback Controls

### 18.1 Basic

Support:

- play
- pause
- toggle
- stop
- next
- previous
- seek
- frame step
- fullscreen
- mute
- volume

### 18.2 Speed

Range:

```text
0.25x to 4.00x
```

Preset values:

```text
0.25
0.50
0.75
0.90
1.00
1.10
1.25
1.50
1.75
2.00
3.00
4.00
```

Keyboard actions:

- decrease speed
- increase speed
- reset speed to 1.00x

### 18.3 Resume

When a user stops or closes media after a configurable minimum watched duration:

- store position
- store duration
- store timestamp
- store stable media identity

On reopening:

```text
Resume from 43:18?
[Resume] [Start Over]
```

Configurable option:

```text
Automatically resume without asking
```

Do not offer resume when near the beginning or near the end.

Suggested thresholds:

```text
Do not store < 30 seconds
Consider complete when within final 2 minutes or final 5%
```

---

## 19. Media Identity

Local media identity should not depend solely on pathname.

Store:

- canonical path
- file size
- modification time
- optional fast fingerprint

For most cases, canonical path + size + mtime is sufficient.

Avoid hashing entire multi-gigabyte files solely to identify resume positions.

---

## 20. Playlist System

The playlist panel must support:

- add file
- add multiple files
- add directory
- add URL
- remove
- clear
- reorder by drag/drop
- keyboard reorder
- shuffle
- repeat one
- repeat all
- save
- load

Supported playlist import/export:

- M3U
- M3U8
- PLS where practical

ClassicMP's internal playlist representation uses stable UUIDs.

Playlist records:

```typescript
interface PlaylistItem {
  id: string;
  sourceType: 'file' | 'url';
  source: string;
  title?: string;
  durationSeconds?: number;
  addedAt: string;
}
```

Do not automatically recurse into arbitrarily deep directory trees without user configuration.

---

## 21. Subtitle System

Support:

- embedded subtitles
- external subtitle files
- multiple subtitle tracks
- enable/disable subtitles
- subtitle delay
- subtitle position
- font selection where supported
- font size
- scale
- border/outline
- shadow
- text color
- forced subtitle preference
- preferred languages

Automatic external subtitle matching should search:

1. media directory
2. configured subtitle directories

Match patterns may include:

```text
Movie.mkv
Movie.srt
Movie.en.srt
Movie.eng.srt
Movie.forced.srt
```

Do not recursively scan unrestricted directories.

---

## 22. Audio System

Expose:

- volume
- mute
- audio-track selection
- audio delay
- output device
- channel layout preference
- passthrough options where supported
- normalization options where supported by playback engine

Volume range default:

```text
0–100
```

Optional boost:

```text
Up to 130%
```

Boost beyond 100 must be opt-in because clipping can occur.

---

## 23. Video Controls

Expose:

- aspect ratio
- rotate 90°
- rotate 180°
- rotate 270°
- zoom
- pan
- fit to window
- original size where practical
- deinterlace
- hardware decoding
- screenshot
- video track
- edition/title where available

Aspect presets:

```text
Default
16:9
16:10
4:3
2.35:1
2.39:1
Custom
```

---

## 24. Screenshots

Screenshot command must:

- capture decoded video frame
- use mpv screenshot facilities
- save into configured directory
- avoid overwriting files
- display a short OSD confirmation

Default directory:

```text
$XDG_PICTURES_DIR/ClassicMP
```

Fallback:

```text
~/Pictures/ClassicMP
```

Filename:

```text
<classicmp-media-name>-YYYYMMDD-HHMMSS-fff.png
```

Supported configured formats:

- PNG
- JPEG
- WebP if playback stack supports it

---

## 25. Chapters

If chapters are available:

- display chapter markers on seek bar
- populate Navigate menu
- expose chapter name and time
- previous/next chapter commands
- optional OSD on chapter change

---

## 26. Media Information

The Properties / Media Information view should display:

### General

- filename
- path/URL
- container
- duration
- size
- bitrate where available

### Video

- codec
- profile
- resolution
- frame rate
- pixel format
- color space
- HDR metadata where exposed
- hardware decoder currently active

### Audio

- codec
- channels
- sample rate
- bitrate
- language
- title

### Subtitles

- codec/type
- language
- title
- forced/default flags

### Runtime

- dropped frames where available
- cache state
- playback speed
- A/V sync details when available

Never display secrets from signed streaming URLs in logs or diagnostics.

---

## 27. Statistics Overlay

Provide optional playback statistics.

Shortcut:

```text
Ctrl+J
```

Example information:

```text
Video: HEVC 3840×2160 23.976 fps
Audio: E-AC-3 6ch 48 kHz
HW Decode: vaapi
Dropped frames: 0
A/V sync: +0.002s
Cache: 38.5 MB
Display FPS: 60
```

Statistics must be removable with the same shortcut.

---

## 28. On-Screen Display

OSD messages should display for:

- volume
- mute
- seek
- playback speed
- track changes
- subtitle delay
- audio delay
- chapter
- screenshot saved
- hardware decoding changes
- temporary warnings

OSD should disappear automatically.

User can configure:

- enabled/disabled
- duration
- size
- position

---

## 29. Keyboard Controls

ClassicMP must be completely usable without a mouse.

Default proposed bindings:

| Action | Shortcut |
|---|---|
| Open file | Ctrl+O |
| Open URL | Ctrl+U |
| Play/Pause | Space |
| Stop | Ctrl+Space |
| Fullscreen | Alt+Enter |
| Exit fullscreen | Esc |
| Seek -5 sec | Left |
| Seek +5 sec | Right |
| Seek -30 sec | Ctrl+Left |
| Seek +30 sec | Ctrl+Right |
| Seek -5 min | Shift+Left |
| Seek +5 min | Shift+Right |
| Volume up | Up |
| Volume down | Down |
| Mute | M |
| Previous item | PageUp |
| Next item | PageDown |
| Frame step | Ctrl+Right while paused, configurable |
| Subtitle toggle | S |
| Audio track cycle | A |
| Subtitle track cycle | Shift+S |
| Speed down | [ |
| Speed up | ] |
| Speed reset | \ |
| Playlist | Ctrl+L |
| Media info | Ctrl+I |
| Statistics | Ctrl+J |
| Screenshot | F5 |
| Always on top toggle | Ctrl+T |

Bindings must be user configurable.

Conflict detection must prevent ambiguous active bindings unless explicitly allowed.

---

## 30. Mouse Controls

Configurable mappings:

### Single Click

Default: none in video area.

### Double Click

Default:

```text
Toggle fullscreen
```

### Middle Click

Configurable.

### Wheel

Default:

```text
Volume
```

Optional:

- seek
- none

Modifier combinations may assign alternate actions.

---

## 31. Drag and Drop

Support dragging:

- files
- multiple files
- directories
- supported URLs where safely represented

Drop behavior:

Default:

```text
Single file → replace current playback
Multiple files → replace playlist and start first
```

Configurable alternate behavior:

```text
Append dropped items
```

All dropped filesystem paths must be validated by the privileged layer before use.

---

## 32. Open URL

The Open URL dialog supports:

- HTTP
- HTTPS

Optional protocols can be allowed only if mpv support and security have been reviewed.

Reject by default:

- `javascript:`
- `data:`
- `file:` in URL entry
- arbitrary custom protocols

File playback must use the file picker or validated filesystem paths.

Recent URL history must be optional because URLs may contain sensitive query parameters.

Default:

```text
Do not store URL history.
```

---

## 33. File Associations

ClassicMP provides Linux desktop MIME integration through its `.desktop` file.

Example:

```ini
[Desktop Entry]
Type=Application
Name=ClassicMP
GenericName=Media Player
Comment=Play video and audio files
Exec=classicmp %U
Icon=classicmp
Terminal=false
Categories=AudioVideo;Player;
StartupNotify=true
```

The real package must populate an appropriate `MimeType=` list.

ClassicMP must not silently make itself the default application.

It may provide a Settings action:

```text
Set ClassicMP as default media player
```

The implementation must use standard Linux/XDG association mechanisms.

---

## 34. Single Instance Behavior

Only one ClassicMP UI instance should run by default.

If a second invocation occurs:

```bash
classicmp movie.mkv
```

the existing instance should:

1. receive the requested media
2. bring itself to foreground when permitted
3. apply configured open behavior
4. begin playback when appropriate

Optional preference:

```text
Allow multiple ClassicMP instances
```

When enabled, each instance receives its own:

- local REST port
- session token
- mpv process
- IPC socket
- runtime directory

---

## 35. Command-Line Interface

Supported syntax:

```bash
classicmp [options] [files-or-urls...]
```

Initial options:

```text
--help
--version
--new-instance
--enqueue
--play
--fullscreen
--no-resume
--profile <name>
```

Examples:

```bash
classicmp movie.mkv
classicmp --fullscreen movie.mkv
classicmp --enqueue episode2.mkv
classicmp https://example.org/video.mp4
```

Do not expose arbitrary mpv options directly through ClassicMP's CLI in version 1.

An advanced opt-in passthrough may be considered later.

---

## 36. Settings System

Settings sections:

1. Player
2. Playback
3. Video
4. Audio
5. Subtitles
6. Keyboard
7. Mouse
8. Playlist
9. History & Resume
10. Screenshots
11. Interface
12. Network
13. Advanced
14. About

### 36.1 Player

Options:

- open behavior
- single/multiple instance
- pause on minimize
- remember window position
- remember window size
- start fullscreen
- always-on-top behavior

### 36.2 Playback

- resume behavior
- seek step sizes
- repeat defaults
- playback speed persistence
- autoplay next file
- directory sequence behavior

### 36.3 Video

- hardware decoding
- deinterlace
- preferred video output
- aspect behavior
- HDR/tone mapping pass-through settings exposed by playback backend where appropriate

### 36.4 Audio

- output device
- default volume
- remember volume
- passthrough options
- preferred language
- audio delay

### 36.5 Subtitles

- preferred language list
- auto-load external files
- style
- default enabled state
- subtitle directory list

### 36.6 Interface

- theme
- menu visibility
- toolbar visibility
- status bar
- OSD
- compact mode
- seek-preview behavior

---

## 37. Themes

Version 1 supports:

- System
- Light
- Dark

ClassicMP must support `prefers-color-scheme`.

No remote themes.

Custom CSS injection is not supported in version 1.

---

## 38. Persistence Model

SQLite tables:

### `schema_migrations`

```text
version INTEGER PRIMARY KEY
applied_at TEXT NOT NULL
```

### `settings`

```text
key TEXT PRIMARY KEY
value_json TEXT NOT NULL
updated_at TEXT NOT NULL
```

### `media_history`

```text
id TEXT PRIMARY KEY
canonical_path TEXT
source_url TEXT
display_name TEXT NOT NULL
media_identity TEXT
duration_seconds REAL
last_position_seconds REAL
last_played_at TEXT NOT NULL
completed INTEGER NOT NULL DEFAULT 0
```

Indexes:

```text
last_played_at
media_identity
canonical_path
```

### `favorites`

```text
id TEXT PRIMARY KEY
name TEXT NOT NULL
source_type TEXT NOT NULL
source TEXT NOT NULL
position_seconds REAL
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
```

### `saved_playlists`

```text
id TEXT PRIMARY KEY
name TEXT NOT NULL
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
```

### `saved_playlist_items`

```text
id TEXT PRIMARY KEY
playlist_id TEXT NOT NULL
position INTEGER NOT NULL
source_type TEXT NOT NULL
source TEXT NOT NULL
title TEXT
FOREIGN KEY playlist_id REFERENCES saved_playlists(id) ON DELETE CASCADE
```

### `file_preferences`

Per-file overrides:

```text
id TEXT PRIMARY KEY
media_identity TEXT NOT NULL UNIQUE
audio_track_hint TEXT
subtitle_track_hint TEXT
subtitle_delay REAL
audio_delay REAL
aspect_ratio TEXT
updated_at TEXT NOT NULL
```

---

## 39. Data Locations

Follow XDG directories.

### Configuration

```text
$XDG_CONFIG_HOME/classicmp/
```

Fallback:

```text
~/.config/classicmp/
```

### Data

```text
$XDG_DATA_HOME/classicmp/
```

Fallback:

```text
~/.local/share/classicmp/
```

### Cache

```text
$XDG_CACHE_HOME/classicmp/
```

Fallback:

```text
~/.cache/classicmp/
```

### Runtime

```text
$XDG_RUNTIME_DIR/classicmp/
```

Never store persistent state under `/tmp`.

---

## 40. Local REST Service Implementation

Preferred technology:

- Fastify
- TypeScript
- Zod validation

The server runs inside the trusted Electron main-process environment or in a dedicated Node worker/subprocess if isolation proves beneficial.

Version 1 should prefer a dedicated service module in the main process unless performance/testing demonstrates a reason for a separate process.

The REST layer calls service interfaces, not mpv directly.

Example:

```text
Route
 ↓
Zod Request Validation
 ↓
PlaybackService
 ↓
MpvAdapter
 ↓
JSON IPC
```

---

## 41. Service Interfaces

Primary interfaces:

```text
PlaybackService
PlaylistService
SubtitleService
MediaInfoService
SettingsService
HistoryService
FavoritesService
ScreenshotService
ThumbnailService
LinuxIntegrationService
AuthenticationService
UpdateService
```

Example:

```typescript
interface PlaybackService {
  open(source: MediaSource, mode: OpenMode): Promise<PlaybackState>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(request: SeekRequest): Promise<void>;
  setSpeed(speed: number): Promise<void>;
  getState(): PlaybackState;
}
```

---

## 42. mpv Adapter

Create one abstraction:

```text
MpvAdapter
```

Responsibilities:

- spawn mpv
- connect IPC
- send commands
- observe properties
- correlate request IDs
- handle timeouts
- parse responses
- emit typed events
- restart engine after unexpected termination
- sanitize diagnostic logs

No UI component may import `MpvAdapter`.

No REST route may talk directly to the IPC socket.

---

## 43. mpv Failure Recovery

If mpv crashes:

1. detect process exit
2. mark playback unavailable
3. preserve known media and position
4. emit `engine.crashed`
5. attempt one automatic restart
6. reconnect IPC
7. optionally reopen prior media and seek to saved position
8. if restart fails, show troubleshooting dialog

Do not enter infinite restart loops.

Suggested circuit breaker:

```text
Maximum automatic restarts: 2 within 60 seconds
```

After that:

```text
Playback engine failed repeatedly.
[View Diagnostics] [Restart Engine] [Close]
```

---

## 44. Authentication

Local media playback does not require authentication.

Authentication exists only for future/optional remote capabilities such as:

- synchronized preferences
- cloud-managed favorites
- private media-service integrations
- authenticated remote APIs

Use OIDC discovery:

```text
https://iam.zambeziblue.com/.well-known/openid-configuration
```

Use:

- Authorization Code Flow
- PKCE
- system browser
- loopback callback

Do not embed a client secret.

ClassicMP is an OAuth public client.

Authentication must never be required merely to:

- open local files
- watch local media
- manage local playlists
- change local settings

---

## 45. OIDC Flow

If remote account features are enabled:

```text
ClassicMP
   ↓
OIDC Discovery
   ↓
Generate state + nonce + PKCE verifier
   ↓
Open system browser
   ↓
User authenticates at IdP
   ↓
Redirect to 127.0.0.1:<ephemeral>/oauth/callback
   ↓
Validate state
   ↓
Exchange code + PKCE verifier
   ↓
Validate ID token
   ↓
Store refresh token using Secret Service
```

Validate:

- signature
- issuer
- audience
- nonce
- expiration

Tokens must not be sent to the renderer unless specifically needed.

Refresh tokens must never be sent to the renderer.

---

## 46. Linux Desktop Integration

ClassicMP should integrate with:

- XDG desktop entries
- MIME associations
- freedesktop icon themes
- MPRIS/D-Bus media controls
- desktop notifications
- GNOME media controls
- KDE Plasma media controls
- multimedia keyboard keys where available

MPRIS should expose:

- play
- pause
- play/pause
- stop
- next
- previous
- seek
- set position
- volume
- metadata
- playback status

The service name should be similar to:

```text
org.mpris.MediaPlayer2.classicmp
```

---

## 47. Multimedia Keys

ClassicMP should support:

- XF86AudioPlay
- XF86AudioPause
- XF86AudioPlayPause
- XF86AudioStop
- XF86AudioNext
- XF86AudioPrev

Prefer integration through MPRIS and desktop facilities instead of grabbing global keys unnecessarily.

---

## 48. Notifications

Optional notifications for:

- audio-only track changes
- playlist progression when minimized
- playback errors
- update availability

Do not show a notification every time a normal local video starts.

Notifications must be configurable.

---

## 49. Window Behavior

Store:

- width
- height
- normal position when sensible
- maximized state
- fullscreen state handling rules

On startup, validate stored geometry.

If the previous monitor no longer exists, place the window on a visible display.

Minimum size:

```text
640×360
```

Suggested initial size:

```text
960×540 plus controls
```

---

## 50. Multi-Monitor Support

Support:

- moving window across displays
- fullscreen on active display
- restore to correct display
- sensible behavior after display disconnect
- DPI/scaling changes
- mixed-DPI environments where supported

Never assume display index remains stable between sessions.

---

## 51. Network Media

Support HTTP and HTTPS media URLs accepted by mpv.

Security requirements:

- no TLS verification disabling
- redact URL credentials/query secrets from logs
- configurable network timeout
- configurable cache where practical
- user-visible error on certificate failure

Do not implement custom certificate bypass buttons.

---

## 52. Proxy Support

Default to system/environment behavior supported by the playback stack.

Advanced settings may expose explicit proxy configuration.

Proxy credentials are sensitive and must not be logged.

If credentials must be persisted, store them in secure credential storage.

---

## 53. Remote Media Security

URLs returned by external services must be treated as untrusted.

Validate:

- scheme
- length
- syntax

Do not allow remote content to:

- execute shell commands
- choose arbitrary output files
- select executable paths
- inject mpv command sequences
- inject CLI arguments through concatenated command strings

---

## 54. Application Updates

ClassicMP supports two distribution models.

### AppImage / Direct Release

Optional in-app update checks.

### Debian Repository / Distribution Package

Prefer package-manager updates.

ClassicMP must not replace package-manager-managed installations behind the package manager's back.

Settings:

```text
Check for updates automatically: On
Update channel: Stable
```

The check may notify rather than self-install depending on package format.

Update metadata must be served over HTTPS and signed where feasible.

---

## 55. Packaging

Use Electron Forge or electron-builder.

Preferred initial choice:

```text
electron-builder
```

because the project requires AppImage and Debian package production from one build configuration.

Artifacts:

```text
ClassicMP-<version>-x86_64.AppImage
classicmp_<version>_amd64.deb
```

ARM64 should be added after x86_64 is stable:

```text
ClassicMP-<version>-arm64.AppImage
classicmp_<version>_arm64.deb
```

---

## 56. mpv Distribution Strategy

ClassicMP should support two installation models.

### Model A — System mpv

Preferred for distro-native `.deb` packaging when dependency management is reliable.

ClassicMP verifies:

```bash
mpv --version
```

through a safe process spawn.

### Model B — Bundled Playback Runtime

Preferred for a portable AppImage if licensing and packaging review permits.

The bundled runtime must have:

- known version
- reproducible source/build provenance
- documented licenses
- security-update process

The build pipeline must include dependency-license review before redistribution.

ClassicMP must expose playback-engine version under:

```text
Help → About → Diagnostics
```

---

## 57. Startup Sequence

```text
Electron Start
   ↓
Acquire single-instance lock
   ↓
Initialize structured logging
   ↓
Resolve XDG directories
   ↓
Open/migrate SQLite database
   ↓
Load and validate settings
   ↓
Start loopback REST API
   ↓
Generate local API bearer token
   ↓
Locate playback engine
   ↓
Start mpv
   ↓
Connect JSON IPC
   ↓
Initialize Linux/MPRIS integration
   ↓
Create main BrowserWindow
   ↓
Load renderer
   ↓
Process command-line media arguments
```

Failure of the playback engine must not prevent the settings/troubleshooting UI from opening.

---

## 58. Shutdown Sequence

```text
Quit requested
   ↓
Stop accepting new REST mutations
   ↓
Persist current playback position
   ↓
Flush settings/history writes
   ↓
Stop thumbnail jobs
   ↓
Stop OAuth callback listener if active
   ↓
Send mpv quit
   ↓
Stop REST API
   ↓
Remove runtime/socket files
   ↓
Close SQLite
   ↓
Exit
```

---

## 59. Logging

Use structured JSON or structured text logging.

Log files:

```text
$XDG_STATE_HOME/classicmp/logs/
```

Fallback:

```text
~/.local/state/classicmp/logs/
```

Log:

- application start/stop
- version
- Electron version
- playback-engine version
- REST request IDs
- mpv lifecycle
- media-open success/failure
- hardware decoder selected
- database migration events
- recoverable failures
- update checks

Do not log:

- OAuth tokens
- refresh tokens
- authorization codes
- PKCE verifier
- local REST session token
- URL passwords
- sensitive query strings
- arbitrary subtitle content

Rotate logs.

Suggested defaults:

```text
10 MB per file
5 retained files
```

---

## 60. Diagnostics

`Help → Troubleshooting → Diagnostics`

Display:

- ClassicMP version
- Electron version
- Node version
- Linux distribution
- kernel version
- desktop environment
- X11/Wayland session type
- mpv version
- hardware-decoding state
- audio backend
- API version
- database schema version

Provide:

```text
Copy Diagnostics
Save Diagnostics…
```

Diagnostics export must redact:

- user name where practical
- home-directory prefix
- tokens
- URL secrets

---

## 61. Crash Handling

Unexpected main-process crashes should be visible through packaging/runtime facilities and logs.

Telemetry/crash upload must be:

```text
Off by default
```

If future crash reporting is added:

- explicit opt-in
- clear privacy description
- local preview of data where practical
- no media filenames by default
- no authentication tokens

---

## 62. Privacy

ClassicMP is local-first.

Default behavior:

- no analytics
- no advertising
- no account
- no cloud sync
- no playback-history upload
- no automatic media scanning outside explicitly opened paths

Any future network feature must be separately documented.

---

## 63. File Security

File selection:

- privileged Electron main process opens native file dialogs
- renderer receives a safe application-level representation

Avoid granting the renderer generic filesystem APIs.

Before opening:

- normalize path
- confirm expected file type where relevant
- handle symlinks predictably
- reject null bytes and malformed input

The playback engine may still open user-selected media with uncommon extensions.

Do not rely only on extensions for safety-sensitive behavior.

---

## 64. External Processes

Allowed helper processes:

- mpv
- optionally ffmpeg/ffprobe if a feature strictly requires it

Rules:

- explicit executable path
- argument arrays
- no shell
- timeouts
- child-process cleanup
- no user-controlled executable path by default

External helper selection is not exposed as a normal renderer feature.

---

## 65. Media Probing

Prefer metadata already available from mpv.

Use ffprobe only when:

- mpv metadata is insufficient
- media is not currently loaded
- thumbnail/probe functionality requires it

Probe jobs must be:

- asynchronous
- cancellable
- concurrency limited

Default maximum probe concurrency:

```text
2
```

---

## 66. Performance Requirements

Target on a typical modern Linux desktop:

### Startup

- UI visible within 2 seconds after cold launch when system conditions permit
- playback engine ready shortly thereafter
- no network dependency in startup path

### UI

- 60 fps interaction target
- seeking controls respond immediately
- playlist with 10,000 items remains usable through virtualization

### Memory

Electron has inherent overhead, but ClassicMP should avoid unnecessary renderer instances and large retained media objects.

### CPU

When paused/idle:

- minimal continuous polling
- no high-frequency renderer loops
- no perpetual thumbnail generation

---

## 67. Accessibility

Requirements:

- full keyboard navigation
- visible focus
- semantic controls
- accessible button names
- screen-reader-compatible settings dialogs
- configurable UI scaling
- high-contrast compatibility
- no color-only status indicators
- reduced-motion compliance

Standard HTML controls should be preferred over custom reimplementations.

---

## 68. Internationalization

Version 1 code must be translation-ready even if English ships first.

All user-visible strings must be externalized.

Use a translation framework such as:

```text
i18next
```

Initial locale:

```text
en-US
```

Future language packs are bundled and signed with releases.

No remote translation code.

---

## 69. Development Tooling

Use:

- Node.js current supported LTS appropriate for selected Electron release
- npm or pnpm
- TypeScript
- Vite
- React
- Fastify
- Zod
- SQLite library
- Vitest
- Playwright
- ESLint
- Prettier
- electron-builder
- dependency audit tooling

Use one package manager consistently.

Recommended:

```text
pnpm
```

Commit lockfile.

---

## 70. Project Structure

```text
classicmp/
├── src/
│   ├── main/
│   │   ├── main.ts
│   │   ├── lifecycle/
│   │   ├── windows/
│   │   ├── security/
│   │   ├── runtime/
│   │   ├── linux/
│   │   └── auth/
│   │
│   ├── api/
│   │   ├── server.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   │   └── v1/
│   │   ├── schemas/
│   │   └── errors/
│   │
│   ├── services/
│   │   ├── playback/
│   │   ├── playlist/
│   │   ├── subtitles/
│   │   ├── media/
│   │   ├── history/
│   │   ├── favorites/
│   │   ├── settings/
│   │   ├── thumbnails/
│   │   └── screenshots/
│   │
│   ├── playback/
│   │   ├── mpv/
│   │   │   ├── MpvAdapter.ts
│   │   │   ├── MpvClient.ts
│   │   │   ├── MpvProcess.ts
│   │   │   ├── MpvEvents.ts
│   │   │   └── MpvTypes.ts
│   │   └── types.ts
│   │
│   ├── persistence/
│   │   ├── database.ts
│   │   ├── migrations/
│   │   └── repositories/
│   │
│   ├── preload/
│   │   ├── preload.ts
│   │   └── types.ts
│   │
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── player/
│   │   ├── playlist/
│   │   ├── settings/
│   │   ├── dialogs/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── state/
│   │   ├── styles/
│   │   └── i18n/
│   │
│   └── shared/
│       ├── types/
│       ├── schemas/
│       ├── constants/
│       └── events/
│
├── assets/
│   ├── icons/
│   ├── desktop/
│   └── branding/
│
├── build/
│   ├── linux/
│   └── electron-builder.yml
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   ├── playback/
│   ├── security/
│   └── e2e/
│
├── scripts/
├── docs/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── .env.example
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 71. Configuration

Example development environment:

```dotenv
CLASSICMP_ENV=development
CLASSICMP_LOG_LEVEL=debug

OIDC_DISCOVERY_URL=https://iam.zambeziblue.com/.well-known/openid-configuration
OIDC_CLIENT_ID=
OIDC_SCOPES=openid profile email offline_access

CLASSICMP_UPDATE_CHANNEL=stable
```

No production secret may be shipped in `.env`.

The OAuth client ID is public configuration.

A desktop application must not ship a confidential OAuth client secret.

---

## 72. Testing Strategy

### 72.1 Unit Tests

Test:

- state reducers
- request schemas
- path validation
- settings validation
- media identity
- playlist logic
- history logic
- resume thresholds
- keybinding conflicts
- mpv command translation

### 72.2 API Tests

Every REST route must test:

- success
- malformed input
- missing local bearer token
- invalid bearer token
- invalid application state
- service failure
- error response schema

### 72.3 Playback Integration Tests

Launch a real mpv instance in CI where feasible.

Test with small generated fixtures:

- video + audio
- audio only
- subtitle track
- multiple audio tracks
- chapters

Verify:

- open
- play
- pause
- seek
- stop
- track selection
- speed
- screenshot
- end-of-file behavior

### 72.4 Renderer Tests

Test:

- transport controls
- seek behavior
- playlist
- settings
- keyboard shortcuts
- error states
- responsive sizing

### 72.5 E2E

Use Playwright Electron support.

Scenarios:

1. launch
2. open video
3. play/pause
4. seek
5. fullscreen
6. open playlist
7. change subtitle
8. close
9. reopen
10. verify resume prompt

---

## 73. Security Tests

Test:

- renderer cannot access Node APIs
- context isolation active
- navigation to external origins blocked
- popups blocked
- invalid REST token rejected
- REST server inaccessible beyond loopback
- path traversal rejected where relevant
- malicious URL schemes rejected
- shell metacharacters in filenames do not become commands
- mpv arguments are never shell-concatenated
- logs redact URL credentials
- OAuth state mismatch rejected
- OAuth nonce mismatch rejected
- refresh token unavailable to renderer
- malicious imported settings rejected

---

## 74. CI Pipeline

Required stages:

```text
Checkout
   ↓
Install dependencies
   ↓
Dependency audit
   ↓
Typecheck
   ↓
Lint
   ↓
Unit tests
   ↓
API tests
   ↓
Build renderer/main
   ↓
Playback integration tests
   ↓
Electron E2E tests
   ↓
Package
   ↓
Generate checksums
   ↓
Publish release artifacts
```

Run at least on:

- Ubuntu latest supported CI image

Release builds should additionally validate:

- Ubuntu
- Debian container/VM
- Fedora VM where practical

---

## 75. Release Artifacts

Each release should include:

```text
ClassicMP-x.y.z-x86_64.AppImage
ClassicMP-x.y.z-x86_64.AppImage.sha256

classicmp_x.y.z_amd64.deb
classicmp_x.y.z_amd64.deb.sha256

classicmp-x.y.z-source.tar.gz
```

Future:

```text
arm64
Flatpak
```

---

## 76. Versioning

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

REST API version remains independent conceptually:

```text
/api/v1
```

Breaking local REST contract changes require:

```text
/api/v2
```

even if ClassicMP major version does not immediately change.

---

## 77. Dependency Management

Requirements:

- lock dependency versions
- automated vulnerability review
- dependency update workflow
- avoid abandoned packages
- minimize native Node modules
- document third-party licenses
- maintain Software Bill of Materials for releases where practical

High-risk dependencies include:

- Electron
- playback runtime
- SQLite native binding if used
- packaging toolchain

---

## 78. Threat Model

### Threat: Compromised renderer

Mitigation:

- sandbox
- no Node integration
- context isolation
- narrow preload surface
- local REST bearer token
- REST request validation

### Threat: Malicious media filename

Mitigation:

- process spawn argument arrays
- no shell
- normalized path handling

### Threat: Malicious subtitle

Mitigation:

- render subtitles through playback engine
- never inject subtitle content as renderer HTML

### Threat: Malicious URL

Mitigation:

- strict scheme validation
- no arbitrary protocol launching
- redact secrets

### Threat: mpv IPC abuse

Mitigation:

- private socket directory
- filesystem permissions
- renderer has no socket access
- socket not documented as public remote-control interface

### Threat: Local REST hijacking

Mitigation:

- loopback only
- ephemeral port
- random per-launch bearer token
- Origin validation where applicable
- request validation

### Threat: Update compromise

Mitigation:

- HTTPS
- signed/checksummed artifacts
- trusted release source
- package-manager preference

### Threat: Dependency compromise

Mitigation:

- lockfile
- audits
- CI provenance
- review high-risk updates

### Threat: OAuth interception

Mitigation:

- PKCE
- state
- nonce
- loopback callback
- short callback lifetime

---

## 79. Error Handling

User-facing error categories:

```text
Playback Error
Unsupported Media
File Not Found
Permission Denied
Network Error
Subtitle Error
Audio Device Error
Video Output Error
Playback Engine Error
Configuration Error
Database Error
Authentication Error
Update Error
```

Error dialogs should contain:

- plain-language summary
- safe technical detail
- retry action when useful
- diagnostics action for technical failures

Do not show raw stack traces in normal production dialogs.

---

## 80. Health / Status

Local endpoints:

```text
GET /api/v1/app/status
```

Example:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "apiVersion": "v1",
  "playbackEngine": {
    "status": "ready",
    "version": "..."
  },
  "database": {
    "status": "ready",
    "schemaVersion": 4
  }
}
```

Do not expose:

- filesystem paths
- tokens
- personal data

unless diagnostics mode explicitly requests safe details.

---

## 81. Migrations

SQLite migrations must:

- execute before renderer becomes fully interactive
- run inside transactions where supported
- be idempotent by version
- never silently drop user history/settings
- back up database before risky migrations

On migration failure:

```text
ClassicMP could not upgrade its local database.

[Retry] [Open Diagnostics] [Reset Local Data]
```

Reset requires explicit confirmation.

---

## 82. Backup and Export

ClassicMP should provide:

```text
Settings → Advanced → Export Settings
```

Export may contain:

- preferences
- keybindings
- favorites
- optionally playlists

Do not include:

- authentication tokens
- local REST tokens
- logs
- absolute playback history unless explicitly selected

Import must schema-validate all values.

---

## 83. UI State Model

Renderer state categories:

- application status
- playback state
- playlist state
- settings state
- dialog state
- transient OSD state

Do not duplicate the authoritative playback state in multiple stores.

The REST/SSE service remains the source of truth for playback.

---

## 84. Renderer API Client

Centralize REST interactions:

```text
src/renderer/api/
```

Responsibilities:

- local API base URL
- session-token header
- request IDs
- JSON parsing
- Zod response validation
- typed errors
- cancellation
- SSE reconnection

No React component may call `fetch()` directly.

---

## 85. Preload Contract

The preload API should be extremely small.

Example:

```typescript
interface ClassicMPBootstrap {
  getLocalApiBootstrap(): Promise<{
    baseUrl: string;
    sessionToken: string;
  }>;

  chooseFiles(options: FileDialogOptions): Promise<SelectedFile[]>;
  chooseDirectory(): Promise<SelectedDirectory | null>;
  getPlatformInfo(): Promise<PlatformInfo>;
}
```

Do not expose:

```text
shell.execute
filesystem.read
filesystem.write
ipc.invoke(anyChannel)
process.env
child_process
```

---

## 86. Linux File Dialogs

Use Electron native dialogs through the main process.

Filters:

```text
Media Files
Video Files
Audio Files
Playlist Files
Subtitle Files
All Files
```

Filtering is a convenience, not an authorization boundary.

---

## 87. Advanced mpv Configuration

ClassicMP owns its normal playback configuration.

Advanced setting:

```text
Allow user mpv configuration
```

Default:

```text
Off
```

When enabled, show warning that external mpv config/scripts can alter behavior and may reduce ClassicMP's ability to provide consistent support.

Do not enable arbitrary Lua scripts by default.

---

## 88. Profiles

Post-v1 feature, but architecture should permit named profiles:

```text
Default
Laptop
Home Theater
Headphones
```

A profile may contain:

- audio device
- hwdec setting
- subtitle preferences
- fullscreen behavior
- audio passthrough

Version 1 may keep only `Default`.

---

## 89. Acceptance Criteria — Core

- [ ] ClassicMP launches on supported Ubuntu, Debian, Fedora, and Linux Mint environments.
- [ ] Main renderer has `nodeIntegration=false`.
- [ ] Main renderer has `contextIsolation=true`.
- [ ] Main renderer runs sandboxed.
- [ ] Local REST API binds only to loopback.
- [ ] Local REST API requires a random per-launch token.
- [ ] Renderer controls playback through REST rather than direct mpv IPC.
- [ ] mpv is controlled through documented IPC commands/properties.
- [ ] mpv is launched without a shell.
- [ ] User can open and play common local video files.
- [ ] User can open and play common local audio files.
- [ ] User can pause, seek, stop, and change volume.
- [ ] User can enter and exit fullscreen.
- [ ] User can select audio, video, and subtitle tracks.
- [ ] User can load an external subtitle file.
- [ ] User can change subtitle delay.
- [ ] User can change audio delay.
- [ ] User can change playback speed.
- [ ] User can step forward by frame while paused.
- [ ] User can save screenshots.
- [ ] User can manage a playlist.
- [ ] User can save and load playlists.
- [ ] Recent files work.
- [ ] Resume playback works.
- [ ] Favorites work.
- [ ] User can view media information.
- [ ] Playback statistics are available.
- [ ] Configurable keyboard shortcuts work.
- [ ] Double-click fullscreen works.
- [ ] Drag/drop media works.
- [ ] Multiple-display fullscreen works.
- [ ] MPRIS media controls work.
- [ ] Linux MIME associations are packaged correctly.
- [ ] ClassicMP does not silently become the default player.
- [ ] Dark, light, and system themes work.
- [ ] Settings persist.
- [ ] Logs contain no credentials or bearer tokens.
- [ ] Playback recovers gracefully from one unexpected mpv crash.
- [ ] Application can open troubleshooting UI even if mpv is unavailable.

---

## 90. Acceptance Criteria — Security

- [ ] Renderer cannot import Node.js modules.
- [ ] Renderer cannot access arbitrary filesystem paths directly.
- [ ] Renderer cannot spawn processes.
- [ ] Renderer cannot connect directly to mpv IPC.
- [ ] CSP blocks unauthorized remote scripts.
- [ ] Navigation to untrusted origins is blocked.
- [ ] Arbitrary popup windows are blocked.
- [ ] URL schemes are allowlisted.
- [ ] Filenames containing shell metacharacters do not execute shell commands.
- [ ] Local REST requests with missing/invalid tokens fail.
- [ ] REST inputs are schema validated.
- [ ] Imported settings are schema validated.
- [ ] OAuth uses PKCE if enabled.
- [ ] OAuth state and nonce are validated.
- [ ] OAuth refresh token is never exposed to renderer.
- [ ] OAuth client secret is not included in application packages.
- [ ] TLS verification is never disabled in production.

---

## 91. Implementation Phases

### Phase 1 — Project Foundation

Implement:

- Electron
- TypeScript
- Vite
- React
- linting
- formatting
- tests
- electron-builder
- application identity
- development scripts

Exit criteria:

- blank secure Electron window launches
- packaged development build runs

### Phase 2 — Security Shell

Implement:

- BrowserWindow security defaults
- CSP
- preload bridge
- navigation restrictions
- single-instance lock
- XDG paths
- structured logging

Exit criteria:

- security tests pass

### Phase 3 — Local REST Layer

Implement:

- Fastify
- local token
- loopback binding
- request IDs
- Zod validation
- status endpoint
- SSE channel

Exit criteria:

- renderer communicates with authenticated local API

### Phase 4 — Playback Engine

Implement:

- mpv discovery
- process supervisor
- JSON IPC
- typed commands
- property observation
- event mapping
- restart policy

Exit criteria:

- API tests can load/play/pause/seek/stop media

### Phase 5 — Core Player UI

Implement:

- video surface
- menus
- seek bar
- controls
- volume
- fullscreen
- status bar
- OSD
- keyboard shortcuts

Exit criteria:

- usable basic media player

### Phase 6 — Tracks and Media Controls

Implement:

- audio tracks
- subtitle tracks
- external subtitles
- delays
- chapters
- speed
- video settings
- screenshots

### Phase 7 — Playlist / History / Resume

Implement:

- SQLite
- migrations
- playlist
- recent files
- resume positions
- favorites

### Phase 8 — Linux Integration

Implement:

- desktop file
- MIME declarations
- MPRIS
- desktop media keys
- notifications
- XDG integration

### Phase 9 — Settings

Implement all version-1 settings with validation and safe defaults.

### Phase 10 — Advanced Playback

Implement:

- hardware-decoding configuration
- media information
- statistics
- seek previews
- improved multi-monitor handling
- Wayland-specific validation/fixes

### Phase 11 — Optional OIDC

Implement OIDC only when remote account features actually exist.

Local playback must remain independent.

### Phase 12 — Production Packaging

Implement:

- AppImage
- `.deb`
- checksums
- package metadata
- licenses
- release notes
- update-check behavior

### Phase 13 — Hardening

Complete:

- security review
- dependency audit
- fuzz/malformed-input testing where useful
- crash recovery
- diagnostics
- accessibility checks
- performance checks

---

## 92. Required Development Commands

Provide:

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm format
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm package
pnpm package:appimage
pnpm package:deb
```

---

## 93. README Requirements

README must document:

- what ClassicMP is
- screenshots
- supported distributions
- installation
- mpv dependency/runtime model
- common shortcuts
- development setup
- build instructions
- packaging
- security reporting
- license
- acknowledgement that MPC-HC was a functional inspiration without implying affiliation

---

## 94. SECURITY.md

Document:

- vulnerability reporting channel
- supported versions
- responsible disclosure expectations
- local REST security model
- Electron trust model
- media/subtitle parsing dependency risks
- security-update process

---

## 95. Open Questions for Implementation Validation

These questions do not block initial implementation, but must be resolved during prototyping:

1. Which mpv video-surface integration is most reliable across X11, XWayland, and native Wayland in the chosen Electron version?
2. Should the AppImage bundle mpv or require a compatible system mpv?
3. Which SQLite package provides the best maintenance/security profile for the selected Electron ABI?
4. Which Secret Service integration is sufficiently maintained for optional OAuth token storage?
5. Should Flatpak ship in v1 or after AppImage/DEB stabilization?
6. Which hardware-decoding options should be exposed directly versus delegated to mpv `auto`?
7. Is an ffprobe dependency necessary, or can media information be supplied entirely through mpv?
8. Which distributions/compositors should form the official CI/VM certification matrix?

Defaults in this document should be followed until testing justifies a change.

---

## 96. Definition of Done

ClassicMP 1.0 is complete when:

1. all required acceptance criteria pass
2. Linux installation packages are reproducible
3. local media playback requires no account or Internet access
4. supported media plays through the mpv engine
5. the renderer remains isolated from privileged Node/OS interfaces
6. all business operations used by the renderer pass through the local REST API
7. playback history, playlists, settings, and resume state survive restart
8. the application works under both a supported X11/XWayland environment and supported Wayland environments
9. MPRIS integration works with mainstream Linux desktop controls
10. package MIME integration is standards-compliant
11. unit, integration, REST API, playback, and E2E tests pass
12. security review finds no known critical/high-severity application-layer defects
13. documentation is sufficient for another developer or AI coding agent to build and maintain the project

---

## 97. Implementation Directive for an AI Coding Agent

When implementing this specification:

1. Work phase by phase.
2. Do not skip tests.
3. Keep a checked implementation plan in the repository.
4. Do not claim a feature works unless it has been exercised by a test or explicit manual verification.
5. Preserve main/preload/renderer trust boundaries.
6. Keep privileged operations out of the renderer.
7. Keep playback operations behind the REST/service layer.
8. Keep mpv-specific details behind `MpvAdapter`.
9. Use schema validation at every input boundary.
10. Never solve development problems by weakening Electron security settings.
11. Never disable TLS validation to work around network issues.
12. Never use `shell: true` for media/helper processes.
13. Never hard-code user-specific paths.
14. Follow XDG locations.
15. Keep local playback functional without authentication.
16. Add migrations rather than manually changing persisted schemas.
17. Keep release packaging deterministic.
18. Record architectural deviations in `docs/architecture-decisions/`.
19. Treat Wayland differences as supported-platform engineering work rather than disabling Wayland globally.
20. Prioritize playback reliability and simple interaction over visual complexity.

---

## 98. Reference Material

Implementation agents should consult current upstream documentation rather than relying on copied internals.

Primary references:

- MPC-HC functional reference: https://github.com/mpc-hc/mpc-hc
- Maintained MPC-HC fork/reference: https://github.com/clsid2/mpc-hc
- mpv documentation: https://mpv.io/manual/stable/
- Electron documentation: https://www.electronjs.org/docs/latest/
- Freedesktop Desktop Entry specification: https://specifications.freedesktop.org/desktop-entry-spec/latest/
- Freedesktop MIME Applications specification: https://specifications.freedesktop.org/mime-apps/latest/
- MPRIS specification: https://specifications.freedesktop.org/mpris-spec/latest/

ClassicMP must use current documentation during implementation because Electron, mpv, Linux desktop behavior, codecs, and packaging requirements evolve over time.

---

# End of Specification
