// Listen for patient info sent from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Guard against null/undefined messages (service worker used to forward `null`)
  if (!message || !message.type) {
    return;
  }

  if (message.type === "PM_EDIT_PATIENT_PAGE") {
    const contentDiv = document.getElementById("page-action-content");
    if (contentDiv) {
      const p = message.payload || {};
      const demo = p.demographics || {};
      const dob = demo.dob || {};
      const pi = p.primaryInsurance || {};
      const si = p.secondaryInsurance || {};

      // Helper to render a label/value pair only when the value is non-empty
      const renderField = (label, value) => {
        const v = value ? String(value).trim() : "";
        if (!v) return "";
        return `<div class="field-label">${label}</div><div class="field-value mono">${v}</div>`;
      };

      contentDiv.innerHTML = `
          <div class="patient-item">
          <div class="patient-info">
            <div class="patient-name">${demo.lastName || ""}${
        demo.lastName || demo.firstName ? ", " : ""
      }${demo.firstName || ""}</div>
            <div class="patient-meta">${dob.month || ""}/${dob.day || ""}/${
        dob.year || ""
      }</div>
          </div>
          </div>
        <div class="patient-details">
          ${renderField("Primary:", pi.name)}${renderField(
        "Primary ID:",
        pi.id
      )}
          ${renderField("Secondary:", si.name)}${renderField(
        "Secondary ID:",
        si.id
      )}
        </div>`;
    }
  }
});

// Event listener for side panel
document.addEventListener("DOMContentLoaded", function () {
  const clearNotesBtn = document.getElementById("clear-temporary-notes-btn");
  if (clearNotesBtn) {
    clearNotesBtn.addEventListener("click", function () {
      const textarea = document.getElementById("temporary-notes-textarea");
      if (textarea) {
        textarea.value = "";
      }
    });
  }

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      window.location.reload();
    });
  }
});

// Request the latest page action data when the side panel loads
chrome.runtime.sendMessage({
  type: "CHECK_PAGE_ACTION",
});
