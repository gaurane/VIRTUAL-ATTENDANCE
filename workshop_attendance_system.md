# Online Workshop Attendance Management System
**Complete Setup Guide**

This document contains the complete architecture, exact formulas, and Google Apps Script to build a fully automated, reusable, and print-ready 4-session attendance system.

---

## A. Google Form Setup

Create a new Google Form titled **Workshop Attendance Form**. Configure the settings to **Collect email addresses (Responder input)**. Add the exact questions below in order:

1. **Full Name** (Short answer, Required)
2. **Roll No. / USN** (Short answer, Required)
3. **Branch** (Dropdown, Required)
   - *Options: AIML, CSE, IT, E&TC, EXTC, Mechanical, Civil, Other*
4. **Batch** (Dropdown, Required)
   - *Options: A, B, C, D*
5. **College Email ID** (Short answer, Required, Use Data Validation -> Text -> Email)
6. **Session** (Dropdown, Required)
   - Day 1 - Session 1
   - Day 1 - Session 2
   - Day 2 - Session 1
   - Day 2 - Session 2
7. **Attendance Code** (Short answer, Required)

> [!TIP]
> Go to **Form Settings -> Responses** and turn on "Limit to 1 response" ONLY if you do not want to use this same form for multiple sessions. Because students will submit this form 4 times over 2 days, **do NOT limit to 1 response**. Our Apps Script will handle duplicate prevention!

---

## B. Google Sheets Structure

Open your form, go to the **Responses** tab, and click **Link to Sheets** to create your master spreadsheet. Once created, add the following sheets and set up their headers EXACTLY as shown.

### 1. SETTINGS
This is your control panel for the workshop.

| Cell | Value | Cell | Value |
| :--- | :--- | :--- | :--- |
| **A1** | **Setting** | **B1** | **Value** |
| **A2** | Workshop Name | **B2** | RAIT ACM / SIGAI AI Workshop |
| **A3** | Workshop Date | **B3** | 15-16 October 2024 |
| **A4** | Venue | **B4** | Lab 101 |
| **A5** | Day 1 - Session 1 Code | **B5** | A1X7 |
| **A6** | Day 1 - Session 2 Code | **B6** | B4K9 |
| **A7** | Day 2 - Session 1 Code | **B7** | C8P2 |
| **A8** | Day 2 - Session 2 Code | **B8** | D6M5 |

### 2. FORM RESPONSES
This sheet is generated automatically. Ensure your columns match this structure. 
**Add the word "Status" in cell I1.**

| A | B | C | D | E | F | G | H | I |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Timestamp | Full Name | Roll No. / USN | Branch | Batch | College Email ID | Session | Attendance Code | Status |

### 3. MASTER ATTENDANCE
Create a new sheet named exactly `MASTER ATTENDANCE`.

Paste these exact values into the first row (A1 to J1):
`Sr. No.` | `Student Name` | `Roll No./USN` | `Branch` | `Batch` | `Email` | `Day 1 - Session 1` | `Day 1 - Session 2` | `Day 2 - Session 1` | `Day 2 - Session 2`

**Paste this formula exactly into cell K1:**
```excel
={"Total Sessions"; ARRAYFORMULA(IF(B2:B="","", (G2:G="PRESENT")+(H2:H="PRESENT")+(I2:I="PRESENT")+(J2:J="PRESENT")))}
```

**Paste this formula exactly into cell L1:**
```excel
={"Attendance %"; ARRAYFORMULA(IF(B2:B="","", K2:K/4))}
```
*(Select column L and format as Percentage: **Format -> Number -> Percent**)*

---

## C. Analytics & Summary Sheets

### 4. WORKSHOP SUMMARY
Create a sheet named `WORKSHOP SUMMARY`. Paste these into A1:B11:

