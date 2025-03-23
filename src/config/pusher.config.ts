import { PusherConfig } from "../../global";

const pusherConfig: PusherConfig = {
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
    channels: {
        userPrefix: 'private-user-',
        walletUpdates: 'wallet-updates',
        transactionUpdates: 'transaction-updates',
        systemAnnouncements: 'system-announcements'
    },
    events: {
        balanceUpdate: 'balance-update',
        transactionStatus: 'transaction-status',
        newTransaction: 'new-transaction',
        authSuccess: 'auth-success',
        systemNotification: 'system-notification'
    }
};

export default pusherConfig;