const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const authenticate = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[INFO] ${req.method} ${req.url}`);
    next();
});

// Apply Auth Middleware to all /sheetsync routes
app.use('/sheetsync', authenticate, routes);

// Health check
app.get('/', (req, res) => {
    res.send('SheetSync API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[ERROR] Unhandled Express Error:', err.stack);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = app;
