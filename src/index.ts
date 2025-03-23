// import { Bot, bot } from './core/bot';
import commandRegistry from './commands';
import { errorHandler } from './handlers/error.handler';
// import { sessionMiddleware } from './core/middleware';
import { logger } from './utils/logger';

import dotenv from 'dotenv';
import { bot } from './core/bot';

dotenv.config();

console.log('started')

// Apply middleware
// bot.use(sessionMiddleware);

// Register commands
// commandRegistry(bot);

// // Register error handler
// bot.catch(errorHandler);

// Start the bot
bot.launch()