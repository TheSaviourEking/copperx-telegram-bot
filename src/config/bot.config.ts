import { BotConfig } from "../../global";

const botConfig: BotConfig = {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookDomain: process.env.WEBHOOK_DOMAIN,
    useWebhook: process.env.USE_WEBHOOK === 'true',
    secretPath: process.env.SECRET_PATH || '/telegraf-secret-path',
    port: parseInt(process.env.PORT || '3000'),
    apiUrl: process.env.TELEGRAM_API_URL || 'https://api.telegram.org',
    adminUserIds: process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',').map(id => parseInt(id)) : [],
    commands: {
        start: 'Start using the crypto wallet bot',
        login: 'Login to your wallet',
        balance: 'View your wallet balances',
        send: 'Send crypto to another user',
        withdraw: 'Withdraw crypto to an external wallet',
        help: 'Show available commands'
    }
};

export default botConfig;