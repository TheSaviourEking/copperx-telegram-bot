import { decodeNetworkId } from "../utils/validation";

class Keyboards {
    /**
     * Get wallet options keyboard
     */
    getWalletOptions(): any {
        return {
            inline_keyboard: [
                [{ text: 'Set Default Wallet', callback_data: 'set_default_wallet' }],
                [{ text: '📥 Deposit', callback_data: 'deposit' }],
                [{ text: '📤 Send Funds', callback_data: 'transfer_options' }],
                [{ text: '📊 Transaction History', callback_data: 'transactions' }]
            ]
        };
    }

    /**
     * Get transfer options keyboard
     */
    getTransferOptions(): any {
        return {
            inline_keyboard: [
                [{ text: '📧 Send to Email', callback_data: 'transfer_email' }],
                [{ text: '💼 Send to Wallet', callback_data: 'transfer_wallet' }],
                [{ text: '🏦 Withdraw to Bank', callback_data: 'transfer_bank' }],
                [{ text: '« Back', callback_data: 'wallet_menu' }]
            ]
        };
    }

    /**
     * Get confirmation keyboard
     */
    getConfirmationKeyboard(action: string, data: string = ''): any {
        const callbackData = data ? `${action}:${data}` : action;
        return {
            inline_keyboard: [
                [
                    { text: '✅ Confirm', callback_data: `confirm_${callbackData}` },
                    { text: '❌ Cancel', callback_data: 'cancel' }
                ]
            ]
        };
    }

    /**
 * Wallet selection keyboard method for the Keyboards class
 */
    getWalletSelectionKeyboard(wallets: any[]): any {
        // Format the wallet buttons for display
        const walletButtons = wallets.map(wallet => {
            // Find the first non-zero balance if available
            const nonZeroBalance = wallet.balances.find((bal: any) =>
                // parseFloat(bal.balance) > 0
                parseFloat(bal.balance)
            );

            // Format the button text
            let buttonText = '';

            if (nonZeroBalance) {
                // Format with token amount if there's a non-zero balance
                // Convert to proper decimal representation using the token's decimals
                const formattedAmount = (parseFloat(nonZeroBalance.balance) / 10 ** nonZeroBalance.decimals).toFixed(4);
                buttonText = `${decodeNetworkId(wallet.network)} - ${formattedAmount} ${nonZeroBalance.symbol}`;
            } else {
                // Otherwise just show the network
                buttonText = `${decodeNetworkId(wallet.network)} Wallet`;
            }

            // Return the button with callback data
            return [{
                text: buttonText,
                callback_data: `select_wallet:${wallet.walletId}`
            }];
        });

        // Add a cancel button
        walletButtons.push([{
            text: '« Back',
            callback_data: 'wallet_menu'
        }]);

        return {
            inline_keyboard: walletButtons
        };
    }
}

const keyboards = new Keyboards();
export default keyboards;