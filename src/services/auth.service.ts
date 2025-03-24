import { AuthService } from '../../global';
import AuthApi from '../api/auth.api';
import KycApi from '../api/kyc.api';
import { sessionManager } from '../state/session';
import { logger } from '../utils/logger';

class AuthServiceImpl implements AuthService {
    private authApi: AuthApi;
    private kycApi?: any;

    constructor(authApi: AuthApi, kycApi?: any) {
        this.authApi = authApi;
        this.kycApi = kycApi;
    }

    async requestOtp(email: string, userId: number): Promise<boolean> {
        try {
            const response = await this.authApi.requestOtp(email);

            // Store email in session for the next step
            const session = sessionManager.getSession(userId.toString());
            session.pendingEmail = email;
            session.sid = response.sid;
            logger.info('OTP requested', { userId, email });
            return true;
        } catch (error) {
            logger.error('Failed to request OTP', { email, error: error.message });
            throw new Error('Failed to request OTP. Please try again.');
        }
    }

    async authenticate(email: string, otp: string, userId: number): Promise<any> {
        try {
            const session = sessionManager.getSession(userId.toString());

            const response = await this.authApi.authenticate(email, otp, session.sid);

            const { accessToken, organizationId } = response;

            // Store authentication data in session
            session.isAuthenticated = true;
            session.token = accessToken;
            session.organizationId = organizationId;
            session.email = email;
            delete session.pendingEmail; // Clean up

            // Get user profile
            const profile = await this.authApi.getProfile(accessToken);
            session.profile = profile;


            logger.info('User authenticated', { userId, email });

            return profile;
        } catch (error) {
            logger.error('Authentication failed', { email, error: error.message });
            throw new Error('Authentication failed. Please check your OTP and try again.');
        }
    }

    async logout(userId: number): Promise<boolean> {
        sessionManager.clearSession(String(userId));
        logger.info('User logged out', { userId });
        return true;
    }

    isAuthenticated(userId: number): boolean {
        const session = sessionManager.getSession(String(userId));
        return session.isAuthenticated && !!session.token;
    }

    getToken(userId: number): string | undefined {
        const session = sessionManager.getSession(String(userId));
        return session.token ? session.token : undefined;
    }

    getUserProfile(userId: number): any {
        const session = sessionManager.getSession(String(userId));
        return session.profile;
    }

    async getKycStatus(userId: number): Promise<any> {
        const session = sessionManager.getSession(String(userId));
        const status = await this.kycApi.getKycStatus(session.sid, session.token);
        return status;
        return session.profile?.kycStatus;
    }

    async setAuthenticated(userId: number, email: string): Promise<void> {
        const session = sessionManager.getSession(String(userId));
        session.isAuthenticated = true;
        session.email = email;
        logger.info('User authenticated', { userId, email });
    }
}

const authApi = new AuthApi();
const kycApi = new KycApi();
const authService = new AuthServiceImpl(authApi, kycApi);

export default authService;