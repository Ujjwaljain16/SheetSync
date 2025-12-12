# 🚀 SheetSync: High-Performance Google Sheets to PostgreSQL Pipeline

**SheetSync** is a production-grade ETL (Extract, Transform, Load) pipeline that synchronizes data from Google Sheets to a PostgreSQL database in real-time. It is designed for **scalability**, **reliability**, and **automation**, capable of handling thousands of rows per second with robust error handling and data validation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## 🏗️ Architecture

The system follows a **Push-based Event-Driven Architecture**:

```mermaid
graph LR
    A[Google Sheet] -->|Trigger/Manual| B(Google Apps Script)
    B -->|Clean & Validate| B
    B -->|Batch POST (JSON)| C[Node.js API]
    C -->|Auth Middleware| D{Valid API Key?}
    D -- No --> E[401 Unauthorized]
    D -- Yes --> F[Bulk Upsert Controller]
    F -->|UNNEST + ON CONFLICT| G[(PostgreSQL DB)]
    F -->|Webhook Alert| H[Discord/Slack]
    G -->|Ack| F
    F -->|200 OK| B
    B -->|Log Result| A
```

## ✨ Key Features

*   **⚡ High Performance**: Uses PostgreSQL `UNNEST` for bulk operations, processing **26,000+ rows/second**.
*   **🔄 Incremental Sync**: intelligently tracks `LAST_SYNC_TIME` to only upload changed rows, saving 99% bandwidth.
*   **🛡️ Data Integrity**:
    *   **Strict Typing**: Enforces schema constraints (Email, Status, Dates).
    *   **Deduplication**: Handles duplicate entries within the same batch automatically.
    *   **Atomic Transactions**: Uses `BEGIN`...`COMMIT` to ensure all-or-nothing reliability.
*   **🧩 Unstructured Data Support**: Automatically captures extra columns from Sheets into a `metadata` JSONB column (No schema migration needed!).
*   **🔔 Real-Time Observability**: Sends instant alerts to Discord/Slack on sync success or failure.
*   **🔒 Security**: Protected by API Key Authentication (`x-api-key`).
*   **🐳 Dockerized**: Ready for containerized deployment with `docker-compose`.

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL 15 (with JSONB support)
*   **Frontend/Source**: Google Apps Script (GAS)
*   **DevOps**: Docker, Docker Compose, Render.com (Cloud)
*   **Tools**: CLASP (Command Line Apps Script Projects)

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   PostgreSQL
*   Docker (Optional)
*   Google Account

### 1. Clone & Install
```bash
git clone https://github.com/Ujjwaljain16/SheetSync.git
cd SheetSync
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```
```env
DATABASE_URL=postgres://user:pass@localhost:5432/sheetsync
API_KEY=your_secret_key
WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 3. Database Setup
```bash
# Create DB
createdb sheetsync

# Run Schema
psql -d sheetsync -f database/schema.sql
```

### 4. Run Locally
```bash
# Development Mode
npm start

# OR via Docker (Recommended)
docker compose up --build
```

## ☁️ Deployment

### Backend (Render/Heroku/Railway)
This repo includes a `render.yaml` for 1-click deployment on [Render.com](https://render.com).
1.  Connect your GitHub repo to Render.
2.  It will auto-detect the config and deploy Node + Postgres.

### Google Sheets (CLASP)
Instead of copy-pasting code, use CLASP to push changes:
```bash
npm install -g @google/clasp
clasp login
clasp create --type sheets --title "SheetSync" --rootDir ./gas
clasp push
```

## 🧪 Testing & Verification

Run the scalability test script to verify performance:
```bash
node scripts/test-scalability.js
```
*Expected Output*: `Speed: ~15,000+ rows/sec`

## 📝 API Reference

### `POST /sheetsync/batch`
Syncs a batch of rows to the database.

**Headers**:
*   `x-api-key`: `<your-api-key>`
*   `Content-Type`: `application/json`

**Body**:
```json
{
  "source": "Sheet1",
  "sync_id": "unique-id-123",
  "rows": [
    {
      "Full Name": "John Doe",
      "Email": "john@example.com",
      "Status": "ACTIVE",
      "Custom Field": "Captured in JSONB"
    }
  ]
}
```

## 📄 License
MIT
