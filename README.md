# Neori / Media Station X

TV-oriented movie and series interface built on the existing Neori Lampa visual layer.

## Media Station X

The project can be hosted as static web content and opened from Media Station X. The UI is designed for remote-control navigation and keeps the existing Lampa integration available for playback, search, favorites, history and plugins.

### Current interface

- Home catalogue with poster rows
- Movies and series sections via Lampa
- Search
- Continue watching / history / favorites
- Movie detail screen
- Lampa plugin manager
- Keyboard/remote navigation

### Repository structure

- `index.html` — app entry point
- `neori/css/neori.css` — TV visual layer
- `neori/js/neori-shell.js` — catalogue UI and navigation
- `ui/neori.css` / `ui/neori.js` — existing Lampa presentation overlay
