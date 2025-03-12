import bot from './bot';
import Pusher from 'pusher';
import { pusherAuth } from './api';
import dotenv from 'dotenv';
dotenv.config();

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
});

bot.launch().then(() => console.log('Bot started'));

// Pusher setup (simplified - requires organizationId from profile)
bot.on('message', async (ctx) => {
    const session = sessions[ctx.chat.id];
    if (!session?.token) return;

    const profile = await getProfile(session.token);
    const organizationId = profile.data.organizationId;
    const channel = pusher.subscribe(`private-org-${organizationId}`);

    channel.bind('deposit', (data) => {
        ctx.reply(`💰 *New Deposit Received*\n${data.amount} USDC deposited on Solana`);
    });
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));