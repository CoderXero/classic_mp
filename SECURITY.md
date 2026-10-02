# Security

Report vulnerabilities privately to the project maintainers rather than opening a public issue. Do not include media files, bearer tokens, OAuth credentials, or other private data in reports.

ClassicMP keeps the renderer sandboxed, uses a narrow preload bridge, validates API input, binds its local API to loopback, and launches mpv with argument arrays and no shell. Local playback does not require an account or network access.
