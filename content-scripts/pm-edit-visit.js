const urlObj = new URL(window.location.href);

// Extract visit details from the Edit Visit page and send them to the extension
const getVisitData = () => {
  const getValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    if (el.tagName === "SELECT") {
      return el.options[el.selectedIndex]?.value || "";
    }
    return el.value !== undefined ? el.value : el.textContent;
  };

  return {
    visitId: urlObj.searchParams.get("ID"),
    visitDate: getValue(
      "ctl00_phFolderContent_ucVisitLineItem_ucBillingCPT_DOS0"
    ),
    cpt: getValue("ctl00_phFolderContent_ucVisitLineItem_ucBillingCPT_CPT0"),
    charge: getValue("ctl00_phFolderContent_ucVisitLineItem_TotalLineCharge"),
    payment: getValue(
      "ctl00_phFolderContent_ucVisitLineItem_TotalInsurancePayment"
    ),
    balance: getValue("ctl00_phFolderContent_ucVisitLineItem_TotalBalance"),
    demographics: {
      patientId: getValue("ctl00_phFolderContent_PatientID"),
      lastName: getValue("ctl00_phFolderContent_PatientLastName"),
      firstName: getValue("ctl00_phFolderContent_PatientFirstName"),
      gender: getValue("ctl00_phFolderContent_PatientGender"),
      dob: (() => {
        let val = getValue("ctl00_phFolderContent_PatientDOB");
        const parts = val.split("/");
        parts[0] = parts[0].padStart(2, "0");
        parts[1] = parts[1].padStart(2, "0");
        val = parts.join("/");
        return val;
      })(),
    },
    primaryInsurance: {
      name: getValue("ctl00_phFolderContent_InsuranceName"),
      id: getValue("ctl00_phFolderContent_InsuranceSubscriberID"),
      groupNumber: getValue("ctl00_phFolderContent_InsuranceGroupNo"),
    },
    secondaryInsurance: {
      name: getValue("ctl00_phFolderContent_SecondaryInsuranceName"),
      id: getValue("ctl00_phFolderContent_SecondaryInsuranceSubscriberID"),
      groupNumber: getValue("ctl00_phFolderContent_SecondaryInsuranceGroupNo"),
    },
  };
};

// Only run the script on the Edit Visit page
if (urlObj.searchParams.has("ID")) {
  // Notify the background script that the Edit Visit page is detected
  chrome.runtime.sendMessage({
    type: "PM_EDIT_VISIT_PAGE",
    payload: getVisitData(),
  });
}