| A (Metric) | B (Value Formulas - Paste exactly) |
| :--- | :--- |
| Total Registered Students | `=COUNTA('MASTER ATTENDANCE'!B2:B)` |
| Day 1 Session 1 Present | `=COUNTIF('MASTER ATTENDANCE'!G:G, "PRESENT")` |
| Day 1 Session 2 Present | `=COUNTIF('MASTER ATTENDANCE'!H:H, "PRESENT")` |
| Day 2 Session 1 Present | `=COUNTIF('MASTER ATTENDANCE'!I:I, "PRESENT")` |
| Day 2 Session 2 Present | `=COUNTIF('MASTER ATTENDANCE'!J:J, "PRESENT")` |
| Students Present All 4 Sessions | `=COUNTIF('MASTER ATTENDANCE'!K:K, 4)` |
| Students Present 3 Sessions | `=COUNTIF('MASTER ATTENDANCE'!K:K, 3)` |
| Students Present 2 Sessions | `=COUNTIF('MASTER ATTENDANCE'!K:K, 2)` |
| Students Present 1 Session | `=COUNTIF('MASTER ATTENDANCE'!K:K, 1)` |
| Average Attendance | `=IFERROR(AVERAGE('MASTER ATTENDANCE'!L:L), 0)` *(Format as %)* |

### 5. STUDENT SUMMARY
Create a sheet named `STUDENT SUMMARY`. 
Paste this formula in **A1**:
```excel
=QUERY('MASTER ATTENDANCE'!B:L, "SELECT B, C, D, E, G, H, I, J, K, L WHERE B IS NOT NULL", 1)
```

### 6. ABSENT / PARTIAL ATTENDANCE
Create a sheet named `ABSENT / PARTIAL ATTENDANCE`.

Paste these headers into A1:G1:
`Student Name` | `Roll No./USN` | `Branch` | `Batch` | `Sessions Attended` | `Missed Sessions` | `Attendance %`

Paste in **A2**:
```excel
=IFERROR(FILTER({'MASTER ATTENDANCE'!B2:E, 'MASTER ATTENDANCE'!K2:K}, 'MASTER ATTENDANCE'!K2:K < 4, 'MASTER ATTENDANCE'!B2:B <> ""), {"No Absentees", "", "", "", ""})
```
Paste in **F2**:
```excel
=ARRAYFORMULA(IF(A2:A="","", REGEXREPLACE(TRIM( IF(VLOOKUP(B2:B, 'MASTER ATTENDANCE'!C:J, 5, 0)="ABSENT", "Day 1 - Session 1, ", "") & IF(VLOOKUP(B2:B, 'MASTER ATTENDANCE'!C:J, 6, 0)="ABSENT", "Day 1 - Session 2, ", "") & IF(VLOOKUP(B2:B, 'MASTER ATTENDANCE'!C:J, 7, 0)="ABSENT", "Day 2 - Session 1, ", "") & IF(VLOOKUP(B2:B, 'MASTER ATTENDANCE'!C:J, 8, 0)="ABSENT", "Day 2 - Session 2, ", "")), ",$", "")))
```
Paste in **G2**:
```excel
=ARRAYFORMULA(IF(A2:A="","", E2:E/4))
```

### 7. FULL ATTENDANCE — 4/4
Create a sheet named `FULL ATTENDANCE — 4/4`.
Paste in **A1**:
```excel
=IFERROR(QUERY('MASTER ATTENDANCE'!A:K, "SELECT A, B, C, D, E, K WHERE K = 4 AND B IS NOT NULL LABEL A 'Sr. No.', B 'Student Name', C 'Roll No./USN', D 'Branch', E 'Batch', K 'Attendance'", 1), {"No students with full attendance", "", "", "", "", ""})
```

---

## D. Print-Ready Attendance Sheet

Create a sheet named `PRINT ATTENDANCE`. 
This sheet is explicitly designed for A4 physical printouts.

1. **A1:** `RAIT ACM / SIGAI` (Make this Bold, Font Size 18, Merge A1:J1, Center Align)
2. **A2:** `WORKSHOP ATTENDANCE SHEET` (Bold, Font Size 14, Merge A2:J2, Center Align)
3. **A4:** `Workshop/Event:` | **B4:** `='SETTINGS'!B2` (Merge B4:D4)
4. **A5:** `Date:` | **B5:** `='SETTINGS'!B3` (Merge B5:D5)
5. **A6:** `Venue:` | **B6:** `='SETTINGS'!B4` (Merge B6:D6)
6. **A7:** `Coordinator:` | **B7:** `__________________________` (Merge B7:D7)
7. **A9:** Paste this formula:
```excel
=QUERY('MASTER ATTENDANCE'!A:J, "SELECT A, B, C, D, E, G, H, I, J WHERE B IS NOT NULL", 1)
```
8. **J9:** Type `Signature` (This will serve as the header for the blank signature column).

