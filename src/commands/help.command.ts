class HelpCommand {
    get command(): string {
        return 'help';
    }

    get description(): string {
        return 'Show available commands';
    }

    async handle(ctx: any): Promise<void> {
        const helpMessage = `
  *Crypto Wallet Bot Commands*
  
  /start - Start using the bot
  /login - Connect your wallet
  /balance - View your wallet balances
  /send - Send crypto to another user
  /withdraw - Withdraw crypto to an external wallet
  /help - Show this help message
  
  Need further assistance? Contact our support at support@cryptowalletbot.com
  `;

        return ctx.reply(helpMessage, {
            parse_mode: 'Markdown'
        });
    }
}

export default HelpCommand;