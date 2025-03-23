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

export class Bot {
  public bot: Telegraf<SessionContext>;

  constructor() {
    this.bot = new Telegraf<SessionContext>(botConfig.token);
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
    // Initialize commands with their dependencies (your commandRegistry logic)
    const commands = [
      new StartCommand(),
      new LoginCommand({ authService }),
      new BalanceCommand({ walletService, keyboards, formatters }),
      new SendCommand({ transferService, keyboards, formatters }),
      new WithdrawCommand({ transferService, keyboards, formatters }),
      new HelpCommand(),
    ];

    // Register each command with the bot
    commands.forEach((cmd) => {
      this.bot.command(cmd.command, (ctx: SessionContext) => cmd.handle(ctx));
    });

    // Optionally set the Telegram command menu
    this.bot.telegram.setMyCommands(
      commands.map((cmd) => ({
        command: cmd.command,
        description: cmd.description,
      }))
    ).then(() => {
      console.log('Bot commands registered with Telegram');
    });
  }

  private setupHandlers() {
    // Email input handler for login flow
    this.bot.hears(/^\S+@\S+\.\S+$/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      if (!ctx.session.pendingEmail) {
        try {
          await authService.requestOtp(ctx.message.text, userId);
          ctx.reply('Enter the 6-digit OTP sent to your email.');
        } catch (error) {
          ctx.reply(error.message);
        }
      }
    });

    // OTP input handler
    this.bot.hears(/^\d{6}$/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || !ctx.session.pendingEmail) return;
      try {
        const profile = await authService.authenticate(ctx.session.pendingEmail, ctx.message.text, userId);
        if (profile.firstName && profile.lastName) {
          ctx.reply(`Login successful! Welcome, ${profile.firstName} ${profile.lastName} || user`);
        } else {
          ctx.reply('Login successful! Welcome, user'); // Fallback message
        }
      } catch (error) {
        ctx.reply(error.message);
      }
    });

    // Inline keyboard handlers for send/withdraw (from previous example)
    this.bot.action(/wallet:(.+)/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || !ctx.session.data?.action) return;

      const walletId = ctx.match[1];
      ctx.session.data.selectedWallet = walletId;
      ctx.session.data.step = 2;

      const action = ctx.session.data.action;
      await ctx.reply(
        action === 'send'
          ? 'Enter the recipient\'s email address:'
          : 'Enter the external wallet address:'
      );
    });

    this.bot.hears(/.+/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 2) return;

      const input = ctx.message.text;
      const { action, selectedWallet } = ctx.session.data;

      if (action === 'send') {
        ctx.session.data.recipient = input;
        ctx.session.data.step = 3;
        await ctx.reply('Enter the amount to send (in USDC):');
      } else if (action === 'withdraw') {
        ctx.session.data.address = input;
        ctx.session.data.step = 3;
        await ctx.reply('Enter the amount to withdraw (in USDC):');
      }
    });

    this.bot.hears(/^\d+(\.\d+)?$/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 3) return;

      const amount = ctx.message.text;
      const { action, selectedWallet, recipient, address } = ctx.session.data;

      if (action === 'send') {
        await ctx.reply(
          `Send ${amount} USDC to ${recipient}?`,
          keyboards.confirmTransfer(amount, recipient)
        );
      } else if (action === 'withdraw') {
        await ctx.reply(
          `Withdraw ${amount} USDC to ${address}?`,
          keyboards.confirmTransfer(amount, address)
        );
      }
      ctx.session.data.amount = amount;
      ctx.session.data.step = 4;
    });

    this.bot.action('confirm', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 4) return;

      const { action, selectedWallet, recipient, address, amount } = ctx.session.data;
      try {
        if (action === 'send') {
          const tx = await transferService.sendFunds(userId, recipient, selectedWallet, amount);
          await ctx.reply(`Sent ${amount} USDC to ${recipient}! Tx ID: ${tx.id}`);
        } else if (action === 'withdraw') {
          const tx = await transferService.withdrawFunds(userId, selectedWallet, address, amount);
          await ctx.reply(`Withdrawn ${amount} USDC to ${address}! Tx ID: ${tx.id}`);
        }
        delete ctx.session.data; // Reset state
      } catch (error) {
        await ctx.reply(`Error: ${error.message}`);
      }
    });

    this.bot.action('cancel', async (ctx) => {
      delete ctx.session.data;
      await ctx.reply('Action cancelled.');
    });
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