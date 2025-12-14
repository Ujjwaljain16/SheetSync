/**
 * SheetSync - Auto Registration & Automation Script
 * 
 * Objectives:
 * 1. Validate new entries in "Input_Orders"
 * 2. Auto-insert valid entries to Backend via API
 * 3. Notify user on failure via Email
 * 4. Optimize using batch processing and status tracking
 */

const CONFIG = {
  // Replace with your Render URL
  API_URL: "https://sheetsync-backend.onrender.com/api/sync", 
  API_KEY: "my-secret-key", // Ensure this matches .env
  SHEET_NAME: "Input_Orders",
  EMAIL_RECIPIENT: "ujjwaljain16@example.com", // Replace with actual email or Session.getActiveUser().getEmail()
  STATUS_COL_INDEX: 10 // Adjust based on your sheet layout (e.g., Column J)
};

/**
 * Main Trigger Function
 * Run this via Time-driven trigger (e.g., Every 1 Minute)
 */
function autoRegistration() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    if (!validation.isValid) {
      statusUpdates[i][0] = "Error: " + validation.message;
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).setBackground("#FFCCCC"); // Red Highlight
      sendNotification(i + 2, validation.message, row);
      continue;
    }
    
    // ... lines 68-98 omitted (not changing logic) ...

  if (rowsToSync.length > 0) {
    // 3. Sync to API
    const success = sendBatchToApi(rowsToSync);

    // 4. Update Status based on API result
    for (let j = 0; j < rowIndices.length; j++) {
      const index = rowIndices[j];
      if (success) {
        statusUpdates[index][0] = "Synced";
        sheet.getRange(index + 2, 1, 1, sheet.getLastColumn()).setBackground("#CCFFCC"); // Green
      } else {
        statusUpdates[index][0] = "API Error";
        // Do not turn red yet, maybe temporary network issue, retry next time
      }
    }
  }

  // 5. Batch Write Status Updates (Optimization)
  statusRange.setValues(statusUpdates);
}
    
    // ... lines 122-137 omitted ...

/**
 * Sends data to Node.js Backend
 */
function sendBatchToApi(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CONFIG.API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(CONFIG.API_URL, options);
    const code = response.getResponseCode();
    if (code === 200 || code === 201) {
      Logger.log("API Sync Success");
      return true;
    } else {
      Logger.log("API Fail: " + response.getContentText());
      return false;
    }
  } catch (e) {
    Logger.log("Network Error: " + e.toString());
    return false;
  }
}

/**
 * Sends Email Notification for Invalid Entries
 */
function sendNotification(rowNum, errorMsg, rowData) {
  const email = Session.getActiveUser().getEmail() || CONFIG.EMAIL_RECIPIENT;
  const subject = "Auto-Registration Failed: Row " + rowNum;
  const body = `
    SheetSync Alert
    -----------------------------------
    An invalid entry was detected in "Input_Orders".
    
    Row: ${rowNum}
    Error: ${errorMsg}
    
    Data Snippet: ${rowData.slice(0, 5).join(", ")}...
    
    Please check the Google Sheet to correct this entry.
  `;
  
  MailApp.sendEmail(email, subject, body);
  Logger.log("Sent Notification to " + email);
}

// Helper to handle Date objects from Sheet
function formatDate(dateItem) {
  if (Object.prototype.toString.call(dateItem) === '[object Date]') {
     return Utilities.formatDate(dateItem, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return dateItem; // Return as is if already string
}
