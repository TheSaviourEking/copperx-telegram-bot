import ApiClient from './client';
import config from '../config';

interface AuthApiOptions {
    baseUrl: string;
    timeout: number;
}

class AuthApi extends ApiClient {
    private endpoints: any;

    constructor(options: AuthApiOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        super(options);
        this.endpoints = config.api?.default?.endpoints?.auth;
    }

    async requestOtp(email: string) {
        const response = await this.post(this.endpoints.requestOtp, { email });
        return response.data;
    }

    async authenticate(email: string, otp: string, sid: string) {
        try {
            const response = await this.post(this.endpoints.authenticate, { email, otp, sid });
            console.log(response.data, 'auth data');
            return response.data;
        } catch (error) {
            // Log the complete error object
            console.error('Authentication error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                fullError: error
            });
            throw error;
        }
    }

    async getProfile(token: string) {
        const response = await this.get(this.endpoints.me, token);
        return response.data;
    }

    async refreshToken(refreshToken: string) {
        const response = await this.post(this.endpoints.refresh, { refreshToken });
        return response.data;
    }

    async logout(token: string) {
        const response = await this.post(this.endpoints.logout, {}, token);
        return response.data;
    }

    async updateProfile(token: string, profileData: any) {
        const response = await this.post(this.endpoints.updateProfile, profileData, token);
        return response.data;
    }
}

export default AuthApi;