// wallet/default.action.ts (unchanged, just confirming)
import transferService from '../../services/transfer.service';
import walletService from '../../services/wallet.service';
import keyboards from '../../ui/keyboards';
import { logger } from '../../utils/logger';
import { decodeNetworkId } from '../../utils/validation';

interface SetDefaultWalletActionContext {
    from: { id: number };
    editMessageText: (text: string, options: any) => Promise<void>;
    session?: any;
}

async function setDefaultWalletAction(ctx: SetDefaultWalletActionContext) {
    try {
        const userId = ctx.from?.id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        const wallets = await walletService.getWallets(userId);
        if (!wallets || wallets.length === 0) {
            await ctx.editMessageText('No wallets found. Please create a wallet first.', {
                reply_markup: { inline_keyboard: [] },
            });
            return;
        }

        let inlineKeyboard = wallets.map((wallet) => [
            {
                text: `${wallet.id} (${decodeNetworkId(wallet.network)})`,
                callback_data: `select_default_wallet:${wallet.id}`,
            },
        ]);

        // Add the cancel button
        inlineKeyboard = keyboards.addCancelButton(inlineKeyboard);

        const uniqueText = `Please select a wallet to set as your default:\u200B`;
        await ctx.editMessageText(uniqueText, {
            reply_markup: { inline_keyboard: inlineKeyboard },
        });
    } catch (err) {
        logger.error('Error in setDefaultWalletAction:', err);
        await ctx.editMessageText('An error occurred while fetching wallets. Please try again.', {
            reply_markup: { inline_keyboard: [] },
        });
    }
}

async function handleSetDefaultWallet(ctx: SetDefaultWalletActionContext, walletId: string) {
    try {
        const userId = ctx.from.id;
        if (!userId || !walletId) {
            throw new Error('Invalid user ID or wallet ID');
        }

        logger.info('Setting default wallet:', walletId);
        const wallet = await walletService.setDefaultWallet(userId, walletId);
        if (!wallet) {
            throw new Error('Wallet not found or update failed');
        }

        logger.info('Default wallet set:', wallet);

        await ctx.editMessageText(`Wallet #${walletId} has been set as your default wallet.`, {
            reply_markup: {
                inline_keyboard: [[{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }]],
            },
        });
    } catch (error) {
        logger.error('Error setting default wallet:', error);
        await ctx.editMessageText('An error occurred. Please try again.', {
            reply_markup: {
                inline_keyboard: [[{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }]],
            },
        });
    }
}

// async function handleSetDefaultWallet(ctx:SetDefaultWalletActionContext, walletId: string) {
//     try {
//         const wallet = await walletService.setDefaultWallet(ctx.from.id, walletId);

//         // await ctx.editMessageText(`Wallet ${walletId} has been set as your default wallet.`, {
//         //     reply_markup: {
//         //         inline_keyboard: [
//         //             [{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }]
//         //         ]
//         //     }
//         // });

//         await ctx.editMessageText(`*Wallet ${walletId} has been set as your default wallet.*`, {
//             parse_mode: 'Markdown',
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }]

//                 ]
//             }
//         });

//     } catch (error) {
//         logger.error(`Error setting default wallet:`, error);
//         await ctx.editMessageText("An error occurred. Please try again.", {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }]
//                 ]
//             }
//         });
//     }
// }

export { setDefaultWalletAction, handleSetDefaultWallet };