// @ts-nocheck

import { Telegraf } from 'telegraf';
import { SessionContext } from '../../global';
import authService from '../services/auth.service';
import transferService from '../services/transfer.service';
import keyboards from '../ui/keyboards';
import { callbackHandler } from './callback.handler';
import LoginCommand from '../commands/login.command';
import textHandler from './text.handler';

export function setupHandlers(bot: Telegraf<SessionContext>, commands: any[]) {
    // Initialize LoginCommand with its dependencye });

    const loginCommand = commands.find((cmd) => cmd.command === 'login');
    const transferCommand = commands.find((cmd) => cmd.command === 'transfer');
    const withdrawCommand = commands.find((cmd) => cmd.command === 'withdraw');
    const balanceCommand = commands.find((cmd) => cmd.command === 'balance');
    const profileCommand = commands.find((cmd) => cmd.command === 'profile');
    const kycStatusCommand = commands.find((cmd) => cmd.command === 'kyc_status');
    const helpCommand = commands.find((cmd) => cmd.command === 'help');
    const startCommand = commands.find((cmd) => cmd.command === 'start');

    // Existing callback handler (if needed)
    callbackHandler(bot);
    textHandler(bot)

    // // Email input handler using LoginCommand
    // bot.hears(/^\S+@\S+\.\S+$/, async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId) return;

    //     // Check if waiting for email input from LoginCommand
    //     if (ctx.session.waitingFor === 'email') {
    //         const email = ctx.message.text;
    //         await loginCommand.handleEmailInput(ctx, email);
    //     }
    // });

    // // OTP input handler using LoginCommand
    // bot.hears(/^\d{6}$/, async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId) return;

    //     // Check if waiting for verification code from LoginCommand
    //     if (ctx.session.waitingFor === 'verification_code') {
    //         const code = ctx.message.text;
    //         await loginCommand.handleVerificationCode(ctx, code);
    //     }
    // });

    // // PROFILE COMMAND HANDLER
    // bot.on('callback_query', (ctx) => {
    //     console.log('in hear')
    //     console.log('Callback query:', ctx.callbackQuery);
    //     const callbackData = ctx.callbackQuery.data;

    //     switch (callbackData) {
    //         case 'edit_profile':
    //             // Handle edit profile logic
    //             ctx.reply('Please enter your new profile information');
    //             break;
    //         case 'security_settings':
    //             // Handle security settings logic
    //             ctx.reply('Please select a security setting to update');
    //             break;
    //         case 'notification_settings':
    //             // Handle notification settings logic
    //             ctx.reply('Please select a notification setting to update');
    //             break;
    //         case 'wallet_menu':
    //             // Handle wallet menu logic
    //             ctx.reply('Please select a wallet option');
    //             break;
    //         default:
    //             ctx.reply('Invalid callback data');
    //     }
    // });

    // still trying to handle profile command
    // bot.on('callback_query', (query) => {
    //     if (query.data === 'edit_profile') {
    //         // Handle edit profile action
    //         console.log('edit profile second button')
    //     } else if (query.data === 'security_settings') {
    //         // Handle security settings action
    //     }
    //     // etc.
    // });

    // Inline keyboard handlers for send/withdraw (unchanged)
    // bot.action(/wallet:(.+)/, async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId || !ctx.session.data?.action) return;

    //     const walletId = ctx.match[1];
    //     ctx.session.data.selectedWallet = walletId;
    //     ctx.session.data.step = 2;

    //     const action = ctx.session.data.action;
    //     await ctx.reply(
    //         action === 'send'
    //             ? 'Enter the recipient\'s email address:'
    //             : 'Enter the external wallet address:'
    //     );
    // });

    // bot.hears(/.+/, async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 2) return;

    //     const input = ctx.message.text;
    //     const { action, selectedWallet } = ctx.session.data;

    //     if (action === 'send') {
    //         ctx.session.data.recipient = input;
    //         ctx.session.data.step = 3;
    //         await ctx.reply('Enter the amount to send (in USDC):');
    //     } else if (action === 'withdraw') {
    //         ctx.session.data.address = input;
    //         ctx.session.data.step = 3;
    //         await ctx.reply('Enter the amount to withdraw (in USDC):');
    //     }
    // });

    // bot.hears(/^\d+(\.\d+)?$/, async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 3) return;

    //     const amount = ctx.message.text;
    //     const { action, selectedWallet, recipient, address } = ctx.session.data;

    //     if (action === 'send') {
    //         await ctx.reply(
    //             `Send ${amount} USDC to ${recipient}?`,
    //             keyboards.confirmTransfer(amount, recipient)
    //         );
    //     } else if (action === 'withdraw') {
    //         await ctx.reply(
    //             `Withdraw ${amount} USDC to ${address}?`,
    //             keyboards.confirmTransfer(amount, address)
    //         );
    //     }
    //     ctx.session.data.amount = amount;
    //     ctx.session.data.step = 4;
    // });

    // bot.action('confirm', async (ctx) => {
    //     const userId = ctx.from?.id;
    //     if (!userId || !ctx.session.data?.step || ctx.session.data.step !== 4) return;

    //     const { action, selectedWallet, recipient, address, amount } = ctx.session.data;
    //     try {
    //         if (action === 'send') {
    //             const tx = await transferService.sendFunds(userId, recipient, selectedWallet, amount);
    //             await ctx.reply(`Sent ${amount} USDC to ${recipient}! Tx ID: ${tx.id}`);
    //         } else if (action === 'withdraw') {
    //             const tx = await transferService.withdrawFunds(userId, selectedWallet, address, amount);
    //             await ctx.reply(`Withdrawn ${amount} USDC to ${address}! Tx ID: ${tx.id}`);
    //         }
    //         delete ctx.session.data; // Reset state
    //     } catch (error) {
    //         await ctx.reply(`Error: ${error.message}`);
    //     }
    // });

    // bot.action('cancel', async (ctx) => {
    //     delete ctx.session.data;
    //     await ctx.reply('Action cancelled.');
    // });
}