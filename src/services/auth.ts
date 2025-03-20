// src/services/auth.ts
import axios from 'axios';
import { config } from '../config';

const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function requestEmailOTP(email: string) {
    try {
        await api.post('/api/auth/email-otp/request', { email });
        return true;
    } catch (error) {
        console.error('Error requesting OTP:', error);
        return false;
    }
}

export async function authenticateWithOTP(email: string, otp: string) {
    try {
        const response = await api.post('/api/auth/email-otp/authenticate', {
            email,
            otp,
        });

        return {
            success: true,
            token: response.data.token,
        };
    } catch (error) {
        console.error('Error authenticating with OTP:', error);
        return {
            success: false,
            message: 'Authentication failed. Please try again.',
        };
    }
}

export async function getUserProfile(token: string) {
    try {
        const response = await api.get('/api/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            profile: response.data,
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        return {
            success: false,
            message: 'Failed to fetch profile. Please try again.',
        };
    }
}

export async function getKYCStatus(token: string) {
    try {
        const response = await api.get('/api/kycs', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            kycStatus: response.data,
        };
    } catch (error) {
        console.error('Error getting KYC status:', error);
        return {
            success: false,
            message: 'Failed to fetch KYC status. Please try again.',
        };
    }
}