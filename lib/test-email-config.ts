/**
 * Resend Test Email Configuration
 * 
 * This configuration uses official Resend test email addresses that are safe
 * for testing without damaging domain reputation.
 * 
 * Test Email Addresses (from Resend docs):
 * - delivered@resend.dev - Simulates successful email delivery
 * - bounced@resend.dev - Simulates email bounces (SMTP 550 5.1.1)
 * - spam@resend.dev - Simulates emails marked as spam
 * 
 * Labeling Support:
 * You can add labels after the + symbol for tracking:
 * - delivered+signup@resend.dev
 * - delivered+verification@resend.dev
 * - bounced+invalid-user@resend.dev
 */

export const testEmailConfig = {
  // Test email addresses from environment variables
  delivered: process.env.TEST_EMAIL_DELIVERED || 'delivered@resend.dev',
  bounced: process.env.TEST_EMAIL_BOUNCED || 'bounced@resend.dev',
  spam: process.env.TEST_EMAIL_SPAM || 'spam@resend.dev',
  
  // Test email labels for different scenarios
  labels: {
    signup: process.env.TEST_EMAIL_LABEL_SIGNUP || 'signup',
    verification: process.env.TEST_EMAIL_LABEL_VERIFICATION || 'verification',
    reset: process.env.TEST_EMAIL_LABEL_RESET || 'password-reset',
    welcome: process.env.TEST_EMAIL_LABEL_WELCOME || 'welcome',
  },
  
  // Helper functions to generate labeled test emails
  getDeliveredEmail: (label?: string) => {
    const baseEmail = process.env.TEST_EMAIL_DELIVERED || 'delivered@resend.dev';
    return label ? baseEmail.replace('@', `+${label}@`) : baseEmail;
  },
  
  getBouncedEmail: (label?: string) => {
    const baseEmail = process.env.TEST_EMAIL_BOUNCED || 'bounced@resend.dev';
    return label ? baseEmail.replace('@', `+${label}@`) : baseEmail;
  },
  
  getSpamEmail: (label?: string) => {
    const baseEmail = process.env.TEST_EMAIL_SPAM || 'spam@resend.dev';
    return label ? baseEmail.replace('@', `+${label}@`) : baseEmail;
  },
  
  // Generate test user data with appropriate test emails
  generateTestUser: (scenario: 'delivered' | 'bounced' | 'spam' = 'delivered', label?: string) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    let email: string;
    
    // Create unique email by combining timestamp and random ID
    const uniqueLabel = label ? `${label}-${timestamp}-${randomId}` : `${timestamp}-${randomId}`;
    
    switch (scenario) {
      case 'bounced':
        email = testEmailConfig.getBouncedEmail(uniqueLabel);
        break;
      case 'spam':
        email = testEmailConfig.getSpamEmail(uniqueLabel);
        break;
      case 'delivered':
      default:
        email = testEmailConfig.getDeliveredEmail(uniqueLabel);
        break;
    }
    
    return {
      email,
      password: 'testPassword123',
      name: `Test User ${timestamp}`,
    };
  },
  
  // Mock email functions for testing (when you want to avoid actual email sending)
  mockEmailConfig: {
    sendVerificationEmail: async ({ user, url }: { user: any, url: string }) => {
      console.log('=== MOCK EMAIL VERIFICATION ===');
      console.log('To:', user.email);
      console.log('Name:', user.name);
      console.log('Verification URL:', url);
      console.log('===============================');
      return Promise.resolve();
    },
    
    sendResetPassword: async ({ user, url }: { user: any, url: string }) => {
      console.log('=== MOCK PASSWORD RESET ===');
      console.log('To:', user.email);
      console.log('Reset URL:', url);
      console.log('===========================');
      return Promise.resolve();
    }
  }
};

// Export individual functions for convenience
export const {
  getDeliveredEmail,
  getBouncedEmail, 
  getSpamEmail,
  generateTestUser
} = testEmailConfig;