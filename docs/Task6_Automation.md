# 📌 Task 6: Google Apps Script Automation

**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. Automation Overview
We implemented an "Auto-Registration" workflow that bridges Google Sheets (Frontend) with our NeonDB/PostgreSQL (Backend) in real-time.

**Workflow:**
1.  **User Action**: User adds a new row to `Input_Orders` sheet.
2.  **Trigger**: Script runs automatically (Time-driven).
3.  **Process**:
    *   **Validation**: Checks for core fields (Order ID, Customer Name, numeric Sales).
    *   **Invalid**: Row turns **RED**, `Status` = "Error: [Reason]", Email Notification sent.
    *   **Valid**: Row synced to API, turns **GREEN**, `Status` = "Synced".

## 2. Key Components

### `autoRegistration()`
*   **Batch Processing**: Reads all rows in one go to minimize execution time (Optimization).
*   **Idempotency**: Skips rows already marked "Synced".

### `validateRow()`
*   Enforces Business Rules (e.g., "Sales must be a number").
*   Prevents bad data from reaching the database.

### `sendNotification()`
*   Uses `MailApp` to alert admins immediately when data entry errors occur.

## 3. Setup Instructions for User
1.  Open your Google Sheet.
2.  Go to **Extensions > Apps Script**.
3.  Create a file `AutoRegistration.gs`.
4.  Paste the code from `gas/AutoRegistration.js`.
5.  **Set Trigger**:
    *   Click on **Triggers** (Clock icon).
    *   Add Trigger -> `autoRegistration` -> Head -> Time-driven -> **Minutes timer** -> **Every minute**.

## 4. Verification
*   **Valid Entry**: Added proper order -> Row turned Green -> Appeared in DB.
*   **Invalid Entry**: Added row without Order ID -> Row turned Red -> Received Email.
