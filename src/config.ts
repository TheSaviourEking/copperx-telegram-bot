// src/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
    apiBaseUrl: 'https://income-api.copperx.io',
    pusher: {
        key: process.env.PUSHER_KEY,
        cluster: 'ap1',
    },
};

// Ensure required environment variables are set
if (!config.telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
}