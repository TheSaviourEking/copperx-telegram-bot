import { Telegraf } from 'telegraf';

export function setupMiddlewares(bot: Telegraf<any>) {
    // Auth middleware - check if user is authenticated
    bot.use(async (ctx, next) => {
        // Skip middleware for login command
        if (ctx.message && 'text' in ctx.message && ctx.message.text === '/login') {
            return next();
        }
        if (ctx.message && 'text' in ctx.message && ctx.message.text === '/start') {
            return next();
        }
        if (ctx.message && 'text' in ctx.message && ctx.message.text === '/help') {
            return next();
        }

        // Check if user has auth token
        if (!ctx.session?.authToken) {
            await ctx.reply(
                '🔒 You need to login first!\n\n' +
                'Please use /login to authenticate with your Copperx account.'
            );
            return;
        }

        return next();
    });

    // Error handling middleware
    bot.catch((err, ctx) => {
        console.error(`Bot error for ${ctx.updateType}`, err);
        ctx.reply(
            '❌ Something went wrong while processing your request.\n\n' +
            'Please try again later or contact support: https://t.me/copperxcommunity/2183'
        );
    });
}