### Formatting & Print Settings
- Select range `A9:J` down to your last row, and add **All Borders**.
- Select columns `G, H, I, J` and center align the text.
- Adjust column widths so they fit nicely. Make the `Signature` column wide.
- When printing: **File -> Print -> Scale: Fit to width -> Margins: Narrow -> Headers & Footers -> Repeat frozen rows**. (Make sure to freeze rows 1 through 9: *View -> Freeze -> Up to row 9*).

---

## E. Google Apps Script (The Brain)

This script automates processing, duplicate detection, and code validation.

1. Go to **Extensions > Apps Script**.
2. Delete any existing code and paste the code below.
3. Save the project (Ctrl+S / Cmd+S).
4. Select `setupSystem` from the function dropdown at the top and click **Run**.
5. Google will ask for Authorization. Click **Review Permissions -> Choose your account -> Advanced -> Go to script (unsafe) -> Allow**.

```javascript
/**
 * WORKSHOP ATTENDANCE SYSTEM AUTOMATION
 * Run the 'setupSystem' function ONCE to initialize the trigger.
 */

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Clear any existing triggers to avoid duplicate processing
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Create a new onFormSubmit trigger
  ScriptApp.newTrigger("processFormSubmission")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
    
  SpreadsheetApp.getUi().alert("System setup complete! The automated trigger is now active.");
}

function processFormSubmission(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "FORM RESPONSES") return; // Only trigger on form responses
  
  const row = e.range.getRow();
  const values = e.values; 
  
  // Extract values (Array is 0-indexed)
  const name = values[1] ? values[1].trim() : "";
  const rollNo = values[2] ? values[2].trim().toUpperCase() : "";
  const branch = values[3] ? values[3].trim() : "";
  const batch = values[4] ? values[4].trim() : "";
  const email = values[5] ? values[5].trim().toLowerCase() : "";
  const session = values[6] ? values[6].trim() : "";
  const codeSubmitted = values[7] ? values[7].trim() : "";
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("SETTINGS");
  const masterSheet = ss.getSheetByName("MASTER ATTENDANCE");
  
  if (!settingsSheet || !masterSheet) return;
  
  // Retrieve current codes from SETTINGS
  const settingsData = settingsSheet.getRange("A2:B8").getValues();
  let correctCode = "";
  let sessionIndex = -1; // Column index in Master Sheet (0-indexed: Col G = 6)
  
  if (session === "Day 1 - Session 1") { correctCode = settingsData[3][1]; sessionIndex = 6; }
  else if (session === "Day 1 - Session 2") { correctCode = settingsData[4][1]; sessionIndex = 7; }
  else if (session === "Day 2 - Session 1") { correctCode = settingsData[5][1]; sessionIndex = 8; }
  else if (session === "Day 2 - Session 2") { correctCode = settingsData[6][1]; sessionIndex = 9; }
  
  let status = "INVALID / INCOMPLETE";
  
  // Validate code (Case insensitive)
  if (sessionIndex !== -1) {
    if (codeSubmitted.toLowerCase() === String(correctCode).toLowerCase().trim()) {
        status = "VALID";
    } else {
        status = "INVALID CODE";
    }
  }
  
  if (status === "VALID") {
      const lastRow = masterSheet.getLastRow();
      let masterData = [];
      if (lastRow > 1) {
          masterData = masterSheet.getRange(2, 1, lastRow - 1, 10).getValues(); 
      }
      
      let studentRowIndex = -1;
      
      // Prevent duplicates by checking Roll No.
      for (let i = 0; i < masterData.length; i++) {
          if (masterData[i][2] && masterData[i][2].toString().toUpperCase() === rollNo) {
              studentRowIndex = i;
              break;
          }
      }
      
      if (studentRowIndex > -1) {
          // Student Exists: Update their specific session
          let currentStatus = masterData[studentRowIndex][sessionIndex];
          if (currentStatus === "PRESENT") {
              status = "DUPLICATE";
          } else {
              status = "PRESENT";
              masterSheet.getRange(studentRowIndex + 2, sessionIndex + 1).setValue("PRESENT");
          }
      } else {
          // New Student: Create master record
          status = "PRESENT";
          let newRow = [
              "=ROW()-1", name, rollNo, branch, batch, email,
              sessionIndex === 6 ? "PRESENT" : "ABSENT",
              sessionIndex === 7 ? "PRESENT" : "ABSENT",
              sessionIndex === 8 ? "PRESENT" : "ABSENT",
              sessionIndex === 9 ? "PRESENT" : "ABSENT"
          ];
          masterSheet.appendRow(newRow);
      }
  }
  
  // Write the final validation status back to FORM RESPONSES (Column I, Index 8)
  sheet.getRange(row, 9).setValue(status);
}
```

---

## F. Pre-filled QR Code Setup

To prevent students from picking the wrong session, we create 4 unique QR codes that automatically select the correct session on the form.

1. Open your Google Form in Edit Mode.
2. In the top right (three dots `⋮`), click **"Get pre-filled link"**.
3. In the new window, go down to the **Session** dropdown and select **"Day 1 - Session 1"**.
4. Leave all other fields empty.
5. Click the **Get Link** button at the bottom, then click **Copy Link**.
6. Go to any free QR Code generator (e.g., [qr-code-generator.com](https://www.qr-code-generator.com/)). Paste the URL and generate the QR code. Save it as `QR_Day1_Session1.png`.
7. Repeat Steps 2-6 for the remaining three sessions.

---

## G. Conditional Formatting (Visuals)

Make the tracker easy to read:

1. **In `MASTER ATTENDANCE` (Columns G to J):**
   - Select columns G through J.
   - Click `Format` -> `Conditional formatting`.
   - **Rule 1:** Format cells if "Text is exactly" `PRESENT` -> Set background to Green.
   - **Rule 2:** Format cells if "Text is exactly" `ABSENT` -> Set background to Red.

2. **In `FORM RESPONSES` (Column I):**
   - Select Column I.
   - **Rule 1:** Text is exactly `PRESENT` -> Green.
   - **Rule 2:** Text is exactly `DUPLICATE` -> Yellow.
   - **Rule 3:** Text contains `INVALID CODE` -> Red.

---

## H. Testing Checklist

Before the live workshop, submit test data to verify:
- [ ] Submit `Day 1 - Session 1` with correct code. Check if they appear in Master sheet.
- [ ] Submit `Day 1 - Session 1` again for the same student. Ensure Form Responses flags it as `DUPLICATE` and Master remains unaffected.
- [ ] Submit `Day 1 - Session 1` with an incorrect code. Ensure Form Responses flags it as `INVALID CODE` and they are not added to Master.
- [ ] Submit `Day 1 - Session 2` with correct code for the same student. Ensure their Master record updates from ABSENT to PRESENT.
- [ ] Verify `WORKSHOP SUMMARY` numbers are calculating percentages properly.

---

## I. Preventing Proxy Attendance (Link Sharing)

Since Google Form links can be shared on WhatsApp to students outside the campus, use these three strategies to secure your attendance:

1. **The 3-Minute Window (Highly Recommended):**
   Do not leave the form open for the entire session. In your Google Form's **Responses** tab, use the **Accepting responses** toggle. Only open it for 3-5 minutes while the QR code is projected on the screen, then immediately turn it off. This drastically limits the time available for a link to be shared and used.
2. **Dynamic Attendance Codes:**
   Because our Apps Script validates the code *live* against the `SETTINGS` sheet for every submission, you can change the code mid-session! 
   - Start the session with code `A1X7` on the board.
   - 10 minutes later, change `A1X7` to `P9K2` in your `SETTINGS` sheet and update the board. 
   - Anyone using the old code from a WhatsApp forward will automatically be marked `INVALID CODE`.
3. **Restrict to College Domain:**
   In your Google Form Settings, go to **Responses** and turn on **"Restrict to users in [Your College Name]"**. This forces users to sign in with their college email, adding friction for anyone trying to proxy multiple students.

---

## J. Final Workflow for Coordinator

**Before Workshop starts:**
1. Update `SETTINGS` sheet with today's date, name, and venue.
2. Think of 4 secret codes and put them in `SETTINGS`.
3. Print the 4 QR Codes you generated.

**During Session:**
1. Display the correct QR code on the projector (e.g., `Day 1 - Session 1`).
2. Write the active attendance code (e.g., `A1X7`) on the whiteboard.
3. Students scan, form is pre-filled, they enter the code.
4. Apps script auto-validates and populates `MASTER ATTENDANCE`.

**After Workshop ends:**
1. Review the `WORKSHOP DASHBOARD` and `ABSENT / PARTIAL ATTENDANCE` sheet.
2. Open `PRINT ATTENDANCE`.
3. Press `Ctrl + P`, select Fit to Width, hit Print.
4. Have the professor/coordinator sign off on the physical copy!
