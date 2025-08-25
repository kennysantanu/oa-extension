// Variables
let contentMessage = null;

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script and forward to side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Store the latest non-check message for later forwarding to the side panel
  if (message.type !== "CHECK_PAGE_ACTION") {
    contentMessage = message;
  }

  // When the sidepanel requests the page action, forward the last known message
  if (message.type === "CHECK_PAGE_ACTION") {
    // Only send if we have a valid message object with a type
    if (contentMessage && contentMessage.type) {
      chrome.runtime.sendMessage(contentMessage);
    } else {
      console.warn(
        "service-worker: no contentMessage to forward for CHECK_PAGE_ACTION"
      );
    }
  }
});
