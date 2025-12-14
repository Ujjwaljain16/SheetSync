const axios = require('axios');

const sendNotification = async (message, type = 'info') => {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('[WARN] No WEBHOOK_URL configured. Skipping notification.');
        return;
    }

    const color = type === 'error' ? 16711680 : 65280; // Red or Green

    const payload = {
        embeds: [{
            title: 'SheetSync Alert',
            description: message,
            color: color,
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(webhookUrl, payload);
        console.log('[SUCCESS] Notification sent.');
    } catch (error) {
        console.error('[ERROR] Failed to send notification:', error.message);
    }
};

module.exports = { sendNotification };
