import { AuthService, SessionContext } from '../../global';

interface KycStatusCommandDependencies {
    authService: AuthService;
    keyboards?: any;
}

class KycStatusCommand {
    private authService: AuthService;
    private keyboards?: any;

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

    async handle(ctx: SessionContext): Promise<void> {
        const userId = ctx.from?.id;

        if (!userId) {
            return ctx.reply('Unable to identify user. Please try again.');
        }

        // Check if user is authenticated
        if (!this.authService.isAuthenticated(userId)) {
            return ctx.reply(
                'You need to login first to check your KYC status.\nUse /login to authenticate.'
            );
        }

        try {
            // Get user's KYC/KYB status
            const kycStatus = await this.authService.getKycStatus(userId);

            if (!kycStatus) {
                return ctx.reply('Failed to retrieve your KYC/KYB status. Please try again later.');
            }

            // Format status information
            console.log('KYC/KYB status:', kycStatus);
            const messageText = this.formatStatusMessage(kycStatus);

            // Prepare keyboard options
            const keyboard = this.keyboards?.getKycStatusKeyboard?.(kycStatus) || {
                inline_keyboard: this.getDefaultKeyboard(kycStatus)
            };

            return ctx.reply(messageText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
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

        // Additional verification details
        const verificationDetails = status.verificationDetails || {};
        const requiredDocuments = status.requiredDocuments?.join(', ') || 'None specified';

        return `*🔍 KYC/KYB Status*\n\n` +
            `*Verification Level:* ${kycLevel}\n` +
            `*KYC Status:* ${kycStatus}\n` +
            `*KYB Status:* ${kybStatus}\n` +
            `*Last Updated:* ${lastUpdated}\n` +
            `*Required Documents:* ${requiredDocuments}\n\n` +
            `*Details:*\n` +
            `${this.formatVerificationDetails(verificationDetails)}\n\n` +
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

    private getDefaultKeyboard(status: any): any[][] {
        const baseKeyboard = [
            [{ text: '📝 Start KYC', callback_data: 'start_kyc' }],
            [{ text: '📤 Upload Documents', callback_data: 'upload_kyc_docs' }],
            [{ text: '🔄 Refresh Status', callback_data: 'refresh_kyc_status' }]
        ];

        // Add KYB option if applicable
        if (status.accountType === 'business' || status.kybStatus) {
            baseKeyboard.push([{ text: '🏢 Start KYB', callback_data: 'start_kyb' }]);
        }

        baseKeyboard.push([{ text: '« Back to Profile', callback_data: 'back_to_profile' }]);

        return baseKeyboard;
    }

    async handleKycAction(ctx: SessionContext): Promise<void> {
        const userId = ctx.from?.id;

        if (!userId || !this.authService.isAuthenticated(userId)) {
            return ctx.answerCbQuery('You need to be logged in to perform KYC actions.');
        }

        // Handle different KYC actions based on callback data
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
                                [{ text: 'Cancel', callback_data: 'kyc_cancel' }]
                            ]
                        }
                    }
                );

            case 'upload_kyc_docs':
                ctx.session.waitingFor = 'kyc_document_upload';
                return ctx.editMessageText(
                    'Please upload the required documents for verification.',
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'kyc_cancel' }]
                            ]
                        }
                    }
                );

            default:
                return ctx.answerCbQuery('Action not recognized.');
        }
    }
}

export default KycStatusCommand;