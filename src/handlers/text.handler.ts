// @ts-nocheck

import { SessionContext } from "../../global";
import actions from "../actions";
import { sessionManager } from "../state/session";
import keyboards from "../ui/keyboards";
import { logger } from "../utils/logger";

const textHandler = (bot: any) => {
    console.log('Registering text handler');

    // TEXT HANDLER
    bot.on('text', async (ctx: SessionContext) => {
        console.log('received text')
        const userId = ctx.from?.id;
        if (!userId) {
            logger.warn('Text message received without user ID');
            return;
        }

        const session = ctx.session || sessionManager.getSession(userId.toString());
        if (session?.transfer?.walletId) {
            // User is in the transfer flow, expecting <amount> <address>
            const text = ctx.message.text.trim();
            const [amount, recipient] = text.split(/\s+/);

            if (!amount || !recipient) {
                await ctx.reply('Invalid format. Please use: `<amount> <address>` (e.g., `10 0x1234...abcd`)', {
                    reply_markup: {
                        inline_keyboard: [keyboards.getCancelButton()],
                    },
                });
                return;
            }

            try {
                await actions.confirm_transfer_prompt(ctx, session, `${amount} ${recipient}`);
            } catch (error) {
                logger.error('Error in text handler for transfer:', error);
                await ctx.reply('An error occurred. Please try again.', {
                    reply_markup: {
                        inline_keyboard: [keyboards.getCancelButton()],
                    },
                });
            }
        }
    });
}

export default textHandler;