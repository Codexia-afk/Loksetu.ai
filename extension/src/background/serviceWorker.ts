chrome.runtime.onInstalled.addListener(() => {
  console.log('LokSetu Manifest V3 Service Worker Installed.');
});

// Auto-open sidepanel on action click or portal detection
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FORM_DETECTED' && sender.tab?.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
  }
});
