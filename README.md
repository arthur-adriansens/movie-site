# movvie-type-shiii

A polished, single-page TMDb-powered movie/tv browser app (mobile/tablet-first).

## 🔍 About

This repository contains a complete self-contained app:
- `online_viewer_net.html` (original app file)
- `index.html` (copy for static hosting)

Features:
- TMDb discovery, details, search (via API key in code)
- Watchlists / continue-watching storage via `localStorage`
- Franchise row navigation
- Adaptive dark glassmorphism UI
- Embedded external stream source links

## ▶️ Run locally

1. Open `index.html` in a browser (or run a local server):
   - `python3 -m http.server 8000` and open `http://localhost:8000`
2. Interact with the app; it gets data from TMDb API.

## 🛠️ Notes

- Current API key is in the file (`API_KEY` variable). For production, replace with your own key or move to a backend proxy.
- If you want to keep just one file, remove `online_viewer_net.html` and keep `index.html`.

## 💡 To focus repo on this app

- Keep README focused on `index.html` usage.
- Optional: delete unrelated files (none currently).
- Optional: add `LICENSE`, `CONTRIBUTING.md`, and GitHub Pages settings.

