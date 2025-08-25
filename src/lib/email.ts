export type EmailResult = { success: boolean; error?: string };

export async function sendWelcomeEmail(
  name: string,
  email: string,
  password: string
): Promise<EmailResult> {
  try {
    // Correct: try/catch wraps the call; body is a plain object
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { name, email, password },
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { success: false, error: (error as any)?.message ?? String(error) };
    }

    // If the edge function returns { success, error? }, pass it through
    if (data && typeof data === 'object' && 'success' in (data as any)) {
      const d = data as { success: boolean; error?: string };
      return d.success ? { success: true } : { success: false, error: d.error ?? 'Unknown failure' };
    }

    // Otherwise treat a no-error response as success
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('sendWelcomeEmail failed:', msg);
    return { success: false, error: msg };
  }
}
export type EmailResult = { success: boolean; error?: string };

export async function sendWelcomeEmail(
  name: string,
  email: string,
  password: string
): Promise<EmailResult> {
  try {
    // Call Supabase Edge Function correctly: try/catch OUTSIDE the body
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { name, email, password },
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { success: false, error: (error as any)?.message ?? String(error) };
    }

    // If the function returns a shape with { success, error? }, respect it
    if (data && typeof data === 'object' && 'success' in (data as any)) {
      const d = data as { success: boolean; error?: string };
      return d.success ? { success: true } : { success: false, error: d.error ?? 'Unknown failure' };
    }

    // Otherwise, treat lack of error as success
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('sendWelcomeEmail failed:', msg);
    return { success: false, error: msg };
  }
}
export type EmailResult = { success: boolean; error?: string };
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function sendWelcomeEmail(
  name: string,
  email: string,
  password: string
): Promise<EmailResult> {
  try {
    console.log('Attempting to send welcome email via Supabase Edge Function...');
    
    // Try Supabase Edge Function first
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        try {
          console.log('Attempting to send welcome email via Supabase Edge Function...');
          // Try Supabase Edge Function first
          const { data, error } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              email,
              name,
              temporaryPassword: password,
            },
          });

          if (error) {
            console.error('Supabase Edge Function error:', error);
            throw error;
          }

          if (data?.success) {
            console.log('Email sent successfully via Supabase Edge Function');
            return { success: true };
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
              to: [email],
              subject: 'Welcome to Childcare Dashboard',
              html: `...` // ...existing code...
            });

            if (error) {
              console.error('Resend fallback error:', error);
              throw error;
            }

            console.log('Email sent successfully via Resend fallback');
            return { success: true };
          } catch (resendError) {
            const msg = resendError instanceof Error ? resendError.message : String(resendError);
            console.error('Both Supabase and Resend failed:', msg);
            return { success: false, error: msg };
          }
        }
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
                
                <p>If you have any questions or need assistance, please don&apos;t hesitate to contact our support team.</p>
                
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
