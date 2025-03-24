import { WalletService } from '../../global';
import WalletApi from '../api/wallet.api';
import { sessionManager } from '../state/session';
import authService from './auth.service';
import { logger } from '../utils/logger';

class WalletServiceImpl implements WalletService {
    private walletApi: WalletApi;

    constructor(walletApi: WalletApi) {
        this.walletApi = walletApi;
    }

    async getWallets(userId: number): Promise<any[]> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            const wallets = await this.walletApi.getWallets(token);

            // Cache wallets in session for quick access
            const session = sessionManager.getSession(String(userId));
            session.wallets = wallets;

            return wallets;
        } catch (error) {
            logger.error('Failed to get wallets', { userId, error: error.message });
            throw error;
        }
    }

    async getBalances(userId: number): Promise<any[]> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            const balances = await this.walletApi.getBalances(token);

            // Cache balances in session
            const session = sessionManager.getSession(String(userId));
            session.balances = balances;

            return balances;
        } catch (error) {
            logger.error('Failed to get balances', { userId, error: error.message });
            throw error;
        }
    }

    async setDefaultWallet(userId: number, walletId: string): Promise<any> {
        try {
            if (!this.isAuthenticated(userId)) {
                throw new Error('User not authenticated');
            }

            const token = this.getToken(userId);
            if (token) {
                const result = await this.walletApi.setDefaultWallet(token, walletId);

                // Update session with new default wallet
                const session = sessionManager.getSession(String(userId));
                if (session.wallets) {
                    session.wallets = session.wallets.map(wallet => ({
                        ...wallet,
                        isDefault: wallet.id === walletId
                    }));
                }

                return result;
            }
        } catch (error) {
            logger.error('Failed to set default wallet', { userId, walletId, error: error.message });
            throw error;
        }
    }

    getWalletInfo(userId: number, walletId?: string): any {
        const session = sessionManager.getSession(String(userId));

        if (!session.wallets) {
            return null;
        }

        if (walletId) {
            return session.wallets.find(wallet => wallet.id === walletId);
        } else {
            // Return default wallet if no ID specified
            return session.wallets.find(wallet => wallet.isDefault) || session.wallets[0];
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
const walletApi = new WalletApi();
const walletService = new WalletServiceImpl(walletApi);

export default walletService;