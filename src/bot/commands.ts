// src/bot/commands.ts
import { Telegraf, Markup } from 'telegraf';
import { requestEmailOTP, authenticateWithOTP, getUserProfile, getKYCStatus } from '../services/auth';
import { getWalletBalances, getDefaultWallet, setDefaultWallet, getWallets } from '../services/wallet';
import { sendEmailTransfer, sendWalletTransfer, bankWithdrawal, getTransferHistory } from '../services/transfer';
import { mainMenuKeyboard, cancelKeyboard, confirmationKeyboard, backToMainMenuKeyboard } from './keyboards';
import { getIntroMessage } from '../lib/utils';

export function registerCommands(bot: Telegraf<any>) {
    // Start command
    bot.start((ctx) => {
        // Reset session data
        ctx.session = {};

        const introMessage = getIntroMessage();

        return ctx.replyWithMarkdownV2(introMessage, Markup.keyboard(['/login', '/help']).resize())

        return ctx.reply(
            '👋 Welcome to Copperx Payout Bot!\n\n' +
            'This bot allows you to manage your Copperx wallet and make transactions directly from Telegram.\n\n' +
            'Please use /login to get started or /help to see available commands.',
            Markup.keyboard([
                ['/login', '/help'],
            ]).resize()
        );
    });

    // Help command
    bot.help((ctx) => {
        return ctx.reply(
            '🤖 *Copperx Payout Bot Commands*\n\n' +
            '*/login* - Authenticate with your Copperx account\n' +
            '*/balance* - View your wallet balances\n' +
            '*/send* - Send funds to email or wallet\n' +
            '*/withdraw* - Withdraw funds to bank account\n' +
            '*/history* - View transaction history\n' +
            '*/profile* - View your profile information\n' +
            '*/logout* - Log out from your account\n\n' +
            'Need help? Contact support: https://t.me/copperxcommunity/2183',
            { parse_mode: 'Markdown' }
        );
    });

    // Login command
    bot.command('login', async (ctx) => {
        ctx.session.step = 'awaiting_email';
        return ctx.reply(
            '🔐 *Login to Copperx*\n\n' +
            'Please enter your email address:',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle email input
    bot.hears(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, async (ctx) => {
        if (ctx.session.step !== 'awaiting_email') return;

        const email = ctx.message.text;
        ctx.session.tempData = { email };

        // Request OTP
        const otpSent = await requestEmailOTP(email);

        if (otpSent) {
            ctx.session.step = 'awaiting_otp';
            return ctx.reply(
                '✉️ *OTP Sent*\n\n' +
                `We've sent a one-time password to ${email}.\n` +
                'Please enter the OTP to continue:',
                {
                    parse_mode: 'Markdown',
                    ...cancelKeyboard
                }
            );
        } else {
            ctx.session.step = undefined;
            return ctx.reply(
                '❌ *Failed to send OTP*\n\n' +
                'Could not send OTP to this email. Please check if it\'s correct and try again.',
                {
                    parse_mode: 'Markdown'
                }
            );
        }
    });

    // Handle OTP input
    bot.hears(/^\d{6}$/, async (ctx) => {
        if (ctx.session.step !== 'awaiting_otp') return;

        const otp = ctx.message.text;
        const email = ctx.session.tempData.email;

        // Authenticate with OTP
        const authResult = await authenticateWithOTP(email, otp);

        if (authResult.success) {
            // Save auth token in session
            ctx.session.authToken = authResult.token;

            // Get user profile
            const profileResult = await getUserProfile(authResult.token);

            if (profileResult.success) {
                ctx.session.userId = profileResult.profile.id;
                ctx.session.organizationId = profileResult.profile.organizationId;

                // Clear temporary data and step
                ctx.session.tempData = undefined;
                ctx.session.step = undefined;

                return ctx.reply(
                    '✅ *Login Successful*\n\n' +
                    `Welcome ${profileResult.profile.name || 'to Copperx'}!\n\n` +
                    'You can now access your wallet and perform transactions.',
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            } else {
                // Clear temporary data and step
                ctx.session.tempData = undefined;
                ctx.session.step = undefined;

                return ctx.reply(
                    '✅ *Login Successful*\n\n' +
                    'Welcome to Copperx!\n\n' +
                    'You can now access your wallet and perform transactions.',
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            }
        } else {
            return ctx.reply(
                '❌ *Authentication Failed*\n\n' +
                'The OTP you entered is incorrect or expired. Please try again.',
                {
                    parse_mode: 'Markdown'
                }
            );
        }
    });

    // Balance command
    bot.command('balance', async (ctx) => {
        // Get wallet balances
        const balancesResult = await getWalletBalances(ctx.session.authToken);

        if (!balancesResult.success) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to fetch your wallet balances. Please try again later.',
                { parse_mode: 'Markdown' }
            );
        }

        // Get default wallet
        const defaultWalletResult = await getDefaultWallet(ctx.session.authToken);
        let defaultWalletId = null;

        if (defaultWalletResult.success) {
            defaultWalletId = defaultWalletResult.defaultWallet.id;
        }

        // Format balances message
        let message = '💰 *Your Wallet Balances*\n\n';

        if (balancesResult.balances.length === 0) {
            message += 'You don\'t have any wallet balances yet.';
        } else {
            balancesResult.balances.forEach((balance: any) => {
                const isDefault = balance.id === defaultWalletId ? ' (Default)' : '';
                message += `*${balance.network}${isDefault}*\n`;
                message += `Address: \`${balance.address}\`\n`;
                message += `Balance: ${balance.balance} ${balance.symbol}\n\n`;
            });

            // Add option to set default wallet if multiple wallets exist
            if (balancesResult.balances.length > 1) {
                message += 'You can set your default wallet using /setdefault';
            }
        }

        return ctx.reply(message, {
            parse_mode: 'Markdown',
            ...mainMenuKeyboard
        });
    });

    // Set default wallet command
    bot.command('setdefault', async (ctx) => {
        // Get wallets
        const walletsResult = await getWallets(ctx.session.authToken);

        if (!walletsResult.success || walletsResult.wallets.length <= 1) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'You need multiple wallets to set a default wallet.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        }

        // Create keyboard with wallet options
        const walletButtons = walletsResult.wallets.map((wallet: any) => {
            return [Markup.button.callback(`${wallet.network}: ${wallet.address.substring(0, 10)}...`, `set_default_${wallet.id}`)];
        });

        return ctx.reply(
            '⚙️ *Set Default Wallet*\n\n' +
            'Please select your default wallet:',
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    ...walletButtons,
                    [Markup.button.callback('❌ Cancel', 'cancel_set_default')]
                ])
            }
        );
    });

    // Handle default wallet selection
    bot.action(/^set_default_(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();

        const walletId = ctx.match[1];

        // Set default wallet
        const result = await setDefaultWallet(ctx.session.authToken, walletId);

        if (result.success) {
            return ctx.reply(
                '✅ *Default Wallet Updated*\n\n' +
                'Your default wallet has been updated successfully.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        } else {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to update default wallet. Please try again later.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        }
    });

    // Cancel set default
    bot.action('cancel_set_default', async (ctx) => {
        await ctx.answerCbQuery();

        return ctx.reply(
            '🔄 Operation cancelled.',
            mainMenuKeyboard
        );
    });

    // Send command
    bot.command('send', async (ctx) => {
        // Get wallet balances first to check if user has funds
        const balancesResult = await getWalletBalances(ctx.session.authToken);

        if (!balancesResult.success || balancesResult.balances.length === 0) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'You don\'t have any wallet balances or failed to fetch them. Please try again later.',
                { parse_mode: 'Markdown' }
            );
        }

        // Show send options
        ctx.session.step = 'send_options';

        return ctx.reply(
            '💸 *Send Funds*\n\n' +
            'How would you like to send funds?',
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📧 Send to Email', 'send_email')],
                    [Markup.button.callback('👛 Send to Wallet', 'send_wallet')],
                    [Markup.button.callback('❌ Cancel', 'cancel_send')]
                ])
            }
        );
    });

    // Handle send to email
    bot.action('send_email', async (ctx) => {
        await ctx.answerCbQuery();

        ctx.session.step = 'send_email_address';
        ctx.session.tempData = { type: 'email' };

        return ctx.reply(
            '📧 *Send to Email*\n\n' +
            'Please enter the recipient\'s email address:',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle send to wallet
    bot.action('send_wallet', async (ctx) => {
        await ctx.answerCbQuery();

        ctx.session.step = 'send_wallet_network';
        ctx.session.tempData = { type: 'wallet' };

        // Get wallet balances to show available networks
        const balancesResult = await getWalletBalances(ctx.session.authToken);

        if (!balancesResult.success) {
            ctx.session.step = undefined;
            ctx.session.tempData = undefined;

            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to fetch your wallet balances. Please try again later.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        }

        // Create keyboard with available networks
        const networkButtons = balancesResult.balances.map((balance: any) => {
            return [Markup.button.callback(balance.network, `network_${balance.network}`)];
        });

        return ctx.reply(
            '👛 *Send to Wallet*\n\n' +
            'Please select the network:',
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    ...networkButtons,
                    [Markup.button.callback('❌ Cancel', 'cancel_send')]
                ])
            }
        );
    });

    // Handle network selection
    bot.action(/^network_(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();

        const network = ctx.match[1];
        ctx.session.tempData.network = network;
        ctx.session.step = 'send_wallet_address';

        return ctx.reply(
            `🌐 *Selected Network: ${network}*\n\n` +
            'Please enter the recipient\'s wallet address:',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle wallet address input
    bot.hears(/^[a-zA-Z0-9]{30,}$/, async (ctx) => {
        if (ctx.session.step !== 'send_wallet_address') return;

        const address = ctx.message.text;
        ctx.session.tempData.address = address;
        ctx.session.step = 'send_amount';

        return ctx.reply(
            '💰 *Amount*\n\n' +
            'Please enter the amount to send (in USDC):',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle email recipient input
    bot.hears(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, async (ctx) => {
        if (ctx.session.step !== 'send_email_address') return;

        const email = ctx.message.text;
        ctx.session.tempData.email = email;
        ctx.session.step = 'send_amount';

        return ctx.reply(
            '💰 *Amount*\n\n' +
            'Please enter the amount to send (in USDC):',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle amount input for sends
    bot.hears(/^\d+(\.\d+)?$/, async (ctx) => {
        if (ctx.session.step !== 'send_amount') return;

        const amount = parseFloat(ctx.message.text);

        // Basic validation
        if (amount <= 0) {
            return ctx.reply(
                '❌ *Invalid Amount*\n\n' +
                'Please enter an amount greater than 0.',
                { parse_mode: 'Markdown' }
            );
        }

        ctx.session.tempData.amount = amount;

        // Show confirmation
        let confirmMessage = '🔍 *Please Confirm*\n\n';

        if (ctx.session.tempData.type === 'email') {
            confirmMessage += `Send ${amount} USDC to ${ctx.session.tempData.email}?`;
        } else {
            confirmMessage += `Send ${amount} USDC to address ${ctx.session.tempData.address} on ${ctx.session.tempData.network} network?`;
        }

        ctx.session.step = 'confirm_send';

        return ctx.reply(
            confirmMessage,
            {
                parse_mode: 'Markdown',
                ...confirmationKeyboard
            }
        );
    });

    // Handle confirm action
    bot.action('confirm', async (ctx) => {
        await ctx.answerCbQuery();

        if (ctx.session.step !== 'confirm_send' && ctx.session.step !== 'confirm_withdraw') return;

        if (ctx.session.step === 'confirm_send') {
            // Process send transaction
            let result;

            if (ctx.session.tempData.type === 'email') {
                // Email transfer
                result = await sendEmailTransfer(ctx.session.authToken, {
                    email: ctx.session.tempData.email,
                    amount: ctx.session.tempData.amount,
                    network: ctx.session.tempData.network // optional
                });
            } else {
                // Wallet transfer
                result = await sendWalletTransfer(ctx.session.authToken, {
                    address: ctx.session.tempData.address,
                    amount: ctx.session.tempData.amount,
                    network: ctx.session.tempData.network
                });
            }

            // Clear session data
            ctx.session.step = undefined;
            ctx.session.tempData = undefined;

            if (result.success) {
                return ctx.reply(
                    '✅ *Transfer Successful*\n\n' +
                    'Your transfer has been initiated successfully.\n\n' +
                    'You can check the status in your transaction history.',
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            } else {
                return ctx.reply(
                    '❌ *Transfer Failed*\n\n' +
                    `Error: ${result.message || 'Unknown error'}`,
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            }
        } else if (ctx.session.step === 'confirm_withdraw') {
            // Process withdrawal
            const result = await bankWithdrawal(ctx.session.authToken, {
                amount: ctx.session.tempData.amount,
                network: ctx.session.tempData.network // optional
            });

            // Clear session data
            ctx.session.step = undefined;
            ctx.session.tempData = undefined;

            if (result.success) {
                return ctx.reply(
                    '✅ *Withdrawal Initiated*\n\n' +
                    'Your bank withdrawal has been initiated successfully.\n\n' +
                    'You can check the status in your transaction history.',
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            } else {
                return ctx.reply(
                    '❌ *Withdrawal Failed*\n\n' +
                    `Error: ${result.message || 'Unknown error'}`,
                    {
                        parse_mode: 'Markdown',
                        ...mainMenuKeyboard
                    }
                );
            }
        }
    });

    // Handle cancel action
    bot.action('cancel', async (ctx) => {
        await ctx.answerCbQuery();

        // Clear session data for current operation
        ctx.session.step = undefined;
        ctx.session.tempData = undefined;

        return ctx.reply(
            '🔄 Operation cancelled.',
            mainMenuKeyboard
        );
    });

    // Cancel send
    bot.action('cancel_send', async (ctx) => {
        await ctx.answerCbQuery();

        // Clear session data for current operation
        ctx.session.step = undefined;
        ctx.session.tempData = undefined;

        return ctx.reply(
            '🔄 Send operation cancelled.',
            mainMenuKeyboard
        );
    });

    // Withdraw command
    bot.command('withdraw', async (ctx) => {
        // Get wallet balances first to check if user has funds
        const balancesResult = await getWalletBalances(ctx.session.authToken);

        if (!balancesResult.success || balancesResult.balances.length === 0) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'You don\'t have any wallet balances or failed to fetch them. Please try again later.',
                { parse_mode: 'Markdown' }
            );
        }

        // Check KYC status
        const kycResult = await getKYCStatus(ctx.session.authToken);

        if (!kycResult.success || !kycResult.kycStatus.isApproved) {
            return ctx.reply(
                '❌ *KYC Required*\n\n' +
                'You need to complete KYC verification to withdraw funds to your bank account.\n\n' +
                'Please visit the Copperx platform to complete your verification.',
                { parse_mode: 'Markdown' }
            );
        }

        // Set up withdrawal
        ctx.session.step = 'withdraw_amount';
        ctx.session.tempData = { type: 'bank' };

        return ctx.reply(
            '🏦 *Bank Withdrawal*\n\n' +
            'Please enter the amount you want to withdraw (in USDC):',
            {
                parse_mode: 'Markdown',
                ...cancelKeyboard
            }
        );
    });

    // Handle withdraw amount input
    bot.hears(/^\d+(\.\d+)?$/, async (ctx) => {
        if (ctx.session.step !== 'withdraw_amount') return;

        const amount = parseFloat(ctx.message.text);

        // Basic validation
        if (amount <= 0) {
            return ctx.reply(
                '❌ *Invalid Amount*\n\n' +
                'Please enter an amount greater than 0.',
                { parse_mode: 'Markdown' }
            );
        }

        ctx.session.tempData.amount = amount;

        // Get wallet balances to check available funds
        const balancesResult = await getWalletBalances(ctx.session.authToken);

        if (!balancesResult.success) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to fetch your wallet balances. Please try again later.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        }

        // Check if there are sufficient funds
        let hasSufficientFunds = false;
        for (const balance of balancesResult.balances) {
            if (parseFloat(balance.balance) >= amount) {
                hasSufficientFunds = true;
                ctx.session.tempData.network = balance.network;
                break;
            }
        }

        if (!hasSufficientFunds) {
            ctx.session.step = undefined;
            ctx.session.tempData = undefined;

            return ctx.reply(
                '❌ *Insufficient Funds*\n\n' +
                'You don\'t have enough funds to complete this withdrawal.',
                {
                    parse_mode: 'Markdown',
                    ...mainMenuKeyboard
                }
            );
        }

        // Show confirmation
        ctx.session.step = 'confirm_withdraw';

        return ctx.reply(
            '🔍 *Please Confirm Withdrawal*\n\n' +
            `Withdraw ${amount} USDC to your bank account?\n\n` +
            'Note: Bank withdrawals are subject to processing times and may take 1-3 business days.',
            {
                parse_mode: 'Markdown',
                ...confirmationKeyboard
            }
        );
    });

    // History command
    bot.command('history', async (ctx) => {
        // Get transaction history
        const historyResult = await getTransferHistory(ctx.session.authToken);

        if (!historyResult.success) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to fetch your transaction history. Please try again later.',
                { parse_mode: 'Markdown' }
            );
        }

        // Format history message
        let message = '📜 *Transaction History*\n\n';

        if (historyResult.transfers.length === 0) {
            message += 'You don\'t have any transactions yet.';
        } else {
            // Show last 10 transactions
            historyResult.transfers.slice(0, 10).forEach((transfer: any, index: number) => {
                const date = new Date(transfer.createdAt).toLocaleDateString();
                const time = new Date(transfer.createdAt).toLocaleTimeString();

                message += `*${index + 1}. ${transfer.type}*\n`;
                message += `Date: ${date} ${time}\n`;
                message += `Amount: ${transfer.amount} ${transfer.symbol || 'USDC'}\n`;
                message += `Status: ${transfer.status}\n\n`;
            });

            if (historyResult.total > 10) {
                message += `Showing 10 of ${historyResult.total} transactions.`;
            }
        }

        return ctx.reply(message, {
            parse_mode: 'Markdown',
            ...mainMenuKeyboard
        });
    });

    // Profile command
    bot.command('profile', async (ctx) => {
        // Get user profile
        const profileResult = await getUserProfile(ctx.session.authToken);

        if (!profileResult.success) {
            return ctx.reply(
                '❌ *Error*\n\n' +
                'Failed to fetch your profile. Please try again later.',
                { parse_mode: 'Markdown' }
            );
        }

        // Get KYC status
        const kycResult = await getKYCStatus(ctx.session.authToken);

        // Format profile message
        const profile = profileResult.profile;
        let message = '👤 *Your Profile*\n\n';

        message += `Name: ${profile.name || 'Not provided'}\n`;
        message += `Email: ${profile.email}\n`;
        message += `Organization: ${profile.organizationName || 'Not provided'}\n`;

        if (kycResult.success) {
            message += `KYC Status: ${kycResult.kycStatus.isApproved ? '✅ Approved' : '⏳ Pending'}\n`;
        }

        return ctx.reply(message, {
            parse_mode: 'Markdown',
            ...mainMenuKeyboard
        });
    });

    // Cancel command
    bot.command('cancel', (ctx) => {
        // Clear session data for current operation
        ctx.session.step = undefined;
        ctx.session.tempData = undefined;

        return ctx.reply(
            '🔄 Operation cancelled.\n\n' +
            'What would you like to do next?',
            mainMenuKeyboard
        );
    });

    // Logout command
    bot.command('logout', (ctx) => {
        // Clear all session data
        ctx.session = {};

        return ctx.reply(
            '👋 *Logged Out Successfully*\n\n' +
            'You have been logged out from your Copperx account.\n' +
            'Use /login to authenticate again.',
            {
                parse_mode: 'Markdown',
                ...Markup.keyboard([
                    ['/login', '/help']
                ]).resize()
            }
        );
    });
}