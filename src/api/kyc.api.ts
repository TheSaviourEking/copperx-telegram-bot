import ApiClient from './client';
import config from '../config';
import AuthApi from './auth.api';

interface AuthApiOptions {
    baseUrl: string;
    timeout: number;
}

class KycApi extends AuthApi {
    private kycEndpoints: any;

    constructor(options: AuthApiOptions = { baseUrl: config.api.baseUrl, timeout: config.api.timeout }) {
        super(options);
        this.kycEndpoints = config.api?.default?.endpoints?.kyc;
    }

    async getKycStatus(sid: string, token: string): Promise<string> {
        // const response = await this.post(this.kycEndpoints.list, sid, token);
        console.log(sid, 'sid')
        const response = await this.get(this.kycEndpoints.list, sid);

        return '';
    }
}

export default KycApi;