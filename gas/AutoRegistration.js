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
    Logger.log("❌ Sheet not found: " + CONFIG.SHEET_NAME);
    return;
  }

  const lastRow = sheet.getLastRow();
  // Assuming Header is Row 1, Data starts Row 2
  if (lastRow < 2) return; 

  // Read all data to minimize calls (Optimization)
  // Get range: Row 2 to LastRow, Columns 1 to LastColumn
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = dataRange.getValues();
  const statusRange = sheet.getRange(2, CONFIG.STATUS_COL_INDEX, lastRow - 1, 1);
  const statusValues = statusRange.getValues();

  // Array to hold updates for batch writing at the end (Optimization)
  const statusUpdates = [...statusValues];
  
  // Rows to sync
  const rowsToSync = [];
  const rowIndices = []; // To track original row numbers

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const currentStatus = statusValues[i][0];

    // Only process rows that are NOT 'Synced' and NOT 'Error' (or explicitly 'Pending')
    // Treating empty status as 'New'
    if (currentStatus === "Synced") continue;

    console.log(`Processing Row ${i + 2}...`);

    // 1. Validation
    const validation = validateRow(row);
    if (!validation.isValid) {
      statusUpdates[i][0] = "Error: " + validation.message;
      sheet.getRange(i + 2, 1, 1, sheet.getLastColumn()).setBackground("#FFCCCC"); // Red Highlight
      sendNotification(i + 2, validation.message, row);
      continue;
    }

    // 2. Prepare for Sync
    // Map array to object expected by API (Superstore Schema)
    const payload = {
       "Row ID": row[0],
       "Order ID": row[1],
       "Order Date": formatDate(row[2]),
       "Ship Date": formatDate(row[3]),
       "Ship Mode": row[4],
       "Customer ID": row[5],
       "Customer Name": row[6],
       "Segment": row[7],
       "Country": row[8],
       "City": row[9],
       "State": row[10],
       "Postal Code": row[11],
       "Region": row[12],
       "Product ID": row[13],
       "Category": row[14],
       "Sub-Category": row[15],
       "Product Name": row[16],
       "Sales": row[17],
       "Quantity": row[18],
       "Discount": row[19],
       "Profit": row[20]
    };
    
    rowsToSync.push(payload);
    rowIndices.push(i);
  }

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

/**
 * Validates a single row of data
 */
function validateRow(row) {
  // Example Rules:
  // Col 1: Order ID (Mandatory)
  // Col 6: Customer Name (Mandatory)
  // Col 17: Sales (Must be Number > 0)

  if (!row[1]) return { isValid: false, message: "Missing Order ID" };
  if (!row[6]) return { isValid: false, message: "Missing Customer Name" };
  
  if (row[17] === "" || isNaN(row[17])) {
      return { isValid: false, message: "Invalid Sales Amount" };
  }

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
    if (code === 200 || code === 201) {
      Logger.log("✅ API Sync Success");
      return true;
    } else {
      Logger.log("❌ API Fail: " + response.getContentText());
      return false;
    }
  } catch (e) {
    Logger.log("❌ Network Error: " + e.toString());
    return false;
  }
}

/**
 * Sends Email Notification for Invalid Entries
 */
function sendNotification(rowNum, errorMsg, rowData) {
  const email = Session.getActiveUser().getEmail() || CONFIG.EMAIL_RECIPIENT;
  const subject = "⚠️ Auto-Registration Failed: Row " + rowNum;
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
  Logger.log("📧 Sent Notification to " + email);
}

// Helper to handle Date objects from Sheet
function formatDate(dateItem) {
  if (Object.prototype.toString.call(dateItem) === '[object Date]') {
     return Utilities.formatDate(dateItem, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return dateItem; // Return as is if already string
}
