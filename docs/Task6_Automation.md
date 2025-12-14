# 📌 Task 6: Google Apps Script Automation


## 1. Automation Overview
# 📘 Task 6: Google Apps Script Automation & API

## **📌 Objective**
Implement "last-mile" automation to bridge the gap between user-facing tools (Google Sheets) and the production database, enabling real-time data entry with validation.

## **⚙️ Architecture: Resilient Transactional Inbox**
Since Google Sheets usage is unpredictable (users can type anything), we adopted a **Resilient Inbox** strategy:

1.  **Frontend (Google Script)**:
    *   Validates data *locally* (Type checks, required fields).
    *   Sends a generic payload (`full_name`, `email`, + `metadata` JSON) to the API.
2.  **API Layer (Node.js)**:
    *   **Resilience**: Implements **Retry Logic** (exponential backoff) for database connections to handle high load.
    *   **ACID Compliance**: Wraps the entire batch in a `BEGIN...COMMIT` transaction. If *any* row fails critically (e.g., system error), the whole batch rolls back.
    *   **Safe Execution**: Uses sequential `INSERT` statements within the transaction to ensure stability and avoid serialization edge cases with complex types.
3.  **Database**:
    *   Data is safely stored in the `employees` table.
    *   Dynamic fields stored in `metadata` **JSONB** column for flexibility.

## **🧩 Logic Flow: `AutoRegistration.js`**
The script runs on a **Time-Driven Trigger** (every minute) to process batches:

1.  **Select**: Read rows where Status is Empty or "Error".
2.  **Validate**:
    *   Check `Order ID` presence.
    *   Parse `Sales` as float.
    *   *Feedback*: If invalid, mark Row **Red** and send Email.
3.  **Sync**:
    *   `UrlFetchApp.fetch(API_URL, payload)`
    *   Payload wraps rows: `{ source: 'sheets', rows: [...] }`
4.  **Feedback**:
    *   If API returns `rows_success > 0` -> Mark Row **Green** ("Synced").
    *   If API fails -> Mark Row **Error**.

## **🛡️ Error Handling Details**
*   **Empty Rows**: Automatically skipped to prevent spam.
*   **Column Shifts**: Dynamic column indexing (Configuration object) allowed us to quickly adapt when the user added an "Index" column.
*   **Silent Failures**: We upgraded the script to parse the JSON response body (`json.rows_success`), ensuring "Green" status *only* appears if the DB actually confirmed insertion.

## **🚀 Verification**
*   **Scenario**: User inputs "Alice Smith" (Valid) and "Bob" (Invalid Sales).
*   **Result**:
    *   Alice: Row turns Green -> Appears in DB.
    *   Bob: Row turns Red -> Email Notification sent.

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
