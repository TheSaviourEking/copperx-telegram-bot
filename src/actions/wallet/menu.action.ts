import walletService from '../../services/wallet.service';
import keyboards from '../../ui/keyboards';
import { logger } from '../../utils/logger';

interface WalletMenuActionContext {
    from: { id: number };
    editMessageText: (text: string, options: any) => Promise<void>;
    session?: any;
}

async function walletMenuAction(ctx: WalletMenuActionContext) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Show a loading message immediately
        await ctx.editMessageText('Loading wallet menu...', {
            reply_markup: { inline_keyboard: [] },
        });

        const wallets = await walletService.getWallets(userId);
        if (!wallets || wallets.length === 0) {
            await ctx.editMessageText('No wallets found. Please create a wallet first.', {
                reply_markup: {
                    inline_keyboard: keyboards.getCancelButton(),
                },
            });
            return;
        }


        await ctx.editMessageText('Wallet Menu:', {
            reply_markup: {
                inline_keyboard: keyboards.getWalletOptions().inline_keyboard,
            },
        });
    } catch (error) {
        logger.error('Error in walletMenuAction:', error);
        await ctx.editMessageText('An error occurred while loading the wallet menu. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.getMainMenuKeyboard().inline_keyboard
            },
        });
    }
}

export default walletMenuAction;