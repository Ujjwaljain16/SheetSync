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
    2. **Screenshot** the output: "🚀 Processing complete. Inserted: X rows."
    3. Open `Google Sheets` -> `Extensions` -> `Apps Script` -> `Executions`.
    4. **Screenshot** the "Completed" execution logs.

## 📌 Task 5: SQL Development
*   **Requirement**: "Screenshots of query results"
*   **How to Get Proof**:
    1. Run: `node scripts/run-sql.js sql/queries.sql`
    2. **Screenshot** the terminal output showing the JSON results of your aggregations.

## 📌 Task 6: Google App Script
*   **Requirement**: "Auto-registration demo"
*   **How to Get Proof**:
    1. **Record a Video** (or take before/after screenshots):
        *   Add a row in Google Sheets: `John Doe | john@example.com`.
        *   Wait 1 minute (or run script manually).
        *   Show the row turning **Green** (Validated).
        *   Show the email notification in your Inbox.

## 📌 Task 7: Optimizations
*   **Requirement**: "Benchmark: query performance"
*   **How to Get Proof**:
    1. Run: `node scripts/run-sql.js sql/optimizations.sql`
    2. **Screenshot** the `EXPLAIN ANALYZE` output showing the query cost *before* and *after* the Materialized View.

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
