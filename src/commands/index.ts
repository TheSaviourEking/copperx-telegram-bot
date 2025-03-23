import StartCommand from './start.command';
import LoginCommand from './login.command';
import BalanceCommand from './balance.command';
import SendCommand from './send.command';
import WithdrawCommand from './withdraw.command';
import HelpCommand from './help.command';
import authService from '../services/auth.service';
import walletService from '../services/wallet.service';
import keyboards from '../ui/keyboards';
import formatters from '../ui/formatters';

// import authService from '../services/auth.service';
// import walletService from '../services/wallet.service';
// import transferService from '../services/transfer.service';
// import keyboards from '../ui/keyboards';

// Initialize commands with their dependencies
const commands = [
  new StartCommand(),
  new LoginCommand({authService}),
  new BalanceCommand({walletService, keyboards, formatters}),
  // new SendCommand(transferService, keyboards),
  // new WithdrawCommand({transferService, keyboards}),
  new HelpCommand()
];

// Register commands with bot
export default (bot: any) => {
  commands.forEach(cmd => {
    bot.command(cmd.command, (ctx: any) => cmd.handle(ctx));
  });

  return commands;
};