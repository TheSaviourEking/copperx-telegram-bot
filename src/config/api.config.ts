import { ApiConfig } from "../../global";

const apiConfig: ApiConfig = {
    baseUrl: process.env.API_BASE_URL || 'https://income-api.copperx.io',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    endpoints: {
        auth: {
            requestOtp: '/api/auth/email-otp/request',
            authenticate: '/api/auth/email-otp/authenticate',
            me: '/api/auth/me'
        },
        wallet: {
            list: '/api/wallets',
            balances: '/api/wallets/balances',
            default: '/api/wallets/default'
        },
        kyc: {
            list: '/api/kyc'
        },
        transfer: { send: '/transfer/send' },
        transactions: { list: '/transactions', details: '/transactions' },
        // ...other endpoints
    }
};

export default apiConfig;