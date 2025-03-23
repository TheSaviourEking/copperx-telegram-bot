interface SendCommandDependencies {
    transferService: any;
    keyboards: any;
}

class SendCommand {
    private transferService: any;
    private keyboards: any;

    constructor(dependencies: SendCommandDependencies) {
        this.transferService = dependencies.transferService;
        this.keyboards = dependencies.keyboards;
    }

    get command(): string {
        return 'send';
    }

    get description(): string {
        return 'Send crypto to another user';
    }

    async handle(ctx: any): Promise<void> {
        const userId = ctx.from.id;

        if (!this.transferService.isAuthenticated(userId)) {
            return ctx.reply('Please login first with /login');
        }

        try {
            // Start the sending flow
            const wallets = await this.transferService.getAvailableWallets(userId);

            // if (!wallets.length) {
            //     return ctx.reply("You don't have any wallets with funds to send.");
            // }

            return ctx.reply('Select a wallet to send from:', {
                // reply_markup: this.keyboards.getWalletSelectionKeyboard(wallets)
                reply_markup: this.keyboards.getWalletOptions(wallets)
            });
        } catch (error) {
            return ctx.reply(`Failed to initiate transfer: ${error.message}`);
        }
    }
}

export default SendCommand;