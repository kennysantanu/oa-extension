# OA Extension

A Chrome extension tailored to improve our clinic workflows when interacting with OA applications.

## Repository structure

- `manifest.json` — extension manifest and permissions.
- `service-worker.js` — background/service worker that forwards content messages to the side panel.
- `sidepanel.html` — side panel UI shown when the extension is opened.
- `sidepanel.js` — side panel logic and message handler.
- `sidepanel.css` — side panel styling.
- `content-scripts/oa-edit-patient.js` — content script that extracts patient data from OA's Edit Patient page.
- `LICENSE` — project license.

## Install (development)

1. Open Chrome and go to `chrome://extensions`.
2. Enable "Developer mode" (toggle in the top-right).
3. Click "Load unpacked" and select this project folder (the folder containing `manifest.json`).

(Alternative: In Chromium-based browsers that support the Manifest v3 side panel, install similarly.)

## Usage

- Navigate to pages that matches the URL pattern in `manifest.json`.
- Open the extension (click the extension icon) to show the side panel with the current page action.

## Development notes

- Page specific logic is implemented in `content-scripts/` folder. If the page structure changes, update the logic there.
- Message flow: content script -> `service-worker.js` -> side panel (`sidepanel.js`).

## Contributing

1. Create a feature branch from `main`.
2. Open a pull request with a clear description and screenshots if UI changes.
3. Keep changes focused and add tests or notes if you modify extraction logic.

## License

See the `LICENSE` file in this repository.

## Troubleshooting

- If the side panel shows no data, confirm the content script is running on the current page and `manifest.json` URL match patterns include the domain.
- Use the Extensions panel (Developer mode) to inspect background/service worker logs and content script console messages.
