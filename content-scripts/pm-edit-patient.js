// Get values from specified element IDs and create a structured object
const getPatientInfo = () => {
  const getValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    if (el.tagName === "SELECT") {
      return el.options[el.selectedIndex]?.value || "";
    }
    return el.value !== undefined ? el.value : el.textContent;
  };

  return {
    demographics: {
      patientId: getValue("ctl00_phFolderContent_ucPatient_lblPatientID"),
      lastName: getValue("ctl00_phFolderContent_ucPatient_LastName"),
      firstName: getValue("ctl00_phFolderContent_ucPatient_FirstName"),
      gender: getValue("ctl00_phFolderContent_ucPatient_lblGender"),
      dob: (() => {
        const dobAge = getValue("ctl00_phFolderContent_ucPatient_lblDOB");
        return dobAge ? dobAge.split(" - ")[0] : null;
      })(),
      age: (() => {
        const dobAge = getValue("ctl00_phFolderContent_ucPatient_lblDOB");
        return dobAge ? dobAge.split(" - ")[1] : null;
      })(),
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
};

// Notify the background script that the Edit Patient page is detected
chrome.runtime.sendMessage({
  type: "PM_EDIT_PATIENT_PAGE",
  payload: getPatientInfo(),
});
