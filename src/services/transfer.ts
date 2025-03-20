// src/services/transfer.ts
import axios from 'axios';
import { config } from '../config';

const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function sendEmailTransfer(token: string, data: {
    email: string;
    amount: number;
    network?: string;
}) {
    try {
        const response = await api.post(
            '/api/transfers/send',
            {
                email: data.email,
                amount: data.amount,
                network: data.network,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            transfer: response.data,
        };
    } catch (error: any) {
        console.error('Error sending email transfer:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send transfer. Please try again.',
        };
    }
}

export async function sendWalletTransfer(token: string, data: {
    address: string;
    amount: number;
    network: string;
}) {
    try {
        const response = await api.post(
            '/api/transfers/wallet-withdraw',
            {
                address: data.address,
                amount: data.amount,
                network: data.network,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            transfer: response.data,
        };
    } catch (error: any) {
        console.error('Error sending wallet transfer:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send transfer. Please try again.',
        };
    }
}

export async function bankWithdrawal(token: string, data: {
    amount: number;
    network?: string;
}) {
    try {
        const response = await api.post(
            '/api/transfers/offramp',
            {
                amount: data.amount,
                network: data.network,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            withdrawal: response.data,
        };
    } catch (error: any) {
        console.error('Error initiating bank withdrawal:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to initiate withdrawal. Please try again.',
        };
    }
}

export async function getTransferHistory(token: string, page = 1, limit = 10) {
    try {
        const response = await api.get(`/api/transfers?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            transfers: response.data.items,
            total: response.data.meta.totalItems,
            pageCount: response.data.meta.totalPages,
        };
    } catch (error) {
        console.error('Error getting transfer history:', error);
        return {
            success: false,
            message: 'Failed to fetch transfer history. Please try again.',
        };
    }
}