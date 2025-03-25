import keyboards from '../ui/keyboards'; 

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

Welcome to the Copperx Payout Bot. Here's what you can do:
`;

        await ctx.reply(welcomeMessage.trim(), {
            reply_markup: keyboards.getMainMenuKeyboard(),
        });
    }
}

export default StartCommand;