# 📌 Task 2: Data Audit & Assessment (Global Superstore)

**Target Dataset**: [Global Superstore Sales](https://github.com/curran/data) (Public Dataset)
**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. Dataset Overview
We have selected the **Global Superstore** dataset from the "Awesome Public Datasets" list. This dataset contains retail sales records and offers a rich schema for relational modeling.

### Entities Identified
1.  **Orders**: The transactional core (`Order ID`, `Order Date`, `Ship Mode`).
2.  **Customers**: The buyer (`Customer ID`, `Customer Name`, `Segment`).
3.  **Locations**: Geography (`City`, `State`, `Country`, `Region`).
4.  **Products**: Inventory (`Product ID`, `Category`, `Sub-Category`, `Product Name`).

## 2. Visual Data Audit
We inspected the raw CSV/Sheet and identified specific "messy" patterns.

![Superstore Audit](/superstore_audit_screenshot.png)
*(Figure 1: Audit of raw sales data showing duplicates and missing geographic info)*

### Identified Data Quality Issues
| Issue | Severity | Description | Handling Strategy |
| :--- | :--- | :--- | :--- |
| **Duplicate Rows** | 🔴 High | Multiple distinct rows share the same `Row ID` or identical `Order ID` + `Product ID` combinations. | **Strategy**: Composite Key (`Order ID` + `Product ID`) or backend deduplication logic. |
| **Missing Geography** | 🟡 Medium | `Postal Code` is null for non-US records (e.g., Burlington, Canada). | **Strategy**: Allow NULLs in `postal_code` column or impute with "00000". |
| **Inconsistent Dates** | 🟡 Medium | Mixed formats: `11/08/2016` (US) vs `08-Nov-2016` (Text). | **Strategy**: Standardize to ISO 8601 (`YYYY-MM-DD`) in GAS transformation layer. |
| **Unnormalized Data** | 🟢 Low | `Customer Name` and `Segment` repeated for every order. | **Strategy**: Ideal for normalization (Star Schema), but for SheetSync v1, we will flatten or use JSONB for flexible attributes. |

## 3. Entity-Attribute-Relationship (EAR) Table
Ideally, this flat sheet should be normalized into a Relational Schema for the DB.

| Entity | Attribute | PK/FK | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Sales_Fact** | `row_id` | **PK** | INT | Unique Record ID. |
| | `order_id` | FK | VARCHAR | Links to Order info. |
| | `customer_id` | FK | VARCHAR | Links to Customer. |
| | `sales` | - | DECIMAL | Revenue amount. |
| | `profit` | - | DECIMAL | Profit amount. |
| **Customer_Dim** | `customer_id` | **PK** | VARCHAR | Unique Customer ID. |
| | `customer_name` | - | VARCHAR | Name. |
| **Product_Dim** | `product_id` | **PK** | VARCHAR | Unique Item ID. |
| | `category` | - | VARCHAR | e.g., Furniture. |

## 4. Column Mapping (Source → Target Schema)
For the initial "SheetSync" pipeline, we will map the flat sheet to a `sales_records` table, leveraging JSONB for the dimensionality to allow rapid querying without complex joins initially.

| Source Column | Target Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| `Row ID` | `id` | SERIAL (PK) | Auto-increment. |
| `Order ID` | `order_id` | VARCHAR | Indexed for lookups. |
| `Order Date` | `order_date` | DATE | Converted from string. |
| `Customer ID` | `customer_id` | VARCHAR | - |
| `Sales` | `sales_amount` | DECIMAL | - |
| `Product Name` | `product_details` | **JSONB** | Contains Name, Category, Sub-Category. |
| `Region/State` | `location` | **JSONB** | Contains City, State, Country. |

## 5. Next Steps
1.  **Refine Schema**: Create the SQL for `sales_records` (Task 3).
2.  **ETL Logic**: Update `processBatch` to handle the composite uniqueness of Superstore data.
