// Variable
let patientList = [];

// Functions
const renderPatientList = (patientList) => {
  let contentDiv = "";
  patientList.forEach((patient) => {
    contentDiv += `
    <div class="patient-item" id="patient-${patient.demographics.patientId}">
      <div class="patient-info">
        <div>
          <span class="patient-name">
            ${patient.demographics.lastName || ""}${
      patient.demographics.lastName || patient.demographics.firstName
        ? ", "
        : ""
    }${patient.demographics.firstName || ""}
          </span>
          <span class="patient-meta">
            (${patient.demographics.dob || ""})
          </span>
        </div>
        <div>
          <span class="patient-meta">
            ${patient.primaryInsurance.name || ""}
          </span>
        </div>
        <div>
          <span class="patient-meta">
            ${patient.secondaryInsurance.name || ""}
          </span>
        </div>
      </div>
      <div class="patient-actions">
        <button class="patient-item-icon-btn" id="view-details-btn-${
          patient.demographics.patientId
        }" title="View Patient Data">
          <span class="icon">
            <img src="icons/eye.svg" alt="View Patient Data Icon" />
          </span>
        </button>
      </div>
    </div>`;
  });
  return contentDiv;
};

const renderPatientDetail = (patientId) => {
  const recentPatientsSection = document.getElementById(
    "recent-patients-section"
  );
  const patientDetailSection = document.getElementById(
    "patient-detail-section"
  );

  // Get patient info from patientList
  const patient = patientList.find(
    (p) => p.demographics.patientId === patientId
  );
  if (!patient) {
    console.error("Patient not found:", patientId);
    return;
  }

  // Helper function to render a field
  const renderField = (label, value) => {
    if (!value) return "";
    return `
      <div class="field-item">
        <div class="field-label">${label}:</div>
        <div class="field-value">${value || ""}</div>
        <button class="copy-btn" title="Copy ${label}" aria-label="Copy ${label}">📋</button>
      </div>
    `;
  };

  // Render patient details in the UI
  // Header
  const header = document.getElementById("patient-detail-title");
  if (header) {
    const capitalize = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const lastName = patient.demographics.lastName
      ? capitalize(patient.demographics.lastName)
      : "";
    const firstName = patient.demographics.firstName
      ? capitalize(patient.demographics.firstName)
      : "";
    header.innerHTML = `${lastName}${
      lastName || firstName ? ", " : ""
    }${firstName} (${patient.demographics.gender || ""})`;
  }

  // Demographic fields
  const demographicsFields = document.getElementById("demographics-fields");
  if (demographicsFields) {
    demographicsFields.innerHTML = `
      ${renderField("Last Name", patient.demographics.lastName)}
      ${renderField("First Name", patient.demographics.firstName)}
      ${renderField("DOB", patient.demographics.dob)}
      ${renderField("Age", patient.demographics.age)}
    `;
  }

  // Primary Insurance fields
  const piFields = document.getElementById("primary-insurance-fields");
  if (piFields) {
    const hasPrimary =
      patient.primaryInsurance &&
      (patient.primaryInsurance.name ||
        patient.primaryInsurance.id ||
        patient.primaryInsurance.groupNumber);
    if (hasPrimary) {
      piFields.innerHTML = `
        ${renderField("Name", patient.primaryInsurance.name)}
        ${renderField("ID", patient.primaryInsurance.id)}
        ${renderField("Group Number", patient.primaryInsurance.groupNumber)}
      `;
    } else {
      piFields.innerHTML =
        '<div class="empty-state text-muted">No insurance information</div>';
    }
  }

  // Secondary Insurance fields
  const siFields = document.getElementById("secondary-insurance-fields");
  if (siFields) {
    const hasSecondary =
      patient.secondaryInsurance &&
      (patient.secondaryInsurance.name ||
        patient.secondaryInsurance.id ||
        patient.secondaryInsurance.groupNumber);
    if (hasSecondary) {
      siFields.innerHTML = `
        ${renderField("Name", patient.secondaryInsurance.name)}
        ${renderField("ID", patient.secondaryInsurance.id)}
        ${renderField("Group Number", patient.secondaryInsurance.groupNumber)}
      `;
    } else {
      siFields.innerHTML =
        '<div class="empty-state text-muted">No insurance information</div>';
    }
  }

  // Contact Information fields
  const contactFields = document.getElementById("contact-information-fields");
  if (contactFields) {
    contactFields.innerHTML = `
      ${renderField("Street", patient.demographics.street)}
      ${renderField("City", patient.demographics.city)}
      ${renderField("State", patient.demographics.state)}
      ${renderField("Zip Code", patient.demographics.zipCode)}
    `;
  }

  // Switch to patient detail view
  if (recentPatientsSection && patientDetailSection) {
    recentPatientsSection.classList.add("hidden");
    patientDetailSection.classList.remove("hidden");
  }
};

// ## Chrome onMessage listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Guard against null/undefined messages (service worker used to forward `null`)
  if (!message || !message.type) {
    return;
  }

  // pm-edit-patient.js
  if (message.type === "PM_EDIT_PATIENT_PAGE") {
    const PATIENT_INFO = message.payload || {};
    const MAX_ENTRIES = 10;

    for (let i = 0; i < patientList.length; i++) {
      if (
        PATIENT_INFO.demographics.patientId ===
        patientList[i].demographics.patientId
      ) {
        patientList.splice(i, 1);
        break;
      }
    }

    patientList.unshift(PATIENT_INFO);

    if (patientList.length > MAX_ENTRIES) {
      patientList = patientList.slice(0, MAX_ENTRIES);
    }

    const contentDiv = document.getElementById("recent-patients-content");
    if (contentDiv) {
      contentDiv.innerHTML = renderPatientList(patientList);
    }
  }
});

// Event listener for side panel
document.addEventListener("DOMContentLoaded", function () {
  const backToListBtn = document.getElementById("back-to-list-btn");
  if (backToListBtn) {
    backToListBtn.addEventListener("click", function () {
      const recentPatientsSection = document.getElementById(
        "recent-patients-section"
      );
      const patientDetailSection = document.getElementById(
        "patient-detail-section"
      );

      if (recentPatientsSection && patientDetailSection) {
        recentPatientsSection.classList.remove("hidden");
        patientDetailSection.classList.add("hidden");
      }
    });
  }

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

  // Add click handler to all patient detail buttons
  const recentContent = document.getElementById("recent-patients-content");
  if (recentContent) {
    recentContent.addEventListener("click", (event) => {
      const btn = event.target.closest(".patient-item-icon-btn");
      if (!btn) return;

      // try to get patient id from the button id first, otherwise from parent .patient-item
      let patientId = null;
      const idMatch = (btn.id || "").match(/^view-details-btn-(.+)$/);
      if (idMatch) {
        patientId = idMatch[1];
      } else {
        const item = btn.closest(".patient-item");
        const itemMatch = ((item && item.id) || "").match(/^patient-(.+)$/);
        if (itemMatch) patientId = itemMatch[1];
      }
      if (!patientId) return;

      // switch sections
      const recentPatientsSection = document.getElementById(
        "recent-patients-section"
      );
      const patientDetailSection = document.getElementById(
        "patient-detail-section"
      );
      if (recentPatientsSection && patientDetailSection) {
        recentPatientsSection.classList.add("hidden");
        patientDetailSection.classList.remove("hidden");
      }

      // render the detail view (implementation is in renderPatientDetail)
      renderPatientDetail(patientId);
    });
  }

  // Copy-to-clipboard handler (event delegation for all copy buttons in detail section)
  const patientDetailSection = document.getElementById(
    "patient-detail-section"
  );
  if (patientDetailSection) {
    patientDetailSection.addEventListener("click", (e) => {
      const copyBtn = e.target.closest(".copy-btn");
      if (!copyBtn) return;
      const fieldItem = copyBtn.closest(".field-item");
      if (!fieldItem) return;
      const valueDiv = fieldItem.querySelector(".field-value");
      if (!valueDiv) return;
      const text = valueDiv.textContent || "";

      const original = copyBtn.textContent;
      const setSuccess = () => {
        copyBtn.textContent = "✓";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove("copied");
        }, 1200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(setSuccess)
          .catch(() => {
            // fallback
            try {
              const ta = document.createElement("textarea");
              ta.value = text;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
              setSuccess();
            } catch (err) {
              console.error("Copy failed", err);
            }
          });
      } else {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setSuccess();
        } catch (err) {
          console.error("Copy failed", err);
        }
      }
    });
  }
});

// Render patient list from session storage when the side panel loads
chrome.runtime.sendMessage(
  {
    type: "GET_PATIENT_LIST",
  },
  (response) => {
    patientList = response || [];
    const contentDiv = document.getElementById("recent-patients-content");
    if (contentDiv) {
      if (patientList.length === 0) {
        contentDiv.innerHTML = `
          <div class="empty-state">
            <p>No recent patients available.</p>
          </div>`;
        return;
      }

      contentDiv.innerHTML = renderPatientList(patientList);
    }
  }
);
