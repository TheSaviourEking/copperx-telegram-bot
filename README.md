# Copperx Telegram Bot
A bot for managing USDC deposits, withdrawals, and transfers via Copperx Payout API.

## Setup
1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set up `.env` with your tokens (see `.env` sample above).
4. Run locally: `npm start`

## Commands
- `/login`: Authenticate with Copperx
- `/balance`: View wallet balances
- `/send`: Send USDC to an email
- `/withdraw`: Withdraw USDC to a wallet
- `/history`: View transaction history
- `/help`: Show this help

## API Integration
Uses Copperx API: https://income-api.copperx.io/api/doc

## Troubleshooting
- Ensure all env variables are set.
- Check Telegram community for API issues: https://t.me/copperxcommunity/2991