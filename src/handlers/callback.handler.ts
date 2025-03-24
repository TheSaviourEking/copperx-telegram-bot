// @ts-nocheck

import { SessionContext } from '../../global';
import { sessionManager } from '../state/session';
import { logger } from '../utils/logger';
import actions from '../actions';
import keyboards from '../ui/keyboards';

const callbackHandler = (bot: any) => {
    console.log('Registering callback handler');

    // Set up a regex pattern to match all action callbacks
    bot.action(/^([a-z_]+)(?::(.+))?$/i, async (ctx: SessionContext) => {
        const actionName = ctx.match[1];
        const params = ctx.match[2];

        const actionHandler = actions[actionName];
        if (!actionHandler) {
            logger.warn(`Unknown action requested: ${actionName}`);
            await ctx.answerCbQuery('This action is not available');
            return;
        }

        try {
            const userId = ctx.from?.id;
            if (!userId) {
                throw new Error('User ID not found');
            }

            // Acknowledge the callback immediately to prevent timeout
            await ctx.answerCbQuery();

            const session = ctx.session || sessionManager.getSession(userId.toString());
            await actionHandler(ctx, session, params);
        } catch (error) {
            logger.error(`Error handling callback: ${actionName}`, error);
            try {
                // Attempt to edit the message with an error notice
                await ctx.editMessageText(`Error: ${error.message}`, {
                    reply_markup: {
                        inline_keyboard: keyboards.addCancelButton([keyboards.getBackToWalletMenuButton()]),
                    },
                });
            } catch (editError) {
                logger.error('Failed to edit message after error:', editError);
                // Fallback: Send a new message if editing fails (e.g., message deleted)
                try {
                    await ctx.reply(`Error: ${error.message}`, {
                        reply_markup: {
                            inline_keyboard: keyboards.addCancelButton([keyboards.getBackToWalletMenuButton()]),
                        },
                    });
                } catch (replyError) {
                    logger.error('Failed to send error message:', replyError);
                }
            }
        }
    });
};

export { callbackHandler };