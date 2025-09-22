// Variable
let contentScriptMessage = null;

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Chrome onMessage listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  } else {
    contentScriptMessage = message;
  }

  // sidepanel.js
  if (message.type === "GET_PATIENT_LIST") {
    chrome.storage.session.get(["patient_list"], (result) => {
      sendResponse(result.patient_list);
    });

    return true;
  }

  // pm-edit-patient.js
  if (message.type === "PM_EDIT_PATIENT_PAGE") {
    const PATIENT_INFO = message.payload || {};
    const STORAGE_KEY = "patient_list";
    const MAX_ENTRIES = 10;
    let patientList = [];

    chrome.storage.session.get([STORAGE_KEY]).then((result) => {
      patientList = result[STORAGE_KEY] || [];

      for (let i = 0; i < patientList.length; i++) {
        const p = patientList[i];
        const demo = p.demographics || {};
        const incomingDemo = PATIENT_INFO.demographics || {};

        if (
          demo.patientId &&
          incomingDemo.patientId &&
          demo.patientId === incomingDemo.patientId
        ) {
          patientList.splice(i, 1);
          break;
        }
      }

      patientList.unshift(PATIENT_INFO);

      if (patientList.length > MAX_ENTRIES) {
        patientList = patientList.slice(0, MAX_ENTRIES);
      }

      chrome.storage.session.set({ [STORAGE_KEY]: patientList });
    });
  }
});
