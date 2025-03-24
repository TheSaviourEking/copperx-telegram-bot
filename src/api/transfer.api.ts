import ApiClient from './client';
import config from '../config';

interface TransferApiOptions {
    baseUrl: string;
    timeout: number;
}

class TransferApi extends ApiClient {
    private endpoints: any;

    constructor(options: TransferApiOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        super(options);
        this.endpoints = config?.api?.default?.endpoints?.transfer;
        if (!this.endpoints) {
            throw new Error('Transfer API endpoints not configured in config.api.default.endpoints.transfer');
        }
    }

    /**
     * Send funds from a wallet to a recipient address
     * @param token Authentication token
     * @param walletId Source wallet UUID
     * @param amount Amount to send (as a string, in smallest unit, e.g., wei)
     * @param recipient Recipient blockchain address
     * @returns Promise resolving to the API response data (e.g., transaction details)
     * @throws Error if the request fails (handled by ApiClient)
     */
    async sendFunds(token: string, walletId: string, amount: string, recipient: string) {
        if (!token) throw new Error('Authentication token is required');
        const response = await this.post(
            this.endpoints.send,
            { walletId, amount, recipient },
            token
        );
        return response.data;
    }

    /**
     * Get transaction history for the authenticated user
     * @param token Authentication token
     * @param limit Maximum number of transactions to return (default: 10)
     * @param offset Offset for pagination (default: 0)
     * @returns Promise resolving to an array of transaction objects
     * @throws Error if the request fails (handled by ApiClient)
     */
    async getTransactions(token: string, limit: number = 10, offset: number = 0) {
        if (!token) throw new Error('Authentication token is required');
        const response = await this.get(
            `${this.endpoints.transactions}?limit=${limit}&offset=${offset}`,
            token
        );
        return response.data;
    }
}

export default TransferApi;