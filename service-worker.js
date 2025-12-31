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

  if (message.type === "GET_VISIT_LIST") {
    chrome.storage.session.get(["visit_list"], (result) => {
      sendResponse(result.visit_list);
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

        if (p.demographics.patientId === PATIENT_INFO.demographics.patientId) {
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

  // pm-edit-visit.js
  if (message.type === "PM_EDIT_VISIT_PAGE") {
    const VISIT_INFO = message.payload || {};
    const STORAGE_KEY = "visit_list";
    const MAX_ENTRIES = 10;
    let visitList = [];

    chrome.storage.session.get([STORAGE_KEY]).then((result) => {
      visitList = result[STORAGE_KEY] || [];

      for (let i = 0; i < visitList.length; i++) {
        const v = visitList[i];

        if (v.visitId === VISIT_INFO.visitId) {
          visitList.splice(i, 1);
          break;
        }
      }

      visitList.unshift(VISIT_INFO);

      if (visitList.length > MAX_ENTRIES) {
        visitList = visitList.slice(0, MAX_ENTRIES);
      }

      chrome.storage.session.set({ [STORAGE_KEY]: visitList });
    });
  }
});
