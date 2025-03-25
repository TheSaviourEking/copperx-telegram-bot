// @ts-nocheck

import emailTransfer from './transfer/email.action';
import { handleSetDefaultWallet, setDefaultWalletAction } from './wallet/default.action';
import walletMenuAction from './wallet/menu.action';
import { depositAction, handleDepositWallet } from './wallet/deposit.action';
import transactionHistoryAction from './wallet/transaction.action';
import { executeTransfer, handleTransferWallet, transferOptionsAction, transferWalletAction, confirmTransfer } from './transfer/transfer.action'; // Import confirmTransfer
import cancelAction from './cancel';

interface Actions {
  [key: string]: (ctx: any, session: any, params?: string) => Promise<void>;
}

const actions: Actions = {
  // main menu actions
  login: async (ctx) => {
    await ctx.editMessageText('Please use /login to connect your wallet.');
  },
  balance: async (ctx) => {
    await ctx.editMessageText('Please use /balance to view your wallet balances.');
  },
  send: async (ctx) => {
    await ctx.editMessageText('Please use /send to send crypto.');
  },
  withdraw: async (ctx) => {
    await ctx.editMessageText('Please use /withdraw to withdraw crypto.');
  },
  help: async (ctx) => {
    await ctx.editMessageText('Help: Use /login, /balance, /send, /withdraw, or /help.');
  },
  cancel: async (ctx) => {
    await ctx.editMessageText('Action cancelled.', { reply_markup: { inline_keyboard: [] } });
  },

  transfer_email: emailTransfer,

  // wallet actions
  set_default_wallet: setDefaultWalletAction,
  select_default_wallet: async (ctx, session, params) => {
    if (!params) throw new Error('No wallet ID provided in callback');
    await handleSetDefaultWallet(ctx, params);
  },
  wallet_menu: walletMenuAction,
  deposit: depositAction,
  select_deposit_wallet: async (ctx, session, params) => {
    if (!params) throw new Error('No wallet ID provided in callback');
    await handleDepositWallet(ctx, session, params);
  },
  transfer_options: transferOptionsAction,
  transfer_wallet: transferWalletAction,
  select_transfer_wallet: async (ctx, session, params) => {
    if (!params) throw new Error('No wallet ID provided in callback');
    await handleTransferWallet(ctx, session, params);
  },
  // New action to handle user input and call confirmTransfer
  confirm_transfer_prompt: async (ctx, session, params) => {
    if (!params) throw new Error('No transfer data provided');
    const [amount, recipient] = params.split(' '); // Assuming params is "<amount> <address>"
    if (!amount || !recipient) throw new Error('Invalid transfer format');
    await confirmTransfer(ctx, session, amount, recipient);
  },
  // Adjusted confirm_transfer to handle the confirmation callback
  confirm_transfer: async (ctx, session, params) => {
    if (!params) throw new Error('No transfer data provided');
    await executeTransfer(ctx, session, params); // Executes after user confirms
  },

  transactions: transactionHistoryAction,

  // cancel action
  cancel: cancelAction,

  // profile action
};

export default actions;