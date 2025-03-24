import walletService from '../../services/wallet.service';
import transferService from '../../services/transfer.service'; // Assuming this exists for sending funds
import { logger } from '../../utils/logger';
import { decodeNetworkId } from '../../utils/validation';
import keyboards from '../../ui/keyboards';

interface TransferActionContext {
    from: { id: number };
    editMessageText: (text: string, options: any) => Promise<void>;
    reply: (text: string, options?: any) => Promise<void>;
    session?: any;
}

// Step 1: Show transfer options
async function transferOptionsAction(ctx: TransferActionContext) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        await ctx.editMessageText('Choose how to send funds:', {
            reply_markup: keyboards.getTransferOptions(),
        });
    } catch (err) {
        logger.error('Error in transferOptionsAction:', err);
        await ctx.editMessageText('An error occurred. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([]),
            },
        });
    }
}

// Step 2: Handle wallet transfer - select source wallet
async function transferWalletAction(ctx: TransferActionContext) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        const wallets = await walletService.getWallets(userId);
        if (!wallets || wallets.length === 0) {
            await ctx.editMessageText('No wallets found. Please create a wallet first.', {
                reply_markup: {
                    inline_keyboard: keyboards.addCancelButton([]),
                },
            });
            return;
        }

        let inlineKeyboard = wallets.map((wallet) => [
            {
                text: `${wallet.id} (${decodeNetworkId(wallet.network)})`,
                callback_data: `select_transfer_wallet:${wallet.id}`,
            },
        ]);
        inlineKeyboard = keyboards.addCancelButton(inlineKeyboard);

        await ctx.editMessageText('Select the wallet to send funds from:', {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    } catch (err) {
        logger.error('Error in transferWalletAction:', err);
        await ctx.editMessageText('An error occurred while fetching wallets. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([]),
            },
        });
    }
}

// Step 3: Handle wallet selection and prompt for details
async function handleTransferWallet(ctx: TransferActionContext, session: any, walletId: string) {
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

        // Store walletId in session for the next step
        if (session) {
            session.transfer = { walletId };
        }

        await ctx.editMessageText(
            `Selected Wallet #${walletId} (${decodeNetworkId(selectedWallet.network)}).\n\n` +
            'Please reply with the amount and recipient address in the format: `<amount> <address>`\n' +
            'e.g., `10 0x1234...abcd`',
            {
                reply_markup: {
                    inline_keyboard: keyboards.addCancelButton([]),
                },
            }
        );

        // Wait for user input (handled by a separate text handler)
    } catch (error) {
        logger.error('Error in handleTransferWallet:', error);
        await ctx.editMessageText('An error occurred. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([]),
            },
        });
    }
}

// Step 4: Confirm and execute transfer (called after user input)
async function confirmTransfer(ctx: TransferActionContext, session: any, amount: string, recipient: string) {
    try {
        const userId = ctx.from.id;
        if (!userId || !session?.transfer?.walletId) {
            throw new Error('Invalid user ID or session data');
        }

        const walletId = session.transfer.walletId;
        const wallets = await walletService.getWallets(userId);
        const selectedWallet = wallets.find((w) => w.id === walletId);
        if (!selectedWallet) {
            throw new Error('Selected wallet not found');
        }

        // Show confirmation
        await ctx.editMessageText(
            `Confirm transfer:\n` +
            `- From: Wallet #${walletId} (${decodeNetworkId(selectedWallet.network)})\n` +
            `- Amount: ${amount}\n` +
            `- To: ${recipient}`,
            {
                reply_markup: keyboards.getConfirmationKeyboard('transfer', `${walletId}:${amount}:${recipient}`),
            }
        );
    } catch (error) {
        logger.error('Error in confirmTransfer:', error);
        await ctx.editMessageText('An error occurred during transfer confirmation. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([]),
            },
        });
    }
}

// Step 5: Execute the transfer
async function executeTransfer(ctx: TransferActionContext, session: any, data: string) {
    try {
        const userId = ctx.from.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        const [walletId, amount, recipient] = data.split(':');
        const result = await transferService.sendFunds(userId, walletId, amount, recipient); // Adjust based on your service
        logger.info(`Transfer executed: ${walletId} -> ${recipient} (${amount})`);

        // Clear session
        if (session) {
            session.transfer = undefined;
        }

        await ctx.editMessageText(
            `Transfer successful!\n` +
            `- From: Wallet #${walletId}\n` +
            `- Amount: ${amount}\n` +
            `- To: ${recipient}`,
            {
                reply_markup: {
                    inline_keyboard: [keyboards.getBackToWalletMenuButton()],
                },
            }
        );
    } catch (error) {
        logger.error('Error in executeTransfer:', error);
        await ctx.editMessageText('Transfer failed. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.addCancelButton([keyboards.getBackToWalletMenuButton()]),
            },
        });
    }
}

export { transferOptionsAction, transferWalletAction, handleTransferWallet, confirmTransfer, executeTransfer };