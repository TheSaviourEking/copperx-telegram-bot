import { decodeNetworkId } from "../utils/validation";

class Keyboards {
    getMainMenuKeyboard(): any {
        return {
            inline_keyboard: [
                [{ text: '🔑 Login', callback_data: 'login' }],
                [{ text: '💰 Balance', callback_data: 'balance' }],
                [{ text: '📤 Send Funds', callback_data: 'transfer_options' }],
                [{ text: '❓ Help', callback_data: 'help' }],
                this.getCancelButton(), // Already had it, kept for clarity
            ],
        };
    }

    getWalletOptions(): any {
        return {
            inline_keyboard: [
                [{ text: 'Set Default Wallet', callback_data: 'set_default_wallet' }],
                [{ text: '📥 Deposit', callback_data: 'deposit' }],
                [{ text: '📤 Send Funds', callback_data: 'transfer_options' }],
                [{ text: '📊 Transaction History', callback_data: 'transactions' }],
                this.getCancelButton(), // Already had it, kept for clarity
            ],
        };
    }

    getTransferOptions(): any {
        return {
            inline_keyboard: [
                [{ text: '📧 Send to Email', callback_data: 'transfer_email' }],
                [{ text: '💼 Send to Wallet', callback_data: 'transfer_wallet' }],
                [{ text: '🏦 Withdraw to Bank', callback_data: 'transfer_bank' }],
                this.getBackButton('« Back', 'wallet_menu'),
                this.getCancelButton(), // Already had it, kept for clarity
            ],
        };
    }

    getConfirmationKeyboard(action: string, data: string = ''): any {
        const callbackData = data ? `${action}:${data}` : action;
        return {
            inline_keyboard: [
                [
                    { text: '✅ Confirm', callback_data: `confirm_${callbackData}` },
                    { text: '❌ Cancel', callback_data: 'cancel' },
                ],
                this.getCancelButton(), // Added here (though the inline "❌ Cancel" might suffice, adding for consistency)
            ],
        };
    }

    getWalletSelectionKeyboard(wallets: any[]): any {
        const walletButtons = wallets.map((wallet) => {
            const nonZeroBalance = wallet.balances.find((bal: any) => parseFloat(bal.balance) > 0) || null;
            let buttonText = nonZeroBalance
                ? `${decodeNetworkId(wallet.network)} - ${(parseFloat(nonZeroBalance.balance) / 10 ** nonZeroBalance.decimals).toFixed(4)} ${nonZeroBalance.symbol}`
                : `${decodeNetworkId(wallet.network)} Wallet`;

            return [{ text: buttonText, callback_data: `select_transfer_wallet:${wallet.walletId}` }];
        });
        walletButtons.push(this.getBackButton('« Back', 'wallet_menu'));
        walletButtons.push(this.getCancelButton());
        return { inline_keyboard: walletButtons || [] };
    }

    getProfileOptionsKeyboard(): any {
        return {
            inline_keyboard: [
                [{ text: '✏️ Edit Profile', callback_data: 'edit_profile' }],
                [{ text: '🔑 Security Settings', callback_data: 'security_settings' }],
                [{ text: '📬 Notification Preferences', callback_data: 'notification_settings' }],
                [{ text: '💼 Wallet Management', callback_data: 'wallet_menu' }],
                [{ text: '📱 Connected Devices', callback_data: 'connected_devices' }],
                this.getBackButton('« Back to Menu', 'main_menu'),
                this.getCancelButton(),
            ],
        };
    }

    getProfileEditKeyboard(): any {
        return {
            inline_keyboard: [
                [{ text: '📧 Change Email', callback_data: 'change_email' }],
                [{ text: '👤 Update Username', callback_data: 'update_username' }],
                [{ text: '🔐 Change Password', callback_data: 'change_password' }],
                [{ text: '📝 KYC Settings', callback_data: 'kyc_menu' }],
                this.getBackButton('« Back to Profile', 'back_to_profile'),
                this.getCancelButton(),
            ],
        };
    }

    getSecuritySettingsKeyboard(has2FA: boolean = false): any {
        return {
            inline_keyboard: [
                [{ text: has2FA ? '🔒 Disable 2FA' : '🔒 Enable 2FA', callback_data: has2FA ? 'disable_2fa' : 'enable_2fa' }],
                [{ text: '🔑 Reset API Keys', callback_data: 'reset_api_keys' }],
                [{ text: '📱 Manage Devices', callback_data: 'manage_devices' }],
                [{ text: '🚫 Block Account', callback_data: 'block_account' }],
                this.getBackButton('« Back to Profile', 'back_to_profile'),
                this.getCancelButton(), // Already had it, kept for clarity
            ],
        };
    }

    getNotificationSettingsKeyboard(settings: any = {}): any {
        const emailEnabled = settings.email !== false;
        const pushEnabled = settings.push !== false;
        const transactionAlerts = settings.transactions !== false;
        const securityAlerts = settings.security !== false;
        const marketAlerts = settings.market !== false;
        return {
            inline_keyboard: [
                [{ text: `📧 Email Notifications: ${emailEnabled ? '✅' : '❌'}`, callback_data: `toggle_email_notifications:${!emailEnabled}` }],
                [{ text: `📲 Push Notifications: ${pushEnabled ? '✅' : '❌'}`, callback_data: `toggle_push_notifications:${!pushEnabled}` }],
                [{ text: `💰 Transaction Alerts: ${transactionAlerts ? '✅' : '❌'}`, callback_data: `toggle_transaction_alerts:${!transactionAlerts}` }],
                [{ text: `🔐 Security Alerts: ${securityAlerts ? '✅' : '❌'}`, callback_data: `toggle_security_alerts:${!securityAlerts}` }],
                [{ text: `📊 Market Alerts: ${marketAlerts ? '✅' : '❌'}`, callback_data: `toggle_market_alerts:${!marketAlerts}` }],
                this.getBackButton('« Back to Profile', 'back_to_profile'),
                this.getCancelButton(), // Already had it, kept for clarity
            ],
        };
    }

    /**
 * Get KYC status keyboard
 * @param kycStatus Object containing KYC/KYB status details
 * @returns Telegram inline keyboard markup for KYC status and actions
 */
    getKycStatusKeyboard(kycStatus: any = { kycStatus: 'not_started' }): any {
        const keyboard = {
            inline_keyboard: [],
        };

        // Action buttons based on status
        if (kycStatus.kycStatus === 'not_started' || kycStatus.kycStatus === 'rejected') {
            keyboard.inline_keyboard.push([{ text: '📝 Start KYC', callback_data: 'start_kyc' }]);
        }
        keyboard.inline_keyboard.push([{ text: '📤 Upload Documents', callback_data: 'upload_kyc_docs' }]);
        keyboard.inline_keyboard.push([{ text: '🔄 Refresh Status', callback_data: 'refresh_kyc_status' }]);

        // KYB option if applicable
        if (kycStatus.accountType === 'business' || kycStatus.kybStatus) {
            keyboard.inline_keyboard.push([{ text: '🏢 Start KYB', callback_data: 'start_kyb' }]);
        }

        // View details for pending or rejected
        if (kycStatus.kycStatus === 'pending' || kycStatus.kycStatus === 'rejected') {
            keyboard.inline_keyboard.push([{ text: '🔍 View Details', callback_data: 'kyc_details' }]);
        }

        // Navigation
        keyboard.inline_keyboard.push(this.getBackButton('« Back to Profile', 'back_to_profile'));
        keyboard.inline_keyboard.push(this.getCancelButton());

        return keyboard;
    }

    getBackButton(text: string, callback_data: string) {
        return [{ text, callback_data }];
    }

    getCancelButton() {
        return [{ text: '↩️ Cancel', callback_data: 'cancel' }];
    }
}

const keyboards = new Keyboards();
export default keyboards;