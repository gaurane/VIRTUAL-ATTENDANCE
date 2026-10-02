function doGet(e) {
  if (e.parameter.page === 'admin') {
    return HtmlService.createHtmlOutputFromFile('Admin')
        .setTitle('Admin Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } else {
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Workshop Attendance')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

// ==========================================
// STUDENT VIEW FUNCTIONS
// ==========================================

function getStudentsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("SETTINGS");
  const masterSheet = ss.getSheetByName("MASTER ATTENDANCE");
  
  const activeSession = settingsSheet.getRange("B5").getValue().toString().trim();
  
  if (activeSession === "" || activeSession.toLowerCase() === "closed") {
    return { error: "Attendance is currently closed." };
  }
  
  const lastRow = masterSheet.getLastRow();
  if (lastRow < 2) return { error: "No students registered yet." };
  
  const data = masterSheet.getRange(2, 2, lastRow - 1, 9).getValues(); 
  
  let sessionIndex = -1;
  if (activeSession === "Day 1 - Session 1") sessionIndex = 5; 
  else if (activeSession === "Day 1 - Session 2") sessionIndex = 6; 
  else if (activeSession === "Day 2 - Session 1") sessionIndex = 7; 
  else if (activeSession === "Day 2 - Session 2") sessionIndex = 8; 
  
  if (sessionIndex === -1) return { error: "Invalid active session configured in Settings." };
  
  let students = [];
  for (let i = 0; i < data.length; i++) {
    let name = data[i][0];
    let rollNo = data[i][1];
    let status = data[i][sessionIndex];
    if (name && rollNo) {
      students.push({
        name: name,
        rollNo: rollNo,
        isPresent: (status === "PRESENT")
      });
    }
  }
  
  return { session: activeSession, students: students };
}

function markAttendance(rollNo, codeSubmitted) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("SETTINGS");
  const logSheet = ss.getSheetByName("ATTENDANCE LOG");
  
  const settingsData = settingsSheet.getRange("A5:B9").getValues();
  const activeSession = settingsData[0][1].toString().trim();
  
  let correctCode = "";
  if (activeSession === "Day 1 - Session 1") correctCode = settingsData[1][1]; 
  else if (activeSession === "Day 1 - Session 2") correctCode = settingsData[2][1]; 
  else if (activeSession === "Day 2 - Session 1") correctCode = settingsData[3][1]; 
  else if (activeSession === "Day 2 - Session 2") correctCode = settingsData[4][1]; 
  else return { success: false, message: "Attendance is closed." };
  
  if (codeSubmitted.toString().toLowerCase().trim() !== correctCode.toString().toLowerCase().trim()) {
    return { success: false, message: "Invalid Attendance Code." };
  }
  
  const logLastRow = logSheet.getLastRow();
  if (logLastRow > 1) {
    const logData = logSheet.getRange(2, 2, logLastRow - 1, 2).getValues(); 
    for(let i=0; i<logData.length; i++){
      if(logData[i][0].toString().toUpperCase() === rollNo.toString().toUpperCase() && logData[i][1] === activeSession) {
        return { success: false, message: "You are already marked present." };
      }
    }
  }
  
  logSheet.appendRow([new Date(), rollNo.toString().toUpperCase(), activeSession, "PRESENT"]);
  return { success: true, message: "Attendance Marked Successfully!" };
}

// ==========================================
// ADMIN DASHBOARD FUNCTIONS
// ==========================================

function getAdminData(password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("SETTINGS");
  
  // Verify Password from Cell B10
  const realPassword = settingsSheet.getRange("B10").getValue().toString().trim();
  if (password !== realPassword) {
    return { auth: false, message: "Invalid Password." };
  }

  const activeSession = settingsSheet.getRange("B5").getValue().toString().trim();
  
  const masterSheet = ss.getSheetByName("MASTER ATTENDANCE");
  const lastRow = masterSheet.getLastRow();
  
  let totalRegistered = 0;
  let totalPresent = 0;
  let presentStudents = [];
  
  if (lastRow > 1) {
    totalRegistered = lastRow - 1;
    const data = masterSheet.getRange(2, 2, totalRegistered, 9).getValues();
    
    let sessionIndex = -1;
    if (activeSession === "Day 1 - Session 1") sessionIndex = 5; 
    else if (activeSession === "Day 1 - Session 2") sessionIndex = 6; 
    else if (activeSession === "Day 2 - Session 1") sessionIndex = 7; 
    else if (activeSession === "Day 2 - Session 2") sessionIndex = 8; 

    for (let i = 0; i < data.length; i++) {
      if (sessionIndex !== -1 && data[i][sessionIndex] === "PRESENT") {
        totalPresent++;
        presentStudents.push({
          name: data[i][0],
          rollNo: data[i][1]
        });
      }
    }
  }

  return {
    auth: true,
    activeSession: activeSession,
    totalRegistered: totalRegistered,
    totalPresent: totalPresent,
    presentStudents: presentStudents
  };
}

function updateActiveSession(newSession, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("SETTINGS");
  
  const realPassword = settingsSheet.getRange("B10").getValue().toString().trim();
  if (password !== realPassword) {
    return { success: false, message: "Invalid Password." };
  }

  settingsSheet.getRange("B5").setValue(newSession);
  return { success: true, message: "Session updated to " + newSession };
}
