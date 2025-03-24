// wallet/deposit.action.ts
import walletService from '../../services/wallet.service';
import { logger } from '../../utils/logger';
import { decodeNetworkId } from '../../utils/validation';
import keyboards from '../../ui/keyboards'; // Import the Keyboards instance

interface DepositActionContext {
    from: { id: number };
    editMessageText: (text: string, options: any) => Promise<void>;
    session?: any;
}

// Step 1: Show wallet selection for deposit
async function depositAction(ctx: DepositActionContext) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        const wallets = await walletService.getWallets(userId);
        if (!wallets || wallets.length === 0) {
            await ctx.editMessageText('No wallets found. Please create a wallet first.', {
                reply_markup: {
                    inline_keyboard: keyboards.addCancelButton([]), // Empty keyboard with Cancel
                },
            });
            return;
        }

        let inlineKeyboard = wallets.map((wallet) => [
            {
                text: `${wallet.id} (${decodeNetworkId(wallet.network)})`,
                callback_data: `select_deposit_wallet:${wallet.id}`,
            },
        ]);

        // Add Cancel button using keyboards.addCancelButton
        inlineKeyboard = keyboards.addCancelButton(inlineKeyboard);

        const uniqueText = `Please select a wallet to deposit into: \u200B${Date.now()}`;
        await ctx.editMessageText(uniqueText, {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    } catch (err) {
        logger.error('Error in depositAction:', err);
        await ctx.editMessageText('An error occurred while fetching wallets. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([]),
            },
        });
    }
}

// Step 2: Handle wallet selection and show deposit address
async function handleDepositWallet(ctx: DepositActionContext, session: any, walletId: string) {
    try {
        const userId = ctx.from.id;
        if (!userId || !walletId) {
            throw new Error('Invalid user ID or wallet ID');
        }

        const wallets = await walletService.getWallets(userId);
        const selectedWallet = wallets.find((w) => w.id === walletId);
        if (!selectedWallet) {
            throw new Error('Selected wallet not found');
        }

        const depositAddress = selectedWallet.walletAddress;
        if (!depositAddress) {
            throw new Error('No deposit address available for this wallet');
        }

        logger.info(`Showing deposit address for wallet ${walletId}: ${depositAddress}`);

        let inlineKeyboard = [
            keyboards.getBackToWalletMenuButton(), // Back to Wallet Menu
        ];
        inlineKeyboard = keyboards.addCancelButton(inlineKeyboard); // Add Cancel

        await ctx.editMessageText(
            `Deposit to Wallet #${walletId} (${decodeNetworkId(selectedWallet.network)}):\n\n` +
            `*${depositAddress}*\n\n` +
            'Send your funds to this address. It may take some time for the balance to update.',
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: inlineKeyboard },
            }
        );
    } catch (error) {
        logger.error('Error in handleDepositWallet:', error);
        let inlineKeyboard = [
            keyboards.getBackToWalletMenuButton(),
        ];
        inlineKeyboard = keyboards.addCancelButton(inlineKeyboard);
        await ctx.editMessageText('An error occurred while retrieving the deposit address. Please try again.', {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    }
}

export { depositAction, handleDepositWallet };