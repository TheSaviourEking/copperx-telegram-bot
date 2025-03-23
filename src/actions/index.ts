import emailTransfer from './transfer/email.action';
import walletTransfer from './transfer/wallet.action';
import bankTransfer from './transfer/bank.action';
import setDefaultWallet from './wallet/default.action';
import depositAction from './wallet/deposit.action';

interface Actions {
  [key: string]: (ctx: any, session: any) => Promise<void>;
}

const actions: Actions = {
  // Transfer actions
  transfer_email: emailTransfer,
  transfer_wallet: walletTransfer,
  transfer_bank: bankTransfer,

  // Wallet actions
  set_default_wallet: setDefaultWallet,
  deposit: depositAction
};

export default actions;