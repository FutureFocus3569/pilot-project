import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  temporaryPassword: string
): Promise<boolean> {
  try {
    console.log('Attempting to send welcome email via Supabase Edge Function...');
    
    // Try Supabase Edge Function first
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        email: userEmail,
        name: userName,
        temporaryPassword: temporaryPassword,
      },
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }

    if (data?.success) {
      console.log('Email sent successfully via Supabase Edge Function');
      return true;
    } else {
      throw new Error(data?.error || 'Unknown error from Supabase Edge Function');
    }
  } catch (supabaseError) {
    console.error('Supabase email failed, trying Resend fallback:', supabaseError);
    
    // Fallback to direct Resend API
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: [userEmail],
        subject: 'Welcome to Childcare Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Welcome to Childcare Dashboard</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Welcome to Childcare Dashboard!</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Hello ${userName}!</h2>
                
                <p>Welcome to the Childcare Dashboard! Your account has been successfully created and you can now access the system.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #667eea;">Your Login Details:</h3>
                  <p><strong>Email:</strong> ${userEmail}</p>
                  <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
                </div>
                
                <p style="margin: 25px 0;">
                  <a href="http://localhost:3000/auth/signin" 
                     style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Login to Dashboard
                  </a>
                </p>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>The Childcare Dashboard Team</p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>This email was sent automatically. Please do not reply to this email.</p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend fallback error:', error);
        throw error;
      }

      console.log('Email sent successfully via Resend fallback');
      return true;
    } catch (resendError) {
      console.error('Both Supabase and Resend failed:', resendError);
      return false;
    }
  }
}
