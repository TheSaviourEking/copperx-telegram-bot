// @ts-nocheck

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import config from '../config';

interface ApiClientOptions {
    baseUrl: string;
    timeout: number;
}

class ApiClient {
    private baseUrl: string;
    private axiosInstance: AxiosInstance;

    constructor(options: ApiClientOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        this.baseUrl = options.baseUrl  || 'https://income-api.copperx.io';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: options.timeout
        });

        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => this.handleApiError(error)
        );
    }

    getAuthHeaders(token?: string) {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async get(endpoint: string, token?: string) {
        return this.axiosInstance.get(endpoint, {
            headers: this.getAuthHeaders(token)
        });
    }

    async post(endpoint: string, data: any, token?: string) {
        return this.axiosInstance.post(endpoint, data, {
            headers: this.getAuthHeaders(token)
        });
    }

    handleApiError(error: AxiosError) {
        // Enhanced error handling
        if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const data = error.response.data;

            // Transform common API errors to more informative ones
            if (status === 401) {
                return Promise.reject(new Error('Authentication failed. Please login again'));
            } else if (status === 403) {
                return Promise.reject(new Error('You do not have permission to perform this action'));
            }

            // Return server-provided error message if available
            if (data && data.message) {
                return Promise.reject(new Error(data.message));
            }
        }

        // Network errors, timeouts, etc.
        return Promise.reject(error);
    }
}

export default ApiClient;