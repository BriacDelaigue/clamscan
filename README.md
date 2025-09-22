# ClamScan Chrome Extension

ClamScan is a Chrome extension that allows users to scan files and URLs for viruses using the ClamScan backend API. All scanning is handled directly in the popup window. Users can upload files, paste URLs, or right-click on links to prepare a scan.


## Features

- Scan local files (up to 10 MB) for viruses.
- Scan any URL for potential threats.
- Right-click context menu to quickly prepare a scan for a link.
- Popup interface to show scan results: filename, file type, virus name, file size, scan time, and raw response.
- No injection of UI into web pages — everything runs in the popup.


## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.
5. The ClamScan icon should appear in your Chrome toolbar.


## Usage

### Scanning Files

1. Click the ClamScan icon in the Chrome toolbar.
2. Drag & drop a file into the popup or click to select a file.
3. Wait for the scan to complete. The results will appear in the popup.

### Scanning URLs

1. Click the ClamScan icon.
2. Paste a URL in the input field in the popup.
3. Click **Scan URL**.
4. Results will appear once the scan is complete.

### Right-Click Link Scan

1. Right-click any link in Chrome.
2. Select **Scan with ClamScan** from the context menu.
3. Click the ClamScan icon to open the popup.
4. The popup will automatically scan the previously selected link.


## File Structure

```
clamScan/
├─ background.js
├─ popup.js
├─ popup.html
├─ icons/
│  ├─ icon16.png
│  ├─ icon32.png
│  ├─ icon48.png
│  └─ icon128.png
├─ manifest.json
└─ README.md
```


## Permissions

- `contextMenus` – add a right-click menu to scan links.
- `activeTab` – access the currently active tab.
- `scripting` – optional if you previously injected scripts (no longer needed for popup-only).
- `storage` – store URLs temporarily between right-click and popup.


## Backend API

ClamScan uses a backend API for scanning:

- **File scan**: POST file as `multipart/form-data`.
- **URL scan**: POST URL as `application/x-www-form-urlencoded`.

Make sure your backend API is accessible at `https://api.clamscan.com/api/v1/scans` or adjust `background.js` accordingly.


## License

MIT License

Dev by [Briac DELAIGUE](https://github.com/BriacDelaigue)