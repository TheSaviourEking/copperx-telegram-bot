import keyboards from "../../ui/keyboards";
import { logger } from "../../utils/logger";

/**
 * Handles the cancel action by resetting the conversation state
 * and returning to the main menu
 */
async function cancelAction(ctx) {
    try {
        // Clear any session data related to in-progress operations
        if (ctx.session) {
            // Reset any relevant session variables
            ctx.session.currentOperation = null;
            ctx.session.pendingTransfer = null;
            ctx.session.selectedWallet = null;
        }

        // Check if this is called from a callback query (inline button)
        if (ctx.callbackQuery) {
            // Update the existing message
            await ctx.editMessageText("Operation cancelled. What would you like to do next?", {
                reply_markup: { inline_keyboard: keyboards.getMainMenuKeyboard().inline_keyboard}
            });
        } else {
            // This is a direct command, send a new message
            await ctx.reply("Operation cancelled. What would you like to do next?", {
                reply_markup: { inline_keyboard: keyboards.getMainMenuKeyboard().inline_keyboard }
            });
        }

        // If there's a callback query, answer it to stop the loading indicator
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('Cancelled');
        }
    } catch (error) {
        logger.error("Error in cancel action:", error);

        // Handle different contexts appropriately
        try {
            if (ctx.callbackQuery) {
                await ctx.answerCbQuery('Something went wrong');
                await ctx.editMessageText("Something went wrong. Please try again.");
            } else {
                await ctx.reply("Something went wrong. Please try again.");
            }
        } catch (secondaryError) {
            logger.error("Error while handling error in cancel action:", secondaryError);
        }
    }
}

export default cancelAction;