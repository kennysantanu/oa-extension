// Get values from specified element IDs and create a structured object
function getPatientInfo() {
  const getValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    if (el.tagName === "SELECT") {
      return el.options[el.selectedIndex]?.value || "";
    }
    return el.value !== undefined ? el.value : el.textContent;
  };

  function padToTwoDigits(value) {
    if (value == null) return "00";
    const s = String(value);
    return s.padStart(2, "0");
  }

  return {
    demographics: {
      patientId: getValue("ctl00_phFolderContent_ucPatient_lblPatientID"),
      lastName: getValue("ctl00_phFolderContent_ucPatient_LastName"),
      firstName: getValue("ctl00_phFolderContent_ucPatient_FirstName"),
      dob: {
        month: padToTwoDigits(
          getValue("ctl00_phFolderContent_ucPatient_DOB_Month")
        ),
        day: padToTwoDigits(
          getValue("ctl00_phFolderContent_ucPatient_DOB_Day")
        ),
        year: getValue("ctl00_phFolderContent_ucPatient_DOB_Year"),
      },
      street: getValue("ctl00_phFolderContent_ucPatient_AddressLine1"),
      city: getValue("ctl00_phFolderContent_ucPatient_City"),
      state: getValue("ctl00_phFolderContent_ucPatient_lstState"),
      zipCode: getValue("ctl00_phFolderContent_ucPatient_Zip"),
    },
    primaryInsurance: {
      name: getValue("ctl00_phFolderContent_ucPatient_InsuranceName"),
      id: getValue("ctl00_phFolderContent_ucPatient_InsuranceSubscriberID"),
      groupNumber: getValue("ctl00_phFolderContent_ucPatient_InsuranceGroupNo"),
    },
    secondaryInsurance: {
      name: getValue("ctl00_phFolderContent_ucPatient_SecondaryInsuranceName"),
      id: getValue(
        "ctl00_phFolderContent_ucPatient_SecondaryInsuranceSubscriberID"
      ),
      groupNumber: getValue(
        "ctl00_phFolderContent_ucPatient_SecondaryInsuranceGroupNo"
      ),
    },
  };
}

// Notify the background script that the Edit Patient page is detected
chrome.runtime.sendMessage({
  type: "PM_EDIT_PATIENT_PAGE",
  payload: getPatientInfo(),
});
