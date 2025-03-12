export interface UserSession {
    token?: string;
    organizationId?: string;
    defaultWallet?: string;
  }
  
  export interface Wallet {
    id: string;
    network: string;
    address: string;
  }
  
  export interface Balance {
    walletId: string;
    amount: string;
    currency: string;
  }
  
  export interface Transfer {
    id: string;
    amount: string;
    status: string;
    recipient?: string;
    createdAt: string;
  }