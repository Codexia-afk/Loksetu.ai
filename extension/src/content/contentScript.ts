import { parseDOMFields, autofillDOMFields } from './domParser';

console.log('🛡️ LokSetu v2 Content Script Active on Portal DOM.');

// Auto-notify sidepanel / background on portal load
if (document.querySelector('form') || document.querySelector('input')) {
  try {
    chrome.runtime.sendMessage({ type: 'FORM_DETECTED', url: window.location.href });
  } catch (e) {
    // Isolated extension context or standalone dev mode
  }
}

// Listen for sidepanel / background requests
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SCAN_DOM') {
    const mapData = parseDOMFields();
    sendResponse({ success: true, mapData, fields: mapData.fields });
    return true;
  }

  if (message.type === 'AUTOFILL_DOM') {
    const res = autofillDOMFields(message.items || []);
    const updatedMap = parseDOMFields();
    sendResponse({ success: true, filledCount: res.successCount, mapData: updatedMap });
    return true;
  }
});
