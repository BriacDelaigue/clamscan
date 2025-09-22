// ------------------------
// Constants
// ------------------------
const CONTEXT_MENU_ID = 'clamscan-scan-url';
const API_BASE_URL = 'https://api.clamscan.com/api/v1/scans';

// ------------------------
// Utility Functions
// ------------------------

/**
 * Handles sending scan requests to the backend API
 * @param {object} message - Message from popup.js
 * @returns {Promise<object>}
 */
async function handleScanRequest(message) {
  if (message.action === 'scanUrl') {
    const resp = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url: message.url })
    });
    return await resp.json();
  } else if (message.action === 'scanFile') {
    const blob = new Blob([message.buffer], { type: message.type });
    const form = new FormData();
    form.append('file', blob, message.filename);

    const resp = await fetch(API_BASE_URL, { method: 'POST', body: form });
    return await resp.json();
  }

  throw new Error('Unknown scan action');
}

// ------------------------
// Initialization
// ------------------------

// Create context menu item on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Scan with ClamScan',
    contexts: ['link']
  });
});

// When context menu clicked, store the link URL
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    // Save the URL to chrome.storage so popup can read it
    chrome.storage.local.set({ urlToScan: info.linkUrl }, () => {
      console.log('URL saved for popup:', info.linkUrl);
    });
  }
});

// ------------------------
// Event Listeners
// ------------------------

// Handle context menu clicks (scan a link directly)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    chrome.runtime.sendMessage({ action: 'scanUrl', url: info.linkUrl }, (resp) => {
      if (resp?.ok) {
        console.log('Scan result:', resp.data);
        // Optionally, you could send a notification or open a popup with results
      } else {
        console.error('Scan error:', resp?.error);
      }
    });
  }
});

// Handle messages from popup.js (scanFile / scanUrl)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      const data = await handleScanRequest(message);
      sendResponse({ ok: true, data });
    } catch (err) {
      sendResponse({ ok: false, error: err?.message || String(err) });
    }
  })();

  // Indicate asynchronous response
  return true;
});