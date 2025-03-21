import { setupBot } from "./bot";

async function main() {
    try {
        // Initialize the bot
        const bot = setupBot();

        // Start the bot
        await bot.launch();
        
        console.log('🚀 Bot is running successfully!');
        console.log('ℹ️ Users can type /start for an intro or /help for commands.');

        // Enable graceful stop with feedback
        process.once('SIGINT', () => {
            bot.stop('SIGINT');
            console.log('🛑 Bot stopped via SIGINT');
        });
        process.once('SIGTERM', () => {
            bot.stop('SIGTERM');
            console.log('🛑 Bot stopped via SIGTERM');
        });
    } catch (error) {
        console.error('❌ Error starting bot:', error);
        process.exit(1);
    }
}



main();