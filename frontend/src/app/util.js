import NotificationSnackbarSlice from "../components/base/NotificationSnackbar/NotificationSnackbarSlice";

export const isUser = (me) => {
  if (!me) {
    return false;
  } else {
    let listOfRoleLabel = [];
    for (let i = 0; i < me?.roles?.length; i++) {
      listOfRoleLabel.push(me?.roles[i]?.roleLabel);
    }
    if (listOfRoleLabel.indexOf("User") >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export const isUserHoU = (me) => {
  if (!me) {
    return false;
  } else {
    let listOfRoleLabel = [];
    for (let i = 0; i < me?.roles?.length; i++) {
      listOfRoleLabel.push(me?.roles[i]?.roleLabel);
    }
    if (listOfRoleLabel.indexOf("HoU Delegate") >= 0 || listOfRoleLabel.indexOf("HoU") >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export const isUserCFSO = (me) => {
  if (!me) {
    return false;
  } else {
    let listOfRoleLabel = [];
    for (let i = 0; i < me?.roles?.length; i++) {
      listOfRoleLabel.push(me?.roles[i]?.roleLabel);
    }
    if (listOfRoleLabel.indexOf("Service Admin") >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export const isUserEventOrganizer = (me) => {
  if (!me) {
    return false;
  } else {
    let listOfRoleLabel = [];
    for (let i = 0; i < me?.roles?.length; i++) {
      listOfRoleLabel.push(me?.roles[i]?.roleLabel);
    }
    if (listOfRoleLabel.indexOf("Event Organizer") >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export const displaySuccessSnackbar = (result) => {
  return NotificationSnackbarSlice.actions.appendNotification({ severity: "success", message: result.message });
}

export const displayErrorSnackbar = (error) => {
  return NotificationSnackbarSlice.actions.appendNotification({ severity: "warning", message: error.message });
}

export const downloadFile = (fileName, contentBlob) => {
  const downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(contentBlob);
  }
  else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(contentBlob);
    downloadLink.onclick = (event)=>{document.body.removeChild(event.target);};
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
  if (window.webkitURL != null) {
    downloadLink.href = window.webkitURL.revokeObjectURL(contentBlob);
  }
  else {
    downloadLink.href = window.URL.revokeObjectURL(contentBlob);
  }
}