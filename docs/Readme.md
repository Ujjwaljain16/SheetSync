# 📘 SheetSync Project Documentation
---

## 📂 Documentation Index

This project is documented in a modular fashion, with each task having its own dedicated report.

### [Phase 1: Foundation]
*   **[Task 1: Environment Setup](Task1_Environment_Setup.md)**
    *   Docker, Node.js, and Git initialization.
    *   Verification of database connectivity.

### [Phase 2: Data Engineering]
*   **[Task 2: Data Audit & Migration](Task2_Data_Audit.md)**
    *   Analysis of the `Superstore` dataset.
    *   Identification of entities, anomalies, and normalization strategy.
*   **[Task 3: Database Design](Task3_Database_Design.md)**
    *   ER Diagram (Mermaid).
    *   3NF Schema (`orders`, `customers`, `products`, `locations`).

### [Phase 3: Pipeline & Optimization]
*   **[Task 4: ETL Pipeline](Task4_ETL_Pipeline.md)**
    *   Documentation of the Node.js Stream-based ETL (`import_superstore.js`).
    *   Bulk Upsert and Deduplication logic.
*   **[Task 5: SQL Optimization](Task5_SQL_Optimization.md)**
    *   Analytical Queries (Joins, Aggregations).
    *   Reporting Views (`v_sales_summary`).
    *   Performance Benchmarks (`EXPLAIN ANALYZE`).
*   **[Task 7: Public Dataset Practice](Task7_Optimizations.md)**
    *   Handling "Messy" JSON data (`returns.json`).
    *   Materialized Views (`mv_returned_sales`) and Refresh Procedures.

### [Phase 4: Automation & Final]
*   **[Task 6: Google Apps Script Automation](Task6_Automation.md)**
    *   Real-time "Auto-Registration" workflow.
    *   Validation logic and Email Notifications.
*   **[Task 9: Final Presentation](Task9_Final_Presentation.md)**
    *   Slide Deck covering Architecture, Demo, and Benchmarks.

### [Phase 5: Quality Assurance]
*   **[Automated Testing](../tests/api.test.js)**
    *   Jest Test Suite covering API validation and logic.
*   **[CI/CD](../.github/workflows/test.yml)**
    *   GitHub Actions workflow for automated testing on push.

---

## 🛠️ Technical Artifacts

### Database Scripts (`/database`, `/sql`)
*   `schema.sql`: Core schema (Employees).
*   `superstore_schema.sql`: Normalized Superstore schema (3NF).
*   `returns_schema.sql`: Returns schema.
*   `optimizations.sql`: Indices and Materialized Views.
*   `procedures.sql`: Stored Procedures (History & Maintenance).

### ETL Scripts (`/etl`)
*   `import_superstore.js`: Main CSV Pipeline.
*   `import_returns.js`: Supplemental JSON Pipeline.

### Automation (`/gas`)
*   `AutoRegistration.js`: Google Apps Script source code.

---

