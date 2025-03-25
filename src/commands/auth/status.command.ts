// @ts-nocheck

import { AuthService, SessionContext } from "../../../global";

interface KycStatusCommandDependencies {
    authService: AuthService;
    keyboards: any; // Now required, not optional
}

class KycStatusCommand {
    private authService: AuthService;
    private keyboards: any;

    constructor(dependencies: KycStatusCommandDependencies) {
        this.authService = dependencies.authService;
        this.keyboards = dependencies.keyboards;
    }

    get command(): string {
        return 'kyc_status';
    }

    get description(): string {
        return 'Check your KYC/KYB verification status';
    }

    async handle(ctx: SessionContext): Promise<any> {
        const userId = ctx.from?.id;

        if (!userId) {
            return ctx.reply('Unable to identify user. Please try again.');
        }

        if (!this.authService.isAuthenticated(userId)) {
            return ctx.reply('You need to login first to check your KYC status.\nUse /login to authenticate.');
        }

        try {
            const kycStatus = await this.authService.getKycStatus(userId);
            if (!kycStatus) {
                return ctx.reply('Failed to retrieve your KYC/KYB status. Please try again later.');
            }

            const messageText = this.formatStatusMessage(kycStatus);
            return ctx.reply(messageText, {
                parse_mode: 'Markdown',
                reply_markup: this.keyboards.getKycStatusKeyboard(kycStatus),
            });
        } catch (error) {
            console.error('KYC status error:', error);
            return ctx.reply('An error occurred while fetching your KYC/KYB status. Please try again later.');
        }
    }

    private formatStatusMessage(status: any): string {
        const kycLevel = status.kycLevel || 'Not Started';
        const kycStatus = status.kycStatus || 'Pending';
        const kybStatus = status.kybStatus || 'Not Applicable';
        const lastUpdated = status.lastUpdated
            ? new Date(status.lastUpdated).toLocaleDateString()
            : 'Not available';
        const requiredDocuments = status.requiredDocuments?.join(', ') || 'None specified';

        return `*🔍 KYC/KYB Status*\n\n` +
            `*Verification Level:* ${kycLevel}\n` +
            `*KYC Status:* ${kycStatus}\n` +
            `*KYB Status:* ${kybStatus}\n` +
            `*Last Updated:* ${lastUpdated}\n` +
            `*Required Documents:* ${requiredDocuments}\n\n` +
            `*Details:*\n` +
            `${this.formatVerificationDetails(status.verificationDetails || {})}\n\n` +
            `Use the buttons below to manage your verification process.`;
    }

    private formatVerificationDetails(details: any): string {
        if (!details || Object.keys(details).length === 0) {
            return 'No additional details available';
        }
        return Object.entries(details)
            .map(([key, value]) => {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return `• *${formattedKey}:* ${value}`;
            })
            .join('\n');
    }

    async handleKycAction(ctx: SessionContext): Promise<any> {
        const userId = ctx.from?.id;

        if (!userId || !this.authService.isAuthenticated(userId)) {
            return ctx.answerCbQuery('You need to be logged in to perform KYC actions.');
        }

        const action = ctx.callbackQuery?.data;
        switch (action) {
            case 'start_kyc':
                ctx.session.waitingFor = 'kyc_process';
                return ctx.editMessageText(
                    'Starting KYC process...\nPlease follow the instructions to complete verification.',
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Continue', callback_data: 'kyc_continue' }],
                                [{ text: 'Cancel', callback_data: 'kyc_cancel' }],
                            ],
                        },
                    }
                );

            case 'upload_kyc_docs':
                ctx.session.waitingFor = 'kyc_document_upload';
                return ctx.editMessageText(
                    'Please upload the required documents for verification.',
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'kyc_cancel' }]],
                        },
                    }
                );

            case 'refresh_kyc_status':
                return this.handle(ctx); // Re-run the status check

            case 'start_kyb':
                ctx.session.waitingFor = 'kyb_process';
                return ctx.editMessageText(
                    'Starting KYB process...\nPlease follow the instructions to complete verification.',
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Continue', callback_data: 'kyb_continue' }],
                                [{ text: 'Cancel', callback_data: 'kyc_cancel' }],
                            ],
                        },
                    }
                );

            case 'kyc_details':
                return ctx.editMessageText(
                    this.formatStatusMessage(await this.authService.getKycStatus(userId)),
                    {
                        parse_mode: 'Markdown',
                        reply_markup: this.keyboards.getKycStatusKeyboard(await this.authService.getKycStatus(userId)),
                    }
                );

            default:
                return ctx.answerCbQuery('Action not recognized.');
        }
    }
}

export default KycStatusCommand;