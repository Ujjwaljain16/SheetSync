require('dotenv').config();

const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        console.warn('API_KEY not set in environment variables. Skipping auth.');
        return next();
    }

    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    next();
};

module.exports = authenticate;
