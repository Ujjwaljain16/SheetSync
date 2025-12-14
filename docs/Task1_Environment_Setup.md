# 📌 Task 1: Environment Setup & Tools

## 1. Database Setup (PostgreSQL/Docker)
Instead of a managed NeonDB (free tier limits), we established a robust local **PostgreSQL** instance using **Docker**. This ensures complete control, zero latency development, and identical environment reproduction.

*   **Technology**: Docker Container (postgres:15-alpine)

## **📌 Objective**
Set up a robust, production-ready development environment for the **SheetSync** ETL and Automation platform.

## **🛠️ Tech Stack & Tools**
*   **Runtime**: Node.js (v18+)
*   **Database**: PostgreSQL 16 (via NeonDB / Docker)
*   **Version Control**: Git + GitHub
*   **API Testing**: Postman / cURL
*   **IDE**: VS Code (with ESLint, Prettier)

## **⚙️ Setup Checklist**
- [x] **PostgreSQL/NeonDB Cluster**: Created and accessible.
- [x] **Node.js Environment**: Initialized (`npm init -y`) with dependencies (`pg`, `dotenv`, `express`).
- [x] **Git Repository**: Initialized and linked to GitHub remote.
- [x] **Google Cloud Project**: Enabled Google Sheets API & Apps Script API (for Task 6).
- [x] **Connection Verification**: Confirmed connectivity using `node scripts/init-db.js`.

## **🚀 Verification & Proof**

### 1. Database Connection
*   **Method**: Custom Node.js script `scripts/init-db.js` using `pg.Pool`.
*   **Output**:
    ```text
    [dotenv] injecting env (3) from .env
    Initializing Database...
    Database initialized successfully.
    ```

### 2. Server Startup
*   **Command**: `npm start`
*   **Output**:
    ```text
    > sheetsync@1.0.0 start
    > node src/index.js

    Database Connected! Time: 2025-12-14 19:xx:xx
    Server is running on port 3000
    ```

## **🧠 Key Decisions**
*   **Why PostgreSQL?**: Chosen availability of robust JSONB support (used later for `metadata` in generic syncs) and strict schema enforcement for the core 3NF model.
*   **Why NeonDB?**: Serverless architecture allows for scaling to zero during development, saving costs while providing full Postgres compatibility.
