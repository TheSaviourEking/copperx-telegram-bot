import { Context } from "telegraf";
import { Update } from "telegraf/types";

interface ApiEndpoints {
    auth: {
        requestOtp: string;
        authenticate: string;
        me: string;
    };
    wallet: {
        list: string;
        balances: string;
        default: string;
    };
    // ...other endpoints
}

interface ApiConfig {
    baseUrl: string;
    timeout: number;
    endpoints: ApiEndpoints;
}

interface SessionContext extends Context<Update> {
    // session: any;
    session: {
        [key: string]: any;
    };
}

interface Session {
    state: string | null;
    isAuthenticated: boolean;
    token: string | null;
    organizationId: string | null;
    profile: any;
    email?: string;
    wallets?: any[];
    balances?: string;
    authState?: string;
    authStateCreatedAt?: number;
    sid: string;
    pendingEmail?: string;
    data: { [key: string]: any };
    lastActivity: number;
}

interface AuthService {
    requestOtp(email: string, userId: number): Promise<boolean>;
    authenticate(email: string, otp: string, userId: number): Promise<any>;
    logout(userId: number): Promise<boolean>;
    isAuthenticated(userId: number): boolean;
    getToken(userId: number): string | undefined;
    getUserProfile(userId: number): Promise<any>;
}

interface BotConfig {
    token: string;
    webhookDomain?: string;
    useWebhook: boolean;
    secretPath: string;
    port: number;
    apiUrl: string;
    adminUserIds: number[];
    commands: {
        [key: string]: string;
    };
}

interface PusherConfig {
    appId: string;
    key: string;
    secret: string;
    cluster: string;
    useTLS: boolean;
    channels: {
        userPrefix: string;
        walletUpdates: string;
        transactionUpdates: string;
        systemAnnouncements: string;
    };
    events: {
        balanceUpdate: string;
        transactionStatus: string;
        newTransaction: string;
        authSuccess: string;
        systemNotification: string;
    };
}

/**
 * Interface for wallet management operations
 */
interface WalletService {
    /**
     * Get all wallets for a user
     * @param userId The user's ID
     * @returns Promise resolving to an array of wallets
     */
    getWallets(userId: number): Promise<any[]>;

    /**
     * Get balance information for all user wallets
     * @param userId The user's ID
     * @returns Promise resolving to an array of balance information
     */
    getBalances(userId: number): Promise<any[]>;

    /**
     * Set a wallet as the default for a user
     * @param userId The user's ID
     * @param walletId The wallet ID to set as default
     * @returns Promise resolving to the updated wallet
     */
    setDefaultWallet(userId: number, walletId: string): Promise<any>;

    /**
     * Get information about a specific wallet
     * @param userId The user's ID
     * @param walletId Optional wallet ID (if not provided, returns default wallet)
     * @returns Wallet information or null if not found
     */
    getWalletInfo(userId: number, walletId?: string): any;

    /**
     * Check if a user is authenticated
     * @param userId The user's ID
     * @returns Boolean indicating authentication status
     */
    isAuthenticated(userId: number): boolean;

    /**
     * Get the authentication token for a user
     * @param userId The user's ID
     * @returns The auth token or undefined if not authenticated
     */
    getToken(userId: number): string | undefined;
}

/**
 * Interface for transfer operations (sending and withdrawing funds)
 */
interface TransferService {
    /**
     * Get wallets that have available funds for transfers
     * @param userId The user's ID
     * @returns Promise resolving to an array of wallets with funds
     */
    getAvailableWallets(userId: number): Promise<any[]>;

    /**
     * Send funds to another user
     * @param userId The sender's user ID
     * @param recipientId The recipient's ID
     * @param walletId The wallet to send from
     * @param amount The amount to send
     * @returns Promise resolving to the transaction details
     */
    sendFunds(userId: number, recipientId: string, walletId: string, amount: string): Promise<any>;

    /**
     * Withdraw funds to an external wallet address
     * @param userId The user's ID
     * @param walletId The wallet to withdraw from
     * @param address The destination address
     * @param amount The amount to withdraw
     * @param network Optional blockchain network for the withdrawal
     * @returns Promise resolving to the transaction details
     */
    withdrawFunds(userId: number, walletId: string, address: string, amount: string, network?: string): Promise<any>;

    /**
     * Get transaction history for a user
     * @param userId The user's ID
     * @param walletId Optional wallet ID to filter transactions
     * @returns Promise resolving to an array of transactions
     */
    getTransactionHistory(userId: number, walletId?: string): Promise<any[]>;

    /**
     * Get detailed information about a specific transaction
     * @param userId The user's ID
     * @param transactionId The transaction ID
     * @returns Promise resolving to the transaction details
     */
    getTransactionDetails(userId: number, transactionId: string): Promise<any>;

    /**
     * Check if a user is authenticated
     * @param userId The user's ID
     * @returns Boolean indicating authentication status
     */
    isAuthenticated(userId: number): boolean;

    /**
     * Get the authentication token for a user
     * @param userId The user's ID
     * @returns The auth token or undefined if not authenticated
     */
    getToken(userId: number): string | undefined;
}