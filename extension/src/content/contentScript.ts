import { scanApplicationForm } from './scanner';
import { injectAutofillValues } from './injector';

console.log('🛡️ LokSetu Content Script Active on Portal DOM.');

// Auto-notify background on portal load
if (document.querySelector('form')) {
  try {
    chrome.runtime.sendMessage({ type: 'FORM_DETECTED', url: window.location.href });
  } catch (e) {
    // Context invalidated or standalone dev mode
  }
}

// Listen for sidepanel / background messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_DOM') {
    const fields = scanApplicationForm();
    sendResponse({ success: true, fields });
    return true;
  }

  if (message.type === 'AUTOFILL_DOM') {
    const res = injectAutofillValues(message.items || []);
    sendResponse({ success: true, filledCount: res.filledCount });
    return true;
  }
});
