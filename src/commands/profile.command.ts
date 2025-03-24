import { AuthService, SessionContext } from '../../global';

interface ProfileCommandDependencies {
    authService: AuthService;
    keyboards?: any;
}

class ProfileCommand {
    private authService: AuthService;
    private keyboards?: any;

    constructor(dependencies: ProfileCommandDependencies) {
        this.authService = dependencies.authService;
        this.keyboards = dependencies.keyboards;
    }

    get command(): string {
        return 'profile';
    }

    get description(): string {
        return 'View and manage your profile';
    }

    async handle(ctx: SessionContext): Promise<void> {
        const userId = ctx.from?.id;

        if (!userId) {
            return ctx.reply('Unable to identify user. Please try again.');
        }

        // Check if user is authenticated
        if (!this.authService.isAuthenticated(userId)) {
            return ctx.reply(
                'You need to login first to view your profile.\nUse /login to authenticate.'
            );
        }

        try {
            // Get user profile data
            const userProfile = await this.authService.getUserProfile(userId);

            if (!userProfile) {
                return ctx.reply('Failed to retrieve your profile. Please try again later.');
            }

            // Format profile information
            const messageText = this.formatProfileMessage(userProfile);

            // Send profile information with action keyboard
            const keyboard = this.keyboards?.getProfileOptionsKeyboard() || {
                inline_keyboard: [
                    [{ text: '✏️ Edit Profile', callback_data: 'edit_profile' }],
                    [{ text: '🔑 Security Settings', callback_data: 'security_settings' }],
                    [{ text: '📬 Notification Preferences', callback_data: 'notification_settings' }],
                    [{ text: '💼 Wallet Management', callback_data: 'wallet_menu' }]
                ]
            };

            return ctx.reply(messageText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Profile error:', error);
            return ctx.reply('An error occurred while fetching your profile. Please try again later.');
        }
    }

    // Format profile message with markdown
    /**
 * Format profile message with markdown using the available user profile data
 * @param profile User profile object
 * @returns Formatted profile message string with markdown
 */
    private formatProfileMessage(profile: any): string {
        // Format name (handle null values)
        const name = profile.firstName && profile.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.firstName || profile.lastName || 'User';

        // Format wallet address (shorten for display)
        const shortWalletAddress = profile.walletAddress
            ? `${profile.walletAddress.substring(0, 6)}...${profile.walletAddress.substring(profile.walletAddress.length - 4)}`
            : 'Not available';

        // Format relay address (shorten for display)
        const shortRelayerAddress = profile.relayerAddress
            ? `${profile.relayerAddress.substring(0, 6)}...${profile.relayerAddress.substring(profile.relayerAddress.length - 4)}`
            : 'Not available';

        // Determine account status
        const accountStatus = profile.status || 'Unknown';

        // Determine wallet type
        const walletType = profile.walletAccountType
            ? profile.walletAccountType.charAt(0).toUpperCase() + profile.walletAccountType.slice(1)
            : 'Standard';

        // Check for special flags
        const hasSpecialFlags = profile.flags && profile.flags.length > 0;
        const flagsText = hasSpecialFlags
            ? `\n*Special Status:* ${profile.flags.map((f: string) => f.replace(/_/g, ' ')).join(', ')}`
            : '';

        return `*👤 Your Profile*\n\n` +
            `*Name:* ${name}\n` +
            `*Email:* ${profile.email}\n` +
            `*Role:* ${profile.role || 'User'}\n` +
            `*Account Type:* ${walletType}\n` +
            `*Account Status:* ${accountStatus}\n` +
            `*Wallet ID:* ${profile.walletId}\n` +
            `*Wallet Address:* \`${shortWalletAddress}\`` +
            `${flagsText}\n\n` +
            `Use the buttons below to manage your profile settings.`;
    }

    // Handle profile edit callback
    async handleEditProfile(ctx: SessionContext): Promise<void> {
        const userId = ctx.from?.id;

        if (!userId || !this.authService.isAuthenticated(userId)) {
            return ctx.answerCbQuery('You need to be logged in to edit your profile.');
        }

        // Set the conversation to wait for profile edit choice
        ctx.session.waitingFor = 'profile_edit_choice';

        return ctx.editMessageText(
            '✏️ *Edit Profile*\n\nWhat would you like to update?',
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Change Email', callback_data: 'change_email' }],
                        [{ text: 'Update Notification Settings', callback_data: 'update_notifications' }],
                        [{ text: 'Complete KYC', callback_data: 'start_kyc' }],
                        [{ text: '« Back to Profile', callback_data: 'back_to_profile' }]
                    ]
                }
            }
        );
    }
}

export default ProfileCommand;