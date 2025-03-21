import dotenv from 'dotenv';
dotenv.config();

export const config = (() => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    if (!process.env.WEBHOOK_DOMAIN) throw new Error('"WEBHOOK_DOMAIN" env var is required!');

    return {
        telegramToken: process.env.TELEGRAM_BOT_TOKEN || null,
        apiBaseUrl: process.env.API_BASE_URL || '',
        webhookDomain: process.env.WEBHOOK_DOMAIN || null,
        pusher: {
            key: process.env.PUSHER_KEY || null,
            cluster: process.env.PUSHER_CLUSTER || 'ap1',
        },
    }
})();

// Ensure required environment variables are set
