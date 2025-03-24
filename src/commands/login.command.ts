import { AuthService, SessionContext } from '../../global';

interface LoginCommandDependencies {
  authService: AuthService;
}

class LoginCommand {
  private authService: AuthService;

  constructor(dependencies: LoginCommandDependencies) {
    this.authService = dependencies.authService;
  }

  get command(): string {
    return 'login';
  }

  get description(): string {
    return 'Login to your wallet';
  }

  async handle(ctx: SessionContext): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply('Unable to identify user. Please try again.');
    }

    if (this.authService.isAuthenticated(userId)) {
      return ctx.reply('You are already logged in.');
    }

    // Set the conversation to wait for email input
    ctx.session.waitingFor = 'email';

    // Prompt for email
    return ctx.reply('Please enter your email address to log in.');
  }

  // Handle the email response
  async handleEmailInput(ctx: SessionContext, email: string): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply('Unable to identify user. Please try again.');
    }

    // Validate email format
    if (!this.isValidEmail(email)) {
      return ctx.reply('Invalid email format. Please try again with a valid email address.');
    }

    try {
      // Send authentication link or code to the email
      await this.authService.requestOtp(email, userId);

      // Update session to wait for verification code if needed
      ctx.session.waitingFor = 'verification_code';
      // ctx.session.userEmail = email;

      // return ctx.reply('We\'ve sent a verification code to your email. Please enter the code to complete login.');
      return ctx.reply('Enter the 6-digit OTP sent to your email.')
    } catch (error) {
      return ctx.reply('Failed to send authentication email. Please try again later.');
    }
  }

  // Handle verification code input
  async handleVerificationCode(ctx: SessionContext, code: string): Promise<void> {
    const userId = ctx.from?.id;
    const email = ctx.session.pendingEmail;

    if (!userId || !email) {
      return ctx.reply('Session expired. Please start the login process again.');
    }

    try {
      // Verify the code
      const isValid = await this.authService.authenticate(email, code, userId);

      if (isValid) {
        // Set user as authenticated
        await this.authService.setAuthenticated(userId, email);

        // Clear waiting states
        delete ctx.session.waitingFor;
        delete ctx.session.email;

        // return ctx.reply('Login successful! You can now use wallet commands.');
        const profile = await this.authService.getUserProfile(userId);
        console.log('User profile:', profile);
        if (profile?.firstName) {
          let name = profile.firstName;
          if (profile.lastName) {
            name += ` ${profile.lastName}`;
          }

          return ctx.reply(`Login successful! Welcome, ${profile.name}`);
        }
        return ctx.reply(`Login successful! Welcome, user`);
      } else {
        return ctx.reply('Invalid verification code. Please try again.');
      }
    } catch (error) {
      return ctx.reply('Error verifying code. Please try again later.');
    }
  }

  // Helper function to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default LoginCommand;