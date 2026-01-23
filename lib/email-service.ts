import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PaymentReceiptData {
  customerEmail: string;
  customerName?: string;
  planName: string;
  amount: number;
  currency: string;
  subscriptionId: string;
  nextBillingDate: Date;
  receiptUrl?: string;
}

interface WelcomeEmailData {
  customerEmail: string;
  customerName?: string;
  planName: string;
  verificationUrl: string;
}

export class EmailService {
  static async sendPaymentReceipt(data: PaymentReceiptData) {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@sarsalab.xyz',
        to: [data.customerEmail],
        subject: `Payment Confirmation - ${data.planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed! 🎉</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.customerName || 'there'}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for subscribing to <strong>${data.planName}</strong>! Your payment has been processed successfully.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 30px; margin: 30px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Plan:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">$${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Next Billing:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.nextBillingDate.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Subscription ID:</td>
                    <td style="padding: 8px 0; font-family: monospace; color: #333;">${data.subscriptionId}</td>
                  </tr>
                </table>
              </div>
              
              ${data.receiptUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.receiptUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Receipt
                  </a>
                </div>
              ` : ''}
              
              <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #1976d2; margin-top: 0;">What's Next?</h4>
                <ul style="color: #666; padding-left: 20px;">
                  <li>Check your email for account verification instructions</li>
                  <li>Access your dashboard to manage your subscription</li>
                  <li>Explore all the features included in your plan</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 40px;">
                If you have any questions, feel free to reply to this email or contact our support team.
              </p>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This email was sent to ${data.customerEmail}
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send payment receipt:', error);
        return { success: false, error };
      }

      return { success: true, data: emailData };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  static async sendWelcomeWithVerification(data: WelcomeEmailData) {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@sarsalab.xyz',
        to: [data.customerEmail],
        subject: `Welcome to ${data.planName} - Verify Your Account`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome! 🚀</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.customerName || 'there'}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Welcome to <strong>${data.planName}</strong>! We've created your account and your subscription is now active.
              </p>
              
              <div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">⚠️ Verify Your Email</h3>
                <p style="color: #856404; margin-bottom: 20px;">
                  To secure your account and access all features, please verify your email address.
                </p>
                <div style="text-align: center;">
                  <a href="${data.verificationUrl}" style="background: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Verify Email Address
                  </a>
                </div>
              </div>
              
              <div style="background: white; border-radius: 8px; padding: 30px; margin: 30px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #333; margin-top: 0;">Your Account Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Plan:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #28a745;">Active</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #1976d2; margin-top: 0;">Next Steps</h4>
                <ol style="color: #666; padding-left: 20px;">
                  <li>Click the verification link above to verify your email</li>
                  <li>Sign in to your dashboard to explore your features</li>
                  <li>Update your profile and preferences</li>
                  <li>Start using your subscription benefits</li>
                </ol>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 40px;">
                If you didn't create this account, please ignore this email or contact our support team.
              </p>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This email was sent to ${data.customerEmail}
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error };
      }

      return { success: true, data: emailData };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }
}