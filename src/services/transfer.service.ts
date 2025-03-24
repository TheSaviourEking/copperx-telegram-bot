// @ts-nocheck

import { TransferService } from '../../global';
// import TransferApi from '../api/transfer.api';
import { sessionManager } from '../state/session';
import authService from './auth.service';
import walletService from './wallet.service';
import { logger } from '../utils/logger';
import TransferApi from '../api/transfer.api';
import TransactionsApi from '../api/transactions.api';

class TransferServiceImpl implements TransferService {
    private transferApi: TransferApi;
    private transactionApi: any

    constructor(transferApi: TransferApi) {
        this.transferApi = transferApi;
        this.transactionApi = transactionApi;
    }

    async getAvailableWallets(userId: number): Promise<any[]> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            // Get wallets with balances
            const wallets = await walletService.getWallets(userId);
            const balances = await walletService.getBalances(userId);

            // Filter wallets that have non-zero balances
            const walletsWithFunds = wallets.filter(wallet => {
                const balance = balances.find(b => b.walletId === wallet.id);
                return balance && parseFloat(balance.amount) > 0;
            });

            return walletsWithFunds.map(wallet => {
                const balance = balances.find(b => b.walletId === wallet.id);
                return {
                    ...wallet,
                    balance: balance ? balance.amount : '0',
                    currency: balance ? balance.currency : wallet.currency
                };
            });
        } catch (error) {
            logger.error('Failed to get available wallets', { userId, error: error.message });
            throw error;
        }
    }

    async sendFunds(userId: number, recipientId: string, walletId: string, amount: string): Promise<any> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            const result = await this.transferApi.sendFunds(token, {
                recipientId,
                walletId,
                amount
            });

            return result;
        } catch (error) {
            logger.error('Failed to send funds', { userId, recipientId, walletId, amount, error: error.message });
            throw error;
        }
    }

    async withdrawFunds(userId: number, walletId: string, address: string, amount: string, network?: string): Promise<any> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            const result = await this.transferApi.withdrawFunds(token, {
                walletId,
                address,
                amount,
                network
            });

            return result;
        } catch (error) {
            logger.error('Failed to withdraw funds', { userId, walletId, address, amount, network, error: error.message });
            throw error;
        }
    }

    async getTransactionHistory(userId: number, walletId?: string): Promise<any[]> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId) || '';
            console.log('transferService', token, walletId);
            // const transactions = await this.transferApi.getTransactions(token, walletId);
            const transactions = await this.transactionApi.getTransactions(token, walletId);

            return transactions;
        } catch (error) {
            logger.error('Failed to get transaction history', { userId, walletId, error: error.message });
            throw error;
        }
    }

    async getTransactionDetails(userId: number, transactionId: string): Promise<any> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            const transaction = await this.transferApi.getTransactionDetails(token, transactionId);

            return transaction;
        } catch (error) {
            logger.error('Failed to get transaction details', { userId, transactionId, error: error.message });
            throw error;
        }
    }

    isAuthenticated(userId: number): boolean {
        return authService.isAuthenticated(userId);
    }

    getToken(userId: number): string | undefined {
        return authService.getToken(userId);
    }
}

// Initialize with DI
const transferApi = new TransferApi();
const transactionApi = new TransactionsApi();
const transferService = new TransferServiceImpl(transferApi, transactionApi);

export default transferService;