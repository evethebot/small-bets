// ============================================================
// TabFlow AI — Content Script (minimal)
// ============================================================
// This extension primarily operates via the background worker
// and popup. The content script is kept minimal.

// Notify background that content script loaded
chrome.runtime.sendMessage({ type: 'CONTENT_LOADED' }).catch(() => {
  // Background may not be ready yet — that's fine
})
