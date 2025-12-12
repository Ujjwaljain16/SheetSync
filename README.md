# SheetSync

A fully automated pipeline that reads data from Google Sheets, cleans it, transforms it, validates it, and syncs it into a backend PostgreSQL database through REST APIs.

## Project Structure

- `src/`: Backend Node.js source code.
- `database/`: SQL schema scripts.
- `gas/`: Google App Script code.
- `scripts/`: Utility scripts (e.g., API testing).

## Setup

### 1. Database Setup
Ensure you have PostgreSQL installed and running.
Create a database named `sheetsync` (or whatever you prefer).
Run the schema script:
```bash
psql -d sheetsync -f database/schema.sql
```

### 2. Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   Update `DATABASE_URL` in `.env` to match your local PostgreSQL credentials.
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/sheetsync
   ```
3. Start the server:
   ```bash
   npm start
   ```

### 3. Google Sheets Setup
1. Open your Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy the content of `gas/Code.js` into the script editor.
4. Update `CONFIG.API_URL` in the script to point to your backend (use a tunneling service like ngrok if running locally: `https://<your-ngrok-url>/sheetsync/batch`).
5. Save and refresh the sheet.
6. You should see a "SheetSync" menu.

## Usage

- **Manual Sync**: Click "SheetSync > Run Sync Now" in the Google Sheet.
- **Scheduled Sync**: Run the `scheduleSync` function in the Apps Script editor once to set up the hourly trigger.

## Testing
You can test the API locally without Google Sheets using the test script:
```bash
node scripts/test-api.js
```
