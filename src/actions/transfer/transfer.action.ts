import crypto from 'crypto';
import walletService from '../../services/wallet.service';
import transferService from '../../services/transfer.service'; // Assuming this exists for sending funds
import { logger } from '../../utils/logger';
import { decodeNetworkId } from '../../utils/validation';
import keyboards from '../../ui/keyboards';
import { sessionManager } from '../../state/session';

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
                inline_keyboard: keyboards.getCancelButton(),
            },
        });
    }
}

// Step 2: Handle wallet transfer - select source wallet
// async function transferWalletAction(ctx: TransferActionContext) {
//     try {
//         const userId = ctx.from?.id;
//         if (!userId) {
//             throw new Error('User ID not found');
//         }

//         const wallets = await walletService.getBalances(userId);
//         if (!wallets || wallets.length === 0) {
//             await ctx.editMessageText('No wallets found. Please create a wallet first.', {
//                 reply_markup: {
//                     inline_keyboard: keyboards.getCancelButton(),
//                 },
//             });
//             return;
//         }

//         await ctx.editMessageText('Select the wallet to send funds from:', {
//             reply_markup: { inline_keyboard: keyboards.getWalletSelectionKeyboard(wallets).inline_keyboard },
//         });
//     } catch (err) {
//         logger.error('Error in transferWalletAction:', err);
//         await ctx.editMessageText('An error occurred while fetching wallets. Please try again.', {
//             reply_markup: {
//                 inline_keyboard: keyboards.getCancelButton(),
//             },
//         });
//     }
// }

async function transferWalletAction(ctx: TransferActionContext) {
    console.log('TRANSFER WALLET ACTION');
    console.log('CTX:', ctx.session?.currentAction === 'transfer_wallet');
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Check if we're already showing the wallet selection
        if (ctx.session?.currentAction === 'transfer_wallet') {
            await ctx.answerCbQuery('Wallet selection is already open.');
            return;
        }

        const wallets = await walletService.getBalances(userId);
        if (!wallets || wallets.length === 0) {
            await ctx.editMessageText('No wallets found. Please create a wallet first.', {
                reply_markup: {
                    inline_keyboard: [keyboards.getCancelButton()], // Fixed format here too
                },
            });
            return;
        }

        ctx.session.currentAction = 'transfer_wallet';
        await ctx.editMessageText('Select the wallet to send funds from:', {
            reply_markup: { inline_keyboard: keyboards.getWalletSelectionKeyboard(wallets).inline_keyboard },
        });
    } catch (err) {
        logger.error('Error in transferWalletAction:', err);
        delete ctx.session.currentAction;
        delete ctx.session.transfer;
        delete ctx.session.transferDetails;
        await ctx.editMessageText('An error occurred while fetching wallets. Please try again.', {
            reply_markup: {
                inline_keyboard: [keyboards.getCancelButton()],
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
                    inline_keyboard: [keyboards.getCancelButton()],
                },
            }
        );

        // Wait for user input (handled by a separate text handler)
    } catch (error) {
        logger.error('Error in handleTransferWallet:', error);
        await ctx.editMessageText('An error occurred. Please try again.', {
            reply_markup: {
                inline_keyboard: [keyboards.getCancelButton()],
            },
        });
    }
}

// Step 4: Confirm and execute transfer (called after user input)
// async function confirmTransfer(ctx: TransferActionContext, session: any, amount: string, recipient: string) {
//     try {
//         const userId = ctx.from.id;
//         if (!userId || !session?.transfer?.walletId) {
//             throw new Error('Invalid user ID or session data');
//         }

//         const walletId = session.transfer.walletId;
//         const wallets = await walletService.getWallets(userId);
//         const selectedWallet = wallets.find((w) => w.id === walletId);
//         if (!selectedWallet) {
//             throw new Error('Selected wallet not found');
//         }

//         console.log('KEYBOARD:', keyboards.getConfirmationKeyboard('transfer', `${walletId}:${amount}:${recipient}`))
//         // Show confirmation
//         await ctx.reply(
//             `Confirm transfer:\n` +
//             `- From: Wallet #${walletId} (${decodeNetworkId(selectedWallet.network)})\n` +
//             `- Amount: ${amount}\n` +
//             `- To: ${recipient}`,
//             {
//                 reply_markup: keyboards.getConfirmationKeyboard('transfer', `${walletId}:${amount}:${recipient}`),
//             }
//         );
//     } catch (error) {
//         logger.error('Error in confirmTransfer:', error);
//         await ctx.reply('An error occurred during transfer confirmation. Please try again.', {
//             reply_markup: {
//                 inline_keyboard: [keyboards.getCancelButton()],
//             },
//         });
//     }
// }

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

        // Generate a short unique ID using crypto.randomUUID()
        const transferId = crypto.randomUUID().slice(0, 8); // e.g., "a1b2c3d4"
        session.transferDetails = session.transferDetails || {};
        session.transferDetails[transferId] = { walletId, amount, recipient };

        (async () => {
            delete session.currentAction;
            delete session.transfer;

            await ctx.editMessageText(
                `Confirm transfer:\n` +
                `- From: Wallet #${walletId} (${decodeNetworkId(selectedWallet.network)})\n` +
                `- Amount: ${amount}\n` +
                `- To: ${recipient}`,
                {
                    reply_markup: keyboards.getConfirmationKeyboard('transfer', transferId),
                }
            );
        })();
    } catch (error) {
        logger.error('Error in confirmTransfer:', error);
        await ctx.reply('An error occurred during transfer confirmation. Please try again.', {
            reply_markup: {
                inline_keyboard: [keyboards.getCancelButton()],
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
                    inline_keyboard: [keyboards.getCancelButton()],
                },
            }
        );
    } catch (error) {
        logger.error('Error in executeTransfer:', error);
        await ctx.editMessageText('Transfer failed. Please try again.', {
            reply_markup: {
                inline_keyboard: keyboards.getMainMenuKeyboard().inline_keyboard,
            },
        });
    }
}

export { transferOptionsAction, transferWalletAction, handleTransferWallet, confirmTransfer, executeTransfer };