// Variable
let patientList = [];
let visitList = [];
let capitalizeMode = false;
let currentPatientId = null;

// Functions
const showToast = (message, type = "success") => {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast${type ? ` ${type}` : ""}`.trim();
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 200);
  }, 2000);
};

const formatCapitalized = (value) => {
  if (!capitalizeMode || typeof value !== "string") return value || "";
  return value
    .split(/(\s|-|\/)/)
    .map((part) => {
      if (/(\s|-|\/)/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
};

const getDisplayValue = (value, allowCapitalize = true) => {
  if (!allowCapitalize) return value || "";
  return formatCapitalized(value);
};

const escapeHtml = (text = "") => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderPatientList = (patientList) => {
  let contentDiv = "";
  patientList.forEach((patient) => {
    contentDiv += `
    <div class="media-item patient-item" id="patient-${
      patient.demographics.patientId
    }">
      <div class="media-item__body">
        <div class="media-item__headline">
          <span class="media-item__title">
            ${patient.demographics.lastName || ""}${
      patient.demographics.lastName || patient.demographics.firstName
        ? ", "
        : ""
    }${patient.demographics.firstName || ""}
          </span>
          <span class="media-item__meta">(${
            patient.demographics.dob || ""
          })</span>
        </div>
        <div class="media-item__subline">
          <span class="media-item__meta">${
            patient.primaryInsurance.name || ""
          }</span>
        </div>
        <div class="media-item__subline">
          <span class="media-item__meta">${
            patient.secondaryInsurance.name || ""
          }</span>
        </div>
      </div>
      <div class="media-item__actions">
        <button class="btn btn--icon media-item__action" id="view-details-btn-${
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

  currentPatientId = patientId;

  const capitalizeToggle = document.getElementById("capitalize-toggle");
  if (capitalizeToggle) {
    capitalizeToggle.checked = capitalizeMode;
  }

  // Helper function to render a field
  const renderField = (label, value) => {
    if (!value) return "";
    return `
      <div class="detail__field">
        <div class="detail__label">${label}:</div>
        <div class="detail__value">${value || ""}</div>
        <button
          class="btn btn--ghost detail__copy-btn copy-btn"
          data-copy-label="${label}"
          title="Copy ${label}"
          aria-label="Copy ${label}"
        >
          <span class="icon">
            <img src="icons/clipboard.svg" alt="Copy ${label} Icon" />
          </span>
        </button>
      </div>
    `;
  };

  // Render patient details in the UI
  // Header
  const header = document.getElementById("patient-detail-title");
  if (header) {
    const lastName = getDisplayValue(patient.demographics.lastName);
    const firstName = getDisplayValue(patient.demographics.firstName);
    const gender = getDisplayValue(patient.demographics.gender);
    header.innerHTML = `${lastName}${
      lastName || firstName ? ", " : ""
    }${firstName} (${gender || ""})`;
  }

  // Demographic fields
  const demographicsFields = document.getElementById("demographics-fields");
  if (demographicsFields) {
    demographicsFields.innerHTML = `
      ${renderField(
        "Last Name",
        getDisplayValue(patient.demographics.lastName)
      )}
      ${renderField(
        "First Name",
        getDisplayValue(patient.demographics.firstName)
      )}
      ${renderField("DOB", getDisplayValue(patient.demographics.dob, false))}
      ${renderField("Age", getDisplayValue(patient.demographics.age, false))}
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
        ${renderField("Name", getDisplayValue(patient.primaryInsurance.name))}
        ${renderField(
          "ID",
          getDisplayValue(patient.primaryInsurance.id, false)
        )}
        ${renderField(
          "Group Number",
          getDisplayValue(patient.primaryInsurance.groupNumber, false)
        )}
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
        ${renderField("Name", getDisplayValue(patient.secondaryInsurance.name))}
        ${renderField(
          "ID",
          getDisplayValue(patient.secondaryInsurance.id, false)
        )}
        ${renderField(
          "Group Number",
          getDisplayValue(patient.secondaryInsurance.groupNumber, false)
        )}
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
      ${renderField("Street", getDisplayValue(patient.demographics.street))}
      ${renderField("City", getDisplayValue(patient.demographics.city))}
      ${renderField(
        "State",
        getDisplayValue(patient.demographics.state, false)
      )}
      ${renderField(
        "Zip Code",
        getDisplayValue(patient.demographics.zipCode, false)
      )}
    `;
  }

  // Patient notes
  const notesContainer = document.getElementById("patient-notes");
  if (notesContainer) {
    const notes = patient.notes || [];
    if (!notes.length) {
      notesContainer.innerHTML =
        '<div class="empty-state text-muted">No patient notes found.</div>';
    } else {
      notesContainer.innerHTML = notes
        .map((note) => {
          const safeNote = escapeHtml(note.note || "Empty note");
          const safeDate = escapeHtml(note.dateCreated || "");
          return `
            <div class="note-item">
              <div class="note-item__date">${safeDate}</div>
              <div class="note-item__text">${safeNote}</div>
            </div>
          `;
        })
        .join("");
    }
  }

  // Switch to patient detail view
  if (recentPatientsSection && patientDetailSection) {
    recentPatientsSection.classList.add("hidden");
    patientDetailSection.classList.remove("hidden");
  }
};

const renderVisitList = (visitList) => {
  let contentDiv = "";
  visitList.forEach((visit) => {
    contentDiv += `
    <div class="media-item visit-item" id="visit-${visit.visitId}">
      <div class="media-item__body">
        <div class="media-item__headline">
          <span class="media-item__title">
            ${visit.demographics.lastName || ""}${
      visit.demographics.lastName || visit.demographics.firstName ? ", " : ""
    }${visit.demographics.firstName || ""}
          </span>
          <span class="media-item__meta">(${
            visit.demographics.dob || ""
          })</span>
        </div>
        <div class="media-item__subline">
          <span class="media-item__title">${visit.visitDate || ""}</span>
          <span class="media-item__meta">(${visit.cpt || ""})</span>
          <span class="amount amount--charge">$${visit.charge || ""}</span>
          <span class="amount amount--payment">$${visit.payment || ""}</span>
          <span class="amount amount--balance">$${visit.balance || ""}</span>
        </div>
        <div class="media-item__subline">
          <span class="media-item__meta">${
            visit.primaryInsurance.name || ""
          }</span>
        </div>
        <div class="media-item__subline">
          <span class="media-item__meta">${
            visit.secondaryInsurance.name || ""
          }</span>
        </div>
      </div>      
    </div>`;
  });
  return contentDiv;
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

  // pm-edit-visit.js
  if (message.type === "PM_EDIT_VISIT_PAGE") {
    const VISIT_INFO = message.payload || {};
    const MAX_ENTRIES = 10;

    for (let i = 0; i < visitList.length; i++) {
      const v = visitList[i];
      if (VISIT_INFO.visitId && v.visitId === VISIT_INFO.visitId) {
        visitList.splice(i, 1);
        break;
      }
    }

    visitList.unshift(VISIT_INFO);

    if (visitList.length > MAX_ENTRIES) {
      visitList = visitList.slice(0, MAX_ENTRIES);
    }

    const contentDiv = document.getElementById("recent-visits-content");
    if (contentDiv) {
      contentDiv.innerHTML = renderVisitList(visitList);
    }
  }
});

// Event listener for side panel
document.addEventListener("DOMContentLoaded", function () {
  // Tab functionality
  const patientTabBtn = document.getElementById("patient-tab-btn");
  const visitTabBtn = document.getElementById("visit-tab-btn");
  const patientTab = document.getElementById("patient-tab");
  const visitTab = document.getElementById("visit-tab");

  const switchTab = (activeBtn, inactiveBtn, activeTab, inactiveTab) => {
    // Update button classes
    activeBtn.classList.add("is-active");
    inactiveBtn.classList.remove("is-active");

    // Update tab content classes
    activeTab.classList.add("is-active");
    inactiveTab.classList.remove("is-active");
  };

  if (patientTabBtn && visitTabBtn && patientTab && visitTab) {
    patientTabBtn.addEventListener("click", function () {
      switchTab(patientTabBtn, visitTabBtn, patientTab, visitTab);
    });

    visitTabBtn.addEventListener("click", function () {
      switchTab(visitTabBtn, patientTabBtn, visitTab, patientTab);
    });
  }

  const capitalizeToggle = document.getElementById("capitalize-toggle");
  if (capitalizeToggle) {
    capitalizeToggle.addEventListener("change", (event) => {
      capitalizeMode = event.target.checked;
      if (currentPatientId) {
        renderPatientDetail(currentPatientId);
      }
    });
  }

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

  const refreshVisitsBtn = document.getElementById("refresh-visits-btn");
  if (refreshVisitsBtn) {
    refreshVisitsBtn.addEventListener("click", function () {
      window.location.reload();
    });
  }

  // Add click handler to all patient detail buttons
  const recentContent = document.getElementById("recent-patients-content");
  if (recentContent) {
    recentContent.addEventListener("click", (event) => {
      const btn = event.target.closest(".media-item__action");
      if (!btn) return;

      // try to get patient id from the button id first, otherwise from parent .patient-item
      let patientId = null;
      const idMatch = (btn.id || "").match(/^view-details-btn-(.+)$/);
      if (idMatch) {
        patientId = idMatch[1];
      } else {
        const item = btn.closest(".media-item");
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
      const fieldItem = copyBtn.closest(".detail__field");
      if (!fieldItem) return;
      const valueDiv = fieldItem.querySelector(".detail__value");
      if (!valueDiv) return;
      const text = valueDiv.textContent || "";
      const label = copyBtn.dataset.copyLabel || "Field";

      const setSuccess = () => {
        showToast(`${label} copied`, "success");
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

// Render visit list from session storage when the side panel loads
chrome.runtime.sendMessage(
  {
    type: "GET_VISIT_LIST",
  },
  (response) => {
    visitList = response || [];
    const contentDiv = document.getElementById("recent-visits-content");
    if (contentDiv) {
      if (visitList.length === 0) {
        contentDiv.innerHTML = `
          <div class="empty-state">
            <p>No recent visits available.</p>
          </div>`;
        return;
      }

      contentDiv.innerHTML = renderVisitList(visitList);
    }
  }
);
