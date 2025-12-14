# 📋 SheetSync Submission Guide / Checklist

Use this guide to collect your **Screenshots** and **Proofs** for the final submission.

## 📌 Task 1: Environment Setup
*   **Requirement**: "Screenshot of NeonDB / PostgreSQL connection"
*   **How to Get Proof**:
    1. Run: `node scripts/init-db.js`
    2. **Screenshot** the terminal output saying "✅ Database initialized successfully".
*   **Requirement**: "Test script output"
    1. Run: `npm start`
    2. **Screenshot** the terminal saying "Server is running on port 3000" and "Connected to database".

## 📌 Task 2: Data Audit
*   **Requirement**: "Screenshots of data issues"
*   **How to Get Proof**:
    1. Open `docs/Task2_Data_Audit.md`.
    2. Open your Google Sheet showing the "Red" rows (invalid data).
    3. **Screenshot** the Google Sheet with conditional formatting active.

## 📌 Task 3: Database Design
*   **Requirement**: "Detailed ER Diagram"
*   **How to Get Proof**:
    1. Open `docs/Task3_Database_Design.md`.
    2. **Screenshot** the Mermaid ER Diagram rendered in VS Code or GitHub.
*   **Requirement**: "schema.sql & seed.sql"
    1. Show the `database/` folder file list.

## 📌 Task 4: ETL Pipeline
*   **Requirement**: "Logs & validation reports"
*   **How to Get Proof**:
    1. Run: `node etl/import_superstore.js`
    2. **Screenshot** the terminal output: "✅ ETL Completed! Processed 8399 records."
    3. (Optional) Run `node scripts/run-sql.js sql/queries.sql` to show the data being queried.

## 📌 Task 5: SQL Development
*   **Requirement**: "Screenshots of query results"
*   **How to Get Proof**:
    1. Run: `node scripts/run-sql.js sql/queries.sql`
    2. **Screenshot** the terminal output showing the JSON results of your aggregations.

## 📌 Task 6: Google App Script
*   **Requirement**: "Auto-registration demo"
*   **How to Get Proof**:
    1. **Record a Video** (or take before/after screenshots):
        *   Add a row in Google Sheets: `1001` | `2025-12-14` | `Alice Smith` | `alice@example.com` ...
        *   Wait 1 minute (or run script manually).
        *   Show the row turning **Green** (Validated).
        *   Show the email notification in your Inbox.

## 📌 Task 7: Optimizations
## 📌 Task 7: Optimizations
*   **Requirement**: "ETL Run & Optimization Proofs"
*   **How to Get Proof**:
    1. **ETL Run**: Run `node etl/import_returns.js`
        *   **Screenshot** the output: "✨ Transformed to X clean records" and "✅ Load Complete".
    2. **Optimization**: Run `node scripts/run-sql.js sql/optimizations.sql`
        *   **Screenshot** the output: "Executed successfully".
    3. **Verification**: Run `node scripts/run-sql.js sql/check_mv.sql`
        *   **Screenshot** the table output showing data inside the Materialized View.

## 📌 Task 8: Documentation
*   **Requirement**: "Full documentation structure"
*   **How to Get Proof**:
    1. **Screenshot** your `docs/` folder in VS Code sidebar showing all `TaskX_....md` files.

## 📌 Task 9: Final Presentation
*   **Requirement**: "Slide deck"
*   **Proof**: The file `docs/Task9_Final_Presentation.md` **IS** your slide deck. You can export it to PDF or present it directly from markdown.

---
**💡 Pro Tip for Submission**:
Create a Notion Page or PDF and paste these screenshots under their respective headers. Use the text from `docs/TaskX_...md` files to describe what is happening in the screenshots.
