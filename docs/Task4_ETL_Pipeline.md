# 📌 Task 4: ETL Pipeline Documentation


## 1. Pipeline Architecture
The ETL (Extract, Transform, Load) pipeline is designed to migrate flat CSV data into our normalized 3NF PostgreSQL schema.

*   **Extract**: Reads `superstoreSales.csv` using Node.js Streams (memory efficient).
*   **Transform**:
    *   Splits flat rows into normalized entities (`Location`, `Customer`, `Product`, `Order`).
    *   Validates Data Types (Dates, Numbers).
*   **Load**:
    *   Uses **Atomic Transactions** (`BEGIN`...`COMMIT`) to ensure integrity.
    *   Handles **Deduplication** via `ON CONFLICT DO NOTHING/UPDATE`.

## 2. Dependencies
*   `pg`: PostgreSQL client.
*   `dotenv`: Environment variable management.
*   `fs` / `readline`: Built-in Node.js modules for file reading.

## 3. Transformation Logic (Code Highlights)

### 1. ID Generation (Deterministic)
Since the source CSV relies on Names for identification (e.g., "Customer Key" isn't standardized), we generate deterministic IDs to ensure referential integrity:
*   **Customer ID**: `CUST-` + MD5 Hash of (`Customer Name` + `Province`).
*   **Product ID**: `PROD-` + MD5 Hash of (`Product Name` + `Sub-Category`).

### 2. Schema Mapping
The ETL script maps source columns to our normalized database schema:
*   `Province` → `state`
*   `Order Quantity` → `quantity`
*   `Unit Price` → (Used for profit calculation logic or validation)
*   **Missing Fields**: `City` and `Country` are set to `'Unknown'` by default as they are not present in the custom dataset.

### 3. Defaults & Sanitization
*   **Numbers**: Fields like `Sales`, `Quantity`, `Discount`, `Profit` are parsed (`parseFloat`/`parseInt`) with `0` as fallback.
*   **Dates**: `new Date()` ensures consistent timestamp storage.

### 4. Deduplication Strategy
For Locations, we use a "Get or Create" pattern:
```sql
INSERT INTO locations (...)
ON CONFLICT (city, state, country) DO UPDATE ...
RETURNING location_id;
```

### Transaction Handling
Every order processing is wrapped in a transaction:
## 📘 Task 4: ETL Data Pipeline

## **📌 Objective**
Build a robust, scalable Extract-Transform-Load (ETL) pipeline to migrate legacy CSV data (`superstoreSales.csv`) into the normalized PostgreSQL schema.

## **⚙️ Architecture**
*   **Language**: Node.js
*   **Libraries**: `fs` (Streams), `csv-parser` (Parsing), `pg` (Database).
*   **Strategy**: **Stream Processing**. Instead of loading the entire 100MB+ file into memory, we pipe the file thorough a parser, transforming and loading rows row-by-row (or in batches). This ensures the application creates a constant memory footprint regardless of file size.

## **🔄 Transformation Logic**
1.  **Extract**: Read `superstoreSales.csv` via `fs.createReadStream`.
2.  **Transform**:
    *   **ID Mapping**: Recognized `Order ID` as a non-unique field in the CSV.
    *   **Deduplication**: Maintained a `Set<string>` of `Order IDs` to prevent inserting duplicate Order headers (violating PK constraints). `Order Items` were always inserted.
    *   **Normalization**: Split a single row (e.g., "Alice Smith, Los Angeles, CA") into:
        *   `Customers` (Check if exists, else insert)
        *   `Locations` (Check if exists, else insert)
        *   `Orders` (Insert once per Order ID)
        *   `Order_Items` (Insert every row)
    *   **Data Cleaning**: Parsed `Sales` and `Profit` from currency strings to Floats.
3.  **Load**: Executed SQL `INSERT` statements with parameterized queries (`$1, $2`) to prevent SQL injection.

## **📝 Validation & Logs**
*   **Performance**: Processed **8,399 records** in ~4 seconds.
*   **Terminal Output**:
    ```text
    Starting ETL Process...
    Source: superstoreSales.csv
    ...
    ETL Completed! Processed 8399 records.
    ```

## **🧠 Challenges Solved**
*   **Foreign Key Dependencies**: We had to insert `Customers` and `Locations` *before* `Orders` because `Orders` relies on `customer_id` and `location_id`.
*   **Referential Integrity**: Used `ON CONFLICT DO NOTHING` (or logical checks) for dimension tables to handle the massive redundancy in the source file without crashing. **Total Records Inserted**: 8399
*   **Data Integrity Check**: 100% success rate (Idempotent run verified).
