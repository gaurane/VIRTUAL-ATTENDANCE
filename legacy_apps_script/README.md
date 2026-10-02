# Online Workshop Attendance System (V4)

This folder contains the source code for your fully automated Google Apps Script Web App. 

## Included Files
- `Code.gs`: The backend script that connects to your Google Sheet database.
- `Index.html`: The modern frontend UI that students will interact with.

## How to Deploy to Google Workspace

### Step 1: Set up the Google Sheet Database
1. Create a new Google Sheet.
2. Link a Google Form to it (for student pre-registration). Rename the response sheet to `REGISTRATIONS`.
3. Create three more sheets: `SETTINGS`, `ATTENDANCE LOG`, and `MASTER ATTENDANCE`.
4. **IMPORTANT NEW STEP:** In the `SETTINGS` tab, type "Admin Password" in cell `A10`, and type your chosen secret password in cell `B10` (e.g. `admin123`).

### Step 2: Push the Code
1. In your Google Sheet, click **Extensions > Apps Script**.
2. Delete the default code in `Code.gs` and paste the contents of the local `Code.gs` file.
3. Click the `+` icon next to Files, select **HTML**, name it exactly `Index`.
4. Paste the contents of the local `Index.html` file.
5. Click the `+` icon again, select **HTML**, name it exactly `Admin`.
6. Paste the contents of the local `Admin.html` file.
7. Save the project.

### Step 3: Go Live
1. Click the blue **Deploy** button in the top right -> **New Deployment**.
2. Set type to **Web app**. 
3. **Execute as:** `Me`
4. **Who has access:** `Anyone`
5. Click **Deploy**, accept permissions, and you will receive your live Web App URL!

### Step 4: How to Access the Admin Dashboard
- **Student View:** Share the standard URL provided by Google (e.g. `https://script.google.com/macros/.../exec`).
- **Admin View:** Add `?page=admin` to the very end of that same URL (e.g. `https://script.google.com/macros/.../exec?page=admin`) to access your secure dashboard.
