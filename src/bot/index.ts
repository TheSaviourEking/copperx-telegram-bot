// src/bot/index.ts
import { Telegraf, session } from 'telegraf';
import { config } from '../config';
import { registerCommands } from './commands';
import { setupMiddlewares } from './middlewares';

// Define session type
interface BotSession {
    authToken?: string;
    organizationId?: string;
    userId?: string;
    step?: string;
    tempData?: any;
}

export function setupBot() {
    // Create bot instance
    const bot = new Telegraf<{
        session: BotSession;
        scene: any;
    }>(config.telegramToken);

    // Set up session middleware
    bot.use(session());

    // Initialize session data
    bot.use((ctx, next) => {
        ctx.session ??= {};
        return next();
    });

    // Set up additional middlewares
    setupMiddlewares(bot);

    // Register bot commands
    registerCommands(bot);

    return bot;
}