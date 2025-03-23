import { logger } from '../utils/logger';

interface ErrorHandlerContext {
    update: any;
    chat?: any;
    reply: (text: string) => Promise<void>;
}

const errorHandler = (err: Error, ctx: ErrorHandlerContext) => {
    logger.error('Bot error', {
        error: err.message,
        update: ctx.update
    });

    // Try to send error message to user
    try {
        const message = 'An error occurred while processing your request. Please try again later.';
        if (ctx.chat) {
            return ctx.reply(message);
        }
    } catch (e) {
        logger.error('Failed to send error message', e);
    }
};

export { errorHandler };