require('dotenv').config();

const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        console.warn('API_KEY not set in environment variables. Skipping auth.');
        return next();
    }

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }

    next();
};

module.exports = authenticate;
