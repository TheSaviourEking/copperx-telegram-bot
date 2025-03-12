import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const api: AxiosInstance = axios.create({
  baseURL: 'https://income-api.copperx.io/api',
  headers: {
    Authorization: `Bearer ${process.env.COPPERX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function login(email: string, otp: string): Promise<string> {
  try {
    const otpResponse = await api.post('/auth/email-otp/request', { email });
    const authResponse = await api.post('/auth/email-otp/authenticate', { email, otp });
    return authResponse.data.token;
  } catch (error) {
    throw new Error('Authentication failed: ' + (error.response?.data?.message || error.message));
  }
}

export async function getProfile(token: string) {
  return api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}

export async function getKycStatus(token: string) {
  return api.get('/kycs', { headers: { Authorization: `Bearer ${token}` } });
}

export async function getWallets(token: string): Promise<Wallet[]> {
  const response = await api.get('/wallets', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function getBalances(token: string): Promise<Balance[]> {
  const response = await api.get('/wallets/balances', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function setDefaultWallet(token: string, walletId: string) {
  return api.post('/wallets/default', { walletId }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function sendTransfer(token: string, email: string, amount: string) {
  return api.post('/transfers/send', { email, amount }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function withdrawToWallet(token: string, address: string, amount: string) {
  return api.post('/transfers/wallet-withdraw', { address, amount }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getTransfers(token: string): Promise<Transfer[]> {
  const response = await api.get('/transfers?page=1&limit=10', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function pusherAuth(token: string, socketId: string, channel: string) {
  return api.post('/notifications/auth', { socket_id: socketId, channel_name: channel }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}