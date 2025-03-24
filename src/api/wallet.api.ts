import ApiClient from './client';
import config from '../config';

interface WalletApiOptions {
    baseUrl: string;
    timeout: number;
}

class WalletApi extends ApiClient {
    private endpoints: any;

    constructor(options: WalletApiOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        super(options);
        this.endpoints = config?.api?.default?.endpoints?.wallet;
    }

    async getWallets(token?: string) {
        const response = await this.get(this.endpoints.list, token);
        return response.data;
    }

    async getBalances(token?: string) {
        const response = await this.get(this.endpoints.balances, token);
        return response.data;
    }

    async setDefaultWallet(token: string, walletId: any) {
        const response = await this.post(this.endpoints.default, { walletId }, token);
        return response.data;
    }
}

export default WalletApi;