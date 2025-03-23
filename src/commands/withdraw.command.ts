interface WithdrawCommandDependencies {
    transferService: any;
    keyboards: any;
  }
  
  class WithdrawCommand {
    private transferService: any;
    private keyboards: any;
  
    constructor(dependencies: WithdrawCommandDependencies) {
      this.transferService = dependencies.transferService;
      this.keyboards = dependencies.keyboards;
    }
  
    get command(): string {
      return 'withdraw';
    }
  
    get description(): string {
      return 'Withdraw crypto to an external wallet';
    }
  
    async handle(ctx: any): Promise<void> {
      const userId = ctx.from.id;
  
      if (!this.transferService.isAuthenticated(userId)) {
        return ctx.reply('Please login first with /login');
      }
  
      try {
        // Start the withdrawal flow
        const wallets = await this.transferService.getAvailableWallets(userId);
        
        if (!wallets.length) {
          return ctx.reply("You don't have any wallets with funds to withdraw.");
        }
  
        return ctx.reply('Select a wallet to withdraw from:', {
          reply_markup: this.keyboards.getWalletSelectionKeyboard(wallets)
        });
      } catch (error) {
        return ctx.reply(`Failed to initiate withdrawal: ${error.message}`);
      }
    }
  }
  
  export default WithdrawCommand;