import { Telegraf, session } from 'telegraf';
import { config } from '../config';
import { message } from 'telegraf/filters'
import { CustomContext } from '../../types';
import { setupMiddlewares } from './middlewares';
import { registerCommands } from './commands';
import LocalSession from 'telegraf-session-local'
// import { registerCommands } from './commands';
// import { setupMiddlewares } from './middlewares';


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
    const bot = new Telegraf<CustomContext>(config.telegramToken!);

    // Set up session middleware
    const localSession = new LocalSession({
        // Options for file-based storage
        database: 'sessions.json', // File where sessions are stored
        format: {
            serialize: (obj) => JSON.stringify(obj, null, 2), // Pretty-print JSON
            deserialize: (str) => JSON.parse(str),
        },
        storage: LocalSession.storageFileSync, // Synchronous file storage
    });

    // Add session middleware
    bot.use(localSession.middleware());


    // Initialize session data
    bot.use((ctx, next) => {
        ctx.session ??= {};
        return next();
    });

    // Set up additional middlewares
    setupMiddlewares(bot);

    // Register bot commands
    registerCommands(bot);

    bot.start((ctx) => ctx.reply('Welcome'))
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))

    return bot;
}