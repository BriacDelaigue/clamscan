// ------------------------
// State
// ------------------------
let isScanning = false;

// ------------------------
// Element references
// ------------------------
const filenameEl = document.getElementById('clam-filename');
const extensionEl = document.getElementById('clam-extension');
const virusEl = document.getElementById('clam-virus');
const sizeEl = document.getElementById('clam-size');
const timeEl = document.getElementById('clam-time');
const rawEl = document.getElementById('clam-raw');

const uploadDiv = document.getElementById('clam-upload');
const fileInput = document.getElementById('clam-file-input');
const urlInput = document.getElementById('clam-url-input');
const scanUrlBtn = document.getElementById('clam-scan-url');
const resetBtn = document.getElementById('clam-reload');

// ------------------------
// Helper Functions
// ------------------------

/**
 * Show the loading state while scanning a file or URL
 */
function setLoading() {
  filenameEl.textContent = 'Scanning...';
  extensionEl.textContent = '';
  virusEl.textContent = 'Searching...';
  sizeEl.textContent = '';
  timeEl.textContent = '';
  rawEl.textContent = '';
}

/**
 * Display scan results in the popup
 * @param {object} json - Scan result from backend
 */
function setResult(json) {
  const filename = json.filename || 'Unknown file';
  filenameEl.textContent = filename.length > 30 ? filename.slice(0, 30) + '…' : filename;
  extensionEl.textContent = `Extension: ${json.extension || '-'}`;
  virusEl.textContent = json.virusName || 'None detected';
  sizeEl.textContent = json.sizeInBytes ? `${(json.sizeInBytes / 1024).toFixed(2)} KB` : '-';
  timeEl.textContent = json.scanDurationMillis ? `${json.scanDurationMillis} ms` : '-';
  rawEl.textContent = json.rawResponse || JSON.stringify(json);
}

/**
 * Reset the popup UI to initial state
 */
function resetPopup() {
  filenameEl.textContent = 'Waiting for file..';
  extensionEl.textContent = 'Extension: -';
  virusEl.textContent = '-';
  sizeEl.textContent = '-';
  timeEl.textContent = '-';
  rawEl.textContent = '-';
  urlInput.value = '';
  fileInput.value = '';
  uploadDiv.style.borderColor = '#CBD5E0';
}

/**
 * Scan a local file
 * @param {File} file
 */
function scanFile(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alert('Max file size is 10 MB');
    return;
  }

  setLoading();
  isScanning = true;

  const reader = new FileReader();
  reader.onload = function () {
    chrome.runtime.sendMessage(
      { action: 'scanFile', buffer: reader.result, filename: file.name, type: file.type },
      (resp) => {
        isScanning = false;
        if (resp?.ok) setResult(resp.data);
        else {
          filenameEl.textContent = 'Error during scan';
          rawEl.textContent = resp?.error || 'Unknown error';
        }
      }
    );
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Scan a URL
 * @param {string} url
 */
function scanUrl(url) {
  if (!url) {
    alert('Please enter a URL');
    return;
  }

  setLoading();
  isScanning = true;

  chrome.runtime.sendMessage({ action: 'scanUrl', url }, (resp) => {
    isScanning = false;
    if (resp?.ok) setResult(resp.data);
    else {
      filenameEl.textContent = 'Error during scan';
      rawEl.textContent = resp?.error || 'Unknown error';
    }
  });
}

// ------------------------
// Event Listeners
// ------------------------

// File upload (click & drag/drop)
uploadDiv.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => scanFile(e.target.files[0]));

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
  uploadDiv.addEventListener(evt, (e) => {
    e.preventDefault();
    if (evt === 'drop' && e.dataTransfer.files?.[0]) scanFile(e.dataTransfer.files[0]);
  });
});

// Scan URL button
scanUrlBtn.addEventListener('click', () => scanUrl(urlInput.value.trim()));

// Reset button
resetBtn.addEventListener('click', resetPopup);

// ------------------------
// Context menu URL handling
// ------------------------

// When popup opens, check if a URL was saved by the context menu
chrome.storage.local.get('urlToScan', (data) => {
  if (data.urlToScan) {
    urlInput.value = data.urlToScan;
    scanUrl(data.urlToScan);
    chrome.storage.local.remove('urlToScan'); // clear after using
  }
});