import { decodeNetworkId } from "../../utils/validation";

class Keyboards {
  /**
   * Get main menu keyboard
   * @returns Telegram inline keyboard markup for the main menu
   */
  getMainMenuKeyboard(): any {
    const keyboard = {
      inline_keyboard: [
        [{ text: '🔑 Login', callback_data: 'login' }],
        [{ text: '💰 Balance', callback_data: 'balance' }],
        [{ text: '📤 Send', callback_data: 'send' }],
        [{ text: '🏦 Withdraw', callback_data: 'withdraw' }],
        [{ text: '❓ Help', callback_data: 'help' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get wallet options keyboard
   */
  getWalletOptions(): any {
    const keyboard = {
      inline_keyboard: [
        [{ text: 'Set Default Wallet', callback_data: 'set_default_wallet' }],
        [{ text: '📥 Deposit', callback_data: 'deposit' }],
        [{ text: '📤 Send Funds', callback_data: 'transfer_options' }],
        [{ text: '📊 Transaction History', callback_data: 'transactions' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get transfer options keyboard
   */
  getTransferOptions(): any {
    const keyboard = {
      inline_keyboard: [
        [{ text: '📧 Send to Email', callback_data: 'transfer_email' }],
        [{ text: '💼 Send to Wallet', callback_data: 'transfer_wallet' }],
        [{ text: '🏦 Withdraw to Bank', callback_data: 'transfer_bank' }],
        [{ text: '« Back', callback_data: 'wallet_menu' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get confirmation keyboard
   */
  getConfirmationKeyboard(action: string, data: string = ''): any {
    const callbackData = data ? `${action}:${data}` : action;
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirm', callback_data: `confirm_${callbackData}` },
          { text: '❌ Cancel', callback_data: 'cancel' },
        ],
      ],
    };
    return keyboard;
  }

  /**
   * Wallet selection keyboard method for the Keyboards class
   */
  getWalletSelectionKeyboard(wallets: any[]): any {
    const walletButtons = wallets.map((wallet) => {
      const nonZeroBalance = wallet.balances.find((bal: any) => parseFloat(bal.balance));
      let buttonText = '';
      if (nonZeroBalance) {
        const formattedAmount = (parseFloat(nonZeroBalance.balance) / 10 ** nonZeroBalance.decimals).toFixed(4);
        buttonText = `${decodeNetworkId(wallet.network)} - ${formattedAmount} ${nonZeroBalance.symbol}`;
      } else {
        buttonText = `${decodeNetworkId(wallet.network)} Wallet`;
      }
      return [{ text: buttonText, callback_data: `select_wallet:${wallet.walletId}` }];
    });

    walletButtons.push([{ text: '« Back', callback_data: 'wallet_menu' }]);
    walletButtons.push(this.getCancelButton());

    return { inline_keyboard: walletButtons };
  }

  /**
   * Get profile options keyboard
   */
  getProfileOptionsKeyboard(): any {
    const keyboard = {
      inline_keyboard: [
        [{ text: '✏️ Edit Profile', callback_data: 'edit_profile' }],
        [{ text: '🔑 Security Settings', callback_data: 'security_settings' }],
        [{ text: '📬 Notification Preferences', callback_data: 'notification_settings' }],
        [{ text: '💼 Wallet Management', callback_data: 'wallet_menu' }],
        [{ text: '📱 Connected Devices', callback_data: 'connected_devices' }],
        [{ text: '« Back to Menu', callback_data: 'main_menu' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get profile edit options keyboard
   */
  getProfileEditKeyboard(): any {
    const keyboard = {
      inline_keyboard: [
        [{ text: '📧 Change Email', callback_data: 'change_email' }],
        [{ text: '👤 Update Username', callback_data: 'update_username' }],
        [{ text: '🔐 Change Password', callback_data: 'change_password' }],
        [{ text: '📝 Complete KYC', callback_data: 'start_kyc' }],
        [{ text: '« Back to Profile', callback_data: 'back_to_profile' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get security settings keyboard
   */
  getSecuritySettingsKeyboard(has2FA: boolean = false): any {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: has2FA ? '🔒 Disable 2FA' : '🔒 Enable 2FA',
            callback_data: has2FA ? 'disable_2fa' : 'enable_2fa',
          },
        ],
        [{ text: '🔑 Reset API Keys', callback_data: 'reset_api_keys' }],
        [{ text: '📱 Manage Devices', callback_data: 'manage_devices' }],
        [{ text: '🚫 Block Account', callback_data: 'block_account' }],
        [{ text: '« Back to Profile', callback_data: 'back_to_profile' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  /**
   * Get notification settings keyboard
   */
  getNotificationSettingsKeyboard(settings: any = {}): any {
    const emailEnabled = settings.email !== false;
    const pushEnabled = settings.push !== false;
    const transactionAlerts = settings.transactions !== false;
    const securityAlerts = settings.security !== false;
    const marketAlerts = settings.market !== false;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: `📧 Email Notifications: ${emailEnabled ? '✅' : '❌'}`,
            callback_data: `toggle_email_notifications:${!emailEnabled}`,
          },
        ],
        [
          {
            text: `📲 Push Notifications: ${pushEnabled ? '✅' : '❌'}`,
            callback_data: `toggle_push_notifications:${!pushEnabled}`,
          },
        ],
        [
          {
            text: `💰 Transaction Alerts: ${transactionAlerts ? '✅' : '❌'}`,
            callback_data: `toggle_transaction_alerts:${!transactionAlerts}`,
          },
        ],
        [
          {
            text: `🔐 Security Alerts: ${securityAlerts ? '✅' : '❌'}`,
            callback_data: `toggle_security_alerts:${!securityAlerts}`,
          },
        ],
        [
          {
            text: `📊 Market Alerts: ${marketAlerts ? '✅' : '❌'}`,
            callback_data: `toggle_market_alerts:${!marketAlerts}`,
          },
        ],
        [{ text: '« Back to Profile', callback_data: 'back_to_profile' }],
      ],
    };

    keyboard.inline_keyboard.push(this.getCancelButton());
    return keyboard;
  }

  confirmTransfer(amount: string, recipient: string): any {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirm', callback_data: 'confirm' },
          { text: '❌ Cancel', callback_data: 'cancel' },
        ],
      ],
    };
    return keyboard;
  }

  getBackToWalletMenuButton() {
    return [{ text: '« Back to Wallet Menu', callback_data: 'wallet_menu' }];
  }

  getCancelButton() {
    return [{ text: '↩️ Cancel', callback_data: 'cancel' }];
  }

  addCancelButton(keyboard: any): any {
    const newKeyboard = JSON.parse(JSON.stringify(keyboard));
    newKeyboard.push(this.getCancelButton());
    return newKeyboard;
  }
}

const keyboards = new Keyboards();
export default keyboards;