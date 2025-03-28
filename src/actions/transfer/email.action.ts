import transferService from '../../services/transfer.service';
import { logger } from '../../utils/logger';

interface EmailTransferActionContext {
    editMessageText: (text: string, options: any) => Promise<void>;
    reply: (text: string) => Promise<void>;
}

async function emailTransferAction(ctx: EmailTransferActionContext, session: any) {
    // Set the transfer state
    session.state = 'transfer_email_recipient';

    // Prompt for recipient email
    // await ctx.editMessageText(
    //     'Please send me the recipient\'s email address.',
    //     { reply_markup: { remove_keyboard: true } }
    // );

    // In your set_default_wallet action
    // await ctx.editMessageText("Please send me the recipient's email address.", {
    //     reply_markup: { inline_keyboard: [] }  
    // });

    // Or alternatively, send a new message:
    await ctx.reply('Please send me the recipient\'s email address.');
}

export default emailTransferAction;