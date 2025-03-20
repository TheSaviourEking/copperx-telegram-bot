// src/services/wallet.ts
import axios from 'axios';
import { config } from '../config';

const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function getWallets(token: string) {
    try {
        const response = await api.get('/api/wallets', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            wallets: response.data,
        };
    } catch (error) {
        console.error('Error getting wallets:', error);
        return {
            success: false,
            message: 'Failed to fetch wallets. Please try again.',
        };
    }
}

export async function getWalletBalances(token: string) {
    try {
        const response = await api.get('/api/wallets/balances', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            balances: response.data,
        };
    } catch (error) {
        console.error('Error getting wallet balances:', error);
        return {
            success: false,
            message: 'Failed to fetch balances. Please try again.',
        };
    }
}

export async function setDefaultWallet(token: string, walletId: string) {
    try {
        const response = await api.put(
            '/api/wallets/default',
            { defaultWalletId: walletId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            result: response.data,
        };
    } catch (error) {
        console.error('Error setting default wallet:', error);
        return {
            success: false,
            message: 'Failed to set default wallet. Please try again.',
        };
    }
}

export async function getDefaultWallet(token: string) {
    try {
        const response = await api.get('/api/wallets/default', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            defaultWallet: response.data,
        };
    } catch (error) {
        console.error('Error getting default wallet:', error);
        return {
            success: false,
            message: 'Failed to fetch default wallet. Please try again.',
        };
    }
}