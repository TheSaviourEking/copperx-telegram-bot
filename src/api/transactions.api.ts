import ApiClient from './client';
import config from '../config';
import TransferApi from './transfer.api';

interface TransactionsApiOptions {
    baseUrl: string;
    timeout: number;
}

class TransactionsApi extends TransferApi {
    private transferEndpoints: any;

    constructor(options: TransactionsApiOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        super(options);
        console.log(config?.api?.default?.endpoints?.transactions, 'config?.api?.default?.endpoints?.transactions==================>')
        this.transferEndpoints = config?.api?.default?.endpoints?.transactions;
        if (!this.transferEndpoints) {
            throw new Error('Transactions API endpoints not configured in config.api.default.endpoints.transactions');
        }
        console.log(this.transferEndpoints, 'this==================>')
    }

    /**
     * Get transaction history for the authenticated user
     * @param token Authentication token
     * @param limit Maximum number of transactions to return (default: 10)
     * @param offset Offset for pagination (default: 0)
     * @param walletId Optional filter by wallet ID
     * @returns Promise resolving to an array of transaction objects
     * @throws Error if the request fails (handled by ApiClient)
     */
    async getTransactions(token: string, walletId?: string, limit: number = 10, offset: number = 0) {
        console.log('GOT to the transaction api')
        if (!token) throw new Error('Authentication token is required');
        let url = `${this.transferEndpoints.list}?limit=${limit}&offset=${offset}`;
        console.log(url, 'url==================>')
        if (walletId) {
            url += `&walletId=${encodeURIComponent(walletId)}`;
        }
        const response = await this.get(url, token);
        return response.data;
    }

    /**
     * Get details of a specific transaction
     * @param token Authentication token
     * @param transactionId Unique transaction ID
     * @returns Promise resolving to the transaction details object
     * @throws Error if the request fails (handled by ApiClient)
     */
    async getTransactionDetails(token: string, transactionId: string) {
        if (!token) throw new Error('Authentication token is required');
        if (!transactionId) throw new Error('Transaction ID is required');
        const response = await this.get(`${this.transferEndpoints.details}/${transactionId}`, token);
        return response.data;
    }
}

export default TransactionsApi;