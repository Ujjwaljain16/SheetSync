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
  API_URL: "https://767e5e6a279e.ngrok-free.app/sheetsync/batch", 
  API_KEY: "secret_12345", // Ensure this matches .env
  SHEET_NAME: "Input_Orders",
  EMAIL_RECIPIENT: "jainujjwal1609@gmail.com", // Replace with actual email or Session.getActiveUser().getEmail()
  STATUS_COL_INDEX: 2 // Updated to Column B based on your new layout
};

/**
 * Main Trigger Function
 * Run this via Time-driven trigger (e.g., Every 1 Minute)
 */
function autoRegistration() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    Logger.log("Sheet not found: " + CONFIG.SHEET_NAME);
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // No data, only headers

  // Fetch all data for batch processing (Optimization)
  const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = range.getValues();
  // Status column is now Column B (Index 2)
  const statusRange = sheet.getRange(2, CONFIG.STATUS_COL_INDEX, lastRow - 1, 1);
  const statusValues = statusRange.getValues();

  const rowsToSync = [];
  const statusUpdates = [...statusValues]; // Copy for local updates
  const rowIndices = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const status = String(statusValues[i][0] || "");

    // Skip if already processed
    if (status === "Synced" || status.startsWith("Error")) { 
      continue; 
    }

    // 1. Validation Logic
    const validation = validateRow(row);
    if (!validation.isValid) {
      if (validation.message === "EMPTY_ROW") continue; // Skip empty rows

      statusUpdates[i][0] = "Error: " + validation.message;
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).setBackground("#FFCCCC"); // Red Highlight
      
      Logger.log(`Row ${i+2} Validation Failed: ${validation.message}`);
      sendNotification(i + 2, validation.message, row);
      continue;
    }

    // 2. Prepare for API
    const orderData = {
      order_id: row[2],
      order_date: formatDate(row[3]),
      full_name: row[4],
      email: row[5], // Custom field example
      sales: row[8],
      quantity: row[9],
      profit: row[10]
    };
    
    rowsToSync.push(orderData);
    rowIndices.push(i);
  }

  if (rowsToSync.length > 0) {
    // 3. Sync to API
    const payload = {
      source: 'google_sheets',
      sync_id: 'manual_' + new Date().getTime(),
      rows: rowsToSync
    };
    const success = sendBatchToApi(payload);

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

/**
 * Validates a single row of data
 */
function validateRow(row) {
  // Indices shifted by +2 (User added 2 columns at start)
  const orderId = row[2];
  const customerName = row[4];
  const sales = row[8];

  // Check for completely empty row
  if (!orderId && !customerName && sales === "") {
    return { isValid: false, message: "EMPTY_ROW" }; 
  }

  if (!orderId || String(orderId).trim() === "") return { isValid: false, message: "Missing Order ID" };
  if (!customerName || String(customerName).trim() === "") return { isValid: false, message: "Missing Customer Name" };
  
  if (sales === "" || isNaN(parseFloat(sales))) return { isValid: false, message: "Invalid Sales Amount: " + sales };

  return { isValid: true };
}

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
    const text = response.getContentText();
    
    if (code === 200 || code === 201) {
      const json = JSON.parse(text);
      if (json && json.rows_success > 0) {
        Logger.log("API Sync Success: " + json.rows_success + " inserted.");
        return true;
      } else {
        Logger.log("API Validation Error: " + JSON.stringify(json.rows_failed));
        return false;
      }
    } else {
      Logger.log("API Fail: " + text);
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
