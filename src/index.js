const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Apply Auth Middleware to all /sheetsync routes
app.use('/sheetsync', authenticate, routes);


// Health check
app.get('/', (req, res) => {
    res.send('SheetSync API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
