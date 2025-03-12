import { Telegraf, Markup } from 'telegraf';
import { login, getProfile, getWallets, getBalances, sendTransfer, withdrawToWallet, getTransfers } from './api';
import Pusher from 'pusher';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const sessions: { [chatId: number]: UserSession } = {};

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
});

// Start command
bot.start((ctx) => {
    ctx.reply('Welcome to Copperx Bot! Use /login to authenticate.', Markup.keyboard(['/login']).resize());
});

// Login flow
bot.command('login', (ctx) => {
    ctx.reply('Please enter your email:');
    bot.on('text', async (ctx) => {
        const email = ctx.message.text;
        try {
            await login(email, ''); // Request OTP
            ctx.reply('Enter the OTP sent to your email:');
            bot.on('text', async (ctx) => {
                const otp = ctx.message.text;
                try {
                    const token = await login(email, otp);
                    sessions[ctx.chat.id] = { token };
                    ctx.reply('Logged in successfully!', Markup.keyboard(['/balance', '/send', '/withdraw', '/history']).resize());
                } catch (error) {
                    ctx.reply(error.message);
                }
            });
        } catch (error) {
            ctx.reply(error.message);
        }
    });
});

// Balance command
bot.command('balance', async (ctx) => {
    const session = sessions[ctx.chat.id];
    if (!session?.token) return ctx.reply('Please /login first.');
    try {
        const balances = await getBalances(session.token);
        const message = balances.map(b => `${b.amount} ${b.currency} (${b.walletId})`).join('\n');
        ctx.reply(`Your balances:\n${message || 'No balances found.'}`);
    } catch (error) {
        ctx.reply('Error fetching balances: ' + error.message);
    }
});

// Send funds
bot.command('send', (ctx) => {
    const session = sessions[ctx.chat.id];
    if (!session?.token) return ctx.reply('Please /login first.');
    ctx.reply('Enter recipient email and amount (e.g., user@example.com 10):');
    bot.on('text', async (ctx) => {
        const [email, amount] = ctx.message.text.split(' ');
        try {
            await sendTransfer(session.token, email, amount);
            ctx.reply(`Sent ${amount} USDC to ${email}`);
        } catch (error) {
            ctx.reply('Transfer failed: ' + error.message);
        }
    });
});

// Withdraw funds
bot.command('withdraw', (ctx) => {
    const session = sessions[ctx.chat.id];
    if (!session?.token) return ctx.reply('Please /login first.');
    ctx.reply('Enter wallet address and amount (e.g., 0x123... 10):');
    bot.on('text', async (ctx) => {
        const [address, amount] = ctx.message.text.split(' ');
        try {
            await withdrawToWallet(session.token, address, amount);
            ctx.reply(`Withdrawn ${amount} USDC to ${address}`);
        } catch (error) {
            ctx.reply('Withdrawal failed: ' + error.message);
        }
    });
});

// Transaction history
bot.command('history', async (ctx) => {
    const session = sessions[ctx.chat.id];
    if (!session?.token) return ctx.reply('Please /login first.');
    try {
        const transfers = await getTransfers(session.token);
        const message = transfers.map(t => `${t.amount} USDC - ${t.status} - ${t.recipient || 'N/A'} (${new Date(t.createdAt).toLocaleString()})`).join('\n');
        ctx.reply(`Last 10 transactions:\n${message || 'No transactions found.'}`);
    } catch (error) {
        ctx.reply('Error fetching history: ' + error.message);
    }
});

// Help command
bot.command('help', (ctx) => {
    ctx.reply(
        'Commands:\n' +
        '/login - Authenticate with Copperx\n' +
        '/balance - Check wallet balances\n' +
        '/send - Send USDC to an email\n' +
        '/withdraw - Withdraw USDC to a wallet\n' +
        '/history - View last 10 transactions\n' +
        'Support: https://t.me/copperxcommunity/2183'
    );
});

export default bot;