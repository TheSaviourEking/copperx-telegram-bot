import { decodeNetworkId } from "../utils/validation";

class Formatters {
    /**
     * Format wallet balances for display
     * @param {Array} balances - Array of wallet balance objects
     * @returns {string} - Formatted message
     */
    formatBalances(balances: any[]): string {
        if (!balances || balances.length === 0) {
            return 'No wallet balances available.';
        }

        let message = '*Your Wallet Balances*\n\n';

        balances.forEach(wallet => {
            const isDefault = wallet.isDefault ? ' (Default)' : '';
            message += `*Wallet ${wallet.walletId}${isDefault}*\n`;

            if (wallet.balances && wallet.balances.length > 0) {
                wallet.balances.forEach(balance => {
                    message += `- ${balance.balance} ${balance.symbol} in ${balance.address} on ${decodeNetworkId(wallet.network)}\n`;
                });
            } else {
                message += '- No funds in this wallet\n';
            }

            message += '\n';
        });

        return message;
    }

    /**
     * Format transaction history
     * @param {Array} transactions - Array of transaction objects
     * @returns {string} - Formatted message
     */
    formatTransactions(transactions: any[]): string {
        if (!transactions || transactions.length === 0) {
            return 'No recent transactions.';
        }

        let message = '*Recent Transactions*\n\n';

        transactions.forEach(tx => {
            const date = new Date(tx.timestamp).toLocaleDateString();
            const type = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);

            message += `*${type}* - ${date}\n`;
            message += `Amount: ${tx.amount} ${tx.currency}\n`;

            if (tx.recipient) {
                message += `To: ${tx.recipient}\n`;
            }

            if (tx.sender) {
                message += `From: ${tx.sender}\n`;
            }

            message += `Status: ${tx.status}\n\n`;
        });

        return message;
    }
}

const formatters = new Formatters();
export default formatters;