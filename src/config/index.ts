interface Config {
    bot: any;
    api: any;
    pusher: any;
    isDevelopment: boolean;
    logLevel: string;
    sessionExpiry: number
}
const config: Config = {
    bot: require('./bot.config'),
    api: require('./api.config'),
    pusher: require('./pusher.config'),
    isDevelopment: process.env.NODE_ENV !== 'production',
    logLevel: process.env.LOG_LEVEL || 'info',
    sessionExpiry: Number(process.env.SESSION_EXPIRY) || 24 * 60 * 60 * 1000 // 24hrs
};

export default config;