/**
 * SheetSync - Google Sheets to PostgreSQL Sync
 */

const CONFIG = {
  API_URL: 'http://localhost:3000/sheetsync/batch', // Replace with production URL
  API_KEY: 'secret_12345', // Must match backend .env
  SOURCE_SHEET_NAME: 'Sheet1',
  ERRORS_SHEET_NAME: 'SheetSync_Errors',
  LOGS_SHEET_NAME: 'SheetSync_Logs',
  BATCH_SIZE: 50
};

/**
 * Menu for manual trigger
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('SheetSync')
    .addItem('Run Sync Now', 'runSync')
    .addToUi();
}

/**
 * Main Sync Function
 */
function runSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SOURCE_SHEET_NAME);
  
  if (!sheet) {
    Logger.log('Source sheet not found');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  if (rows.length === 0) {
    Logger.log('No data to sync');
    return;
  }

  const syncId = new Date().toISOString();
  const validRows = [];
  const invalidRows = [];

  // 1. Process Rows
  rows.forEach((row, index) => {
    const rowObj = mapRowToObject(row, headers);
    const rowNum = index + 2; // 1-based + header

    // 2. Clean
    const cleaned = cleanData(rowObj);

    // 3. Validate
    const validation = validate(cleaned);
    if (validation.isValid) {
      // 4. Transform
      const transformed = transform(cleaned);
      validRows.push(transformed);
    } else {
      invalidRows.push({
        row: rowNum,
        data: JSON.stringify(cleaned),
        error: validation.error
      });
    }
  });

  // 5. Send Batches
  let totalSuccess = 0;
  let totalFailed = 0;
  let apiErrors = [];

  if (validRows.length > 0) {
    for (let i = 0; i < validRows.length; i += CONFIG.BATCH_SIZE) {
      const batch = validRows.slice(i, i + CONFIG.BATCH_SIZE);
      try {
        const result = sendBatch(batch, syncId);
        totalSuccess += result.rows_success || 0;
        if (result.rows_failed && result.rows_failed.length > 0) {
          apiErrors = apiErrors.concat(result.rows_failed);
        }
      } catch (e) {
        Logger.log('API Error for batch ' + i + ': ' + e.toString());
        // Log batch failure as generic error
        apiErrors.push({
          row_number: 'Batch ' + i,
          error: 'Network/API Error: ' + e.toString(),
          data: {}
        });
      }
    }
  }

  // 6. Handle Errors & Logs
  if (invalidRows.length > 0 || apiErrors.length > 0) {
    writeErrors(invalidRows, apiErrors);
  }

  logSync({
    syncId: syncId,
    total: rows.length,
    valid: validRows.length,
    sent: validRows.length,
    success: totalSuccess,
    failed: invalidRows.length + apiErrors.length
  });
}

/**
 * Helper: Map row array to object based on headers
 */
function mapRowToObject(row, headers) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

/**
 * 2. Clean Data
 */
function cleanData(row) {
  const cleaned = { ...row };
  
  // Trim strings
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = cleaned[key].trim();
    }
  });

  // Format Date (Simple assumption: Date object to ISO string)
  if (cleaned['Joining Date'] instanceof Date) {
    cleaned['Joining Date'] = cleaned['Joining Date'].toISOString().split('T')[0];
  }

  return cleaned;
}

/**
 * 3. Validate Data
 */
function validate(row) {
  if (!row['Email'] || row['Email'] === '') {
    return { isValid: false, error: 'Missing Email' };
  }
  if (!row['Full Name'] || row['Full Name'] === '') {
    return { isValid: false, error: 'Missing Full Name' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row['Email'])) {
    return { isValid: false, error: 'Invalid Email Format' };
  }

  if (row['Status'] && !['ACTIVE', 'INACTIVE'].includes(row['Status'])) {
    return { isValid: false, error: 'Invalid Status' };
  }

  return { isValid: true };
}

/**
 * 4. Transform Data
 */
function transform(row) {
  return {
    full_name: row['Full Name'],
    email: row['Email'],
    phone: row['Phone'],
    joined_at: row['Joining Date'],
    status: row['Status'],
    performance_score: row['Score']
  };
}

/**
 * 5. Send Batch to API
 */
function sendBatch(rows, syncId) {
  const payload = {
    source: CONFIG.SOURCE_SHEET_NAME,
    sync_id: syncId,
    rows: rows
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CONFIG.API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(CONFIG.API_URL, options);
  const json = JSON.parse(response.getContentText());
  return json;
}

/**
 * 6. Write Errors
 */
function writeErrors(localErrors, apiErrors) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.ERRORS_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.ERRORS_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Row Number', 'Error', 'Data']);
  }

  const timestamp = new Date();
  
  // Local Validation Errors
  localErrors.forEach(err => {
    sheet.appendRow([timestamp, err.row, err.error, err.data]);
  });

  // API Errors
  if (apiErrors) {
    apiErrors.forEach(err => {
      sheet.appendRow([timestamp, err.row_number, err.error, JSON.stringify(err.data)]);
    });
  }
}

/**
 * 7. Log Sync
 */
function logSync(stats) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Sync ID', 'Total Rows', 'Valid', 'Sent', 'Success', 'Failed']);
  }

  sheet.appendRow([
    new Date(),
    stats.syncId,
    stats.total,
    stats.valid,
    stats.sent,
    stats.success,
    stats.failed
  ]);
}

/**
 * 8. Schedule Sync (Run once to setup trigger)
 */
function scheduleSync() {
  // Delete existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'runSync') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("runSync")
    .timeBased()
    .everyHours(1)
    .create();
}
