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
                    inline_keyboard: keyboards.addCancelButton([]),
                },
            });
            return;
        }

        const inlineKeyboard = [
            [{ text: 'Set Default Wallet', callback_data: 'set_default_wallet' }],
            [{ text: 'View Balances', callback_data: 'view_balances' }],
            [{ text: 'Deposit', callback_data: 'deposit' }],
            [{ text: 'Send Funds', callback_data: 'transfer_options' }],
            [{ text: 'Transaction History', callback_data: 'transactions' }],
        ];

        await ctx.editMessageText('Wallet Menu:', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton(inlineKeyboard),
            },
        });
    } catch (error) {
        logger.error('Error in walletMenuAction:', error);
        await ctx.editMessageText('An error occurred while loading the wallet menu. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([keyboards.getBackToWalletMenuButton()]),
            },
        });
    }
}

export default walletMenuAction;