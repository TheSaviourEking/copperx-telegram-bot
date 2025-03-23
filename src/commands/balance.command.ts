interface BalanceCommandDependencies {
    walletService: any;
    keyboards: any;
    formatters: any;
  }
  
  class BalanceCommand {
    private walletService: any;
    private keyboards: any;
    private formatters: any;
  
    constructor(dependencies: BalanceCommandDependencies) {
      this.walletService = dependencies.walletService;
      this.keyboards = dependencies.keyboards;
      this.formatters = dependencies.formatters;
    }
  
    get command(): string {
      return 'balance';
    }
  
    get description(): string {
      return 'View your wallet balances';
    }
  
    async handle(ctx: any): Promise<void> {
      const userId = ctx.from?.id;
  
      if (!this.walletService.isAuthenticated(userId)) {
        return ctx.reply('Please login first with /login');
      }
  
      try {
        const balances = await this.walletService.getBalances(userId);
  
        if (!balances.length) {
          return ctx.reply("You don't have any wallets yet.");
        }
  
        const formattedBalances = this.formatters.formatBalances(balances);
  
        return ctx.reply(formattedBalances, {
          parse_mode: 'Markdown',
          reply_markup: this.keyboards.getWalletOptions()
        });
      } catch (error) {
        return ctx.reply(`Failed to fetch balances: ${error.message}`);
      }
    }
  }
  
  export default BalanceCommand;