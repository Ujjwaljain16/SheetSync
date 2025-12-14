# 📌 Task 1: Environment Setup & Tools

**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. Database Setup (PostgreSQL/Docker)
Instead of a managed NeonDB (free tier limits), we established a robust local **PostgreSQL** instance using **Docker**. This ensures complete control, zero latency development, and identical environment reproduction.

*   **Technology**: Docker Container (postgres:15-alpine)
*   **Port**: 5432
*   **Connection URL**: `postgres://postgres:postgres@localhost:5432/sheetsync`

## 2. Development Environment
*   **Language**: Node.js v18 (Chosen for non-blocking I/O suitable for real-time webhooks)
*   **Version Control**: Git + GitHub
    *   **Repo**: [https://github.com/Ujjwaljain16/SheetSync](https://github.com/Ujjwaljain16/SheetSync)
*   **IDE**: VS Code

## 3. Google Cloud / Sheets API
*   **Integration**: Google Apps Script (Serverless)
*   **Role**: Acts as the "Extract" layer of ETL, pushing data to the backend.

## 4. Verification Evidence

### Connection Output
Ran `node scripts/verify-env.js`:
```
Connected to PostgreSQL/NeonDB
Server Time: 2025-12-14T...
```

### Docker Status
```bash
CONTAINER ID   IMAGE         STATUS          PORTS
sheetsync-db   postgres:15   Up 30 minutes   0.0.0.0:5432->5432/tcp
```
