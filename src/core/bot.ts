import { Telegraf } from 'telegraf';
import { SessionContext } from '../../global';
import botConfig from '../config/bot.config';
import { sessionMiddleware, loggingMiddleware } from './middleware';
import authService from '../services/auth.service';
import walletService from '../services/wallet.service';
import transferService from '../services/transfer.service';
import keyboards from '../ui/keyboards';
import formatters from '../ui/formatters';
import StartCommand from '../commands/start.command';
import LoginCommand from '../commands/login.command';
import BalanceCommand from '../commands/balance.command';
import SendCommand from '../commands/send.command';
import WithdrawCommand from '../commands/withdraw.command';
import HelpCommand from '../commands/help.command';
import ProfileCommand from '../commands/profile.command';
import KycStatusCommand from '../commands/auth/status.command';
import { setupHandlers } from '../handlers'; // Adjust path as needed

export class Bot {
  public bot: Telegraf<SessionContext>;
  private commands: any[]; // Array of command instances

  constructor() {
    this.bot = new Telegraf<SessionContext>(botConfig.token);
    this.commands = [
      new StartCommand(),
      new LoginCommand({ authService }),
      new ProfileCommand({ authService, keyboards }),
      new KycStatusCommand({ authService, keyboards }),
      new BalanceCommand({ walletService, keyboards, formatters }),
      new SendCommand({ transferService, keyboards, formatters }),
      new WithdrawCommand({ transferService, keyboards, formatters }),
      new HelpCommand(),
    ];
    this.setupBotInfo();
    this.setupMiddleware();
    this.registerCommands();
    this.setupHandlers();
  }

  private async setupBotInfo() {
    const botInfo = await this.bot.telegram.getMe();
    this.bot.botInfo = botInfo;
  }

  private setupMiddleware() {
    this.bot.use(sessionMiddleware);
    this.bot.use(loggingMiddleware);
  }

  private registerCommands() {
    // Register each command with the bot
    this.commands.forEach((cmd) => {
      this.bot.command(cmd.command, (ctx: SessionContext) => cmd.handle(ctx));
    });

    this.bot.telegram.setMyCommands(
      this.commands.map((cmd) => ({
        command: cmd.command,
        description: cmd.description,
      }))
    ).then(() => {
      console.log('Bot commands registered with Telegram');
    });
  }

  private setupHandlers() {
    setupHandlers(this.bot, this.commands); // Pass the commands array
  }

  public launch() {
    this.bot.launch().then(() => {
      console.log('Bot is running...');
    });

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

export const bot = new Bot();