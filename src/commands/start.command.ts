class StartCommand {
    get command(): string {
        return 'start';
    }

    get description(): string {
        return 'Start using the crypto wallet bot';
    }

    async handle(ctx: any): Promise<void> {
        const userName = ctx.from.first_name || 'there';

        const welcomeMessage = `
Hello ${userName}! 👋

Welcome to the Crypto Wallet Bot. Here's what you can do:

/login - Connect your wallet
/balance - View your wallet balances
/send - Send crypto to another user
/withdraw - Withdraw crypto to an external wallet
/help - Show this help message

Get started by logging in with /login
`;

        return ctx.reply(welcomeMessage);
    }
}

export default StartCommand;