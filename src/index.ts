const http = require('http');

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


const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
});
bot.launch()

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});