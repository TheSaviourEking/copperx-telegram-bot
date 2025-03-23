import { sessionManager } from '../state/session';
import { logger } from '../utils/logger';
import actions from '../actions';

interface CallbackHandlerContext {
    from: { id: number };
    match: RegExpMatchArray;
    answerCbQuery: (text?: string) => Promise<void>;
}

const callbackHandler = (bot: any) => {
    // Set up a regex pattern to match all action callbacks
    bot.action(/^([a-z_]+)(?::(.+))?$/i, async (ctx: CallbackHandlerContext) => {
        const actionName = ctx.match[1];
        const params = ctx.match[2];

        // Find the appropriate action handler
        const actionHandler = actions[actionName];

        if (!actionHandler) {
            logger.warn(`Unknown action requested: ${actionName}`);
            return ctx.answerCbQuery('This action is not available');
        }

        try {
            // Get the session for this user
            const userId = ctx.from.id;
            const session = sessionManager.getSession(userId);

            // Execute the action
            await actionHandler(ctx, session, params);

            // Acknowledge the callback query
            await ctx.answerCbQuery();
        } catch (error) {
            logger.error(`Error handling callback: ${actionName}`, error);
            await ctx.answerCbQuery(`Error: ${error.message}`);
        }
    });
};

export { callbackHandler };