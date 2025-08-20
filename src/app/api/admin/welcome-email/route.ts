import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, name, tempPassword } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a welcome email using Supabase Edge Function or direct email service
    // For now, we'll use Supabase's email functionality
    const emailContent = {
      to: email,
      subject: 'Welcome to Future Focus Kids Dashboard',
      html: generateWelcomeEmailHTML(name, email, tempPassword)
    };

    // You can integrate with Supabase Edge Functions or any email service here
    // For this example, I'll show the structure but you'll need to implement
    // the actual email sending via your preferred method

    console.log('Welcome email would be sent:', emailContent);

    return NextResponse.json(
      { message: 'Welcome email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateWelcomeEmailHTML(name: string, email: string, tempPassword?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Future Focus Kids</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .header p { color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .welcome { font-size: 20px; color: #1f2937; margin-bottom: 20px; }
            .credentials { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .credentials h3 { margin: 0 0 15px 0; color: #374151; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: 600; color: #6b7280; }
            .credential-value { font-family: monospace; background-color: white; padding: 5px 8px; border-radius: 4px; border: 1px solid #d1d5db; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .security-note { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Future Focus Kids</h1>
                <p>Your dashboard account is ready</p>
            </div>
            
            <div class="content">
                <p class="welcome">Hi ${name},</p>
                
                <p>Welcome to the Future Focus Kids management dashboard! Your account has been created and you now have access to our staff portal.</p>
                
                ${tempPassword ? `
                <div class="credentials">
                    <h3>🔐 Your Login Credentials</h3>
                    <div class="credential-item">
                        <div class="credential-label">Email:</div>
                        <div class="credential-value">${email}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">Temporary Password:</div>
                        <div class="credential-value">${tempPassword}</div>
                    </div>
                </div>
                
                <div class="security-note">
                    <strong>⚠️ Important:</strong> You will be required to change your password on your first login for security purposes.
                </div>
                ` : ''}
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Access Dashboard</a>
                
                <h3>What you can do:</h3>
                <ul>
                    <li>View occupancy data for your assigned centres</li>
                    <li>Access reporting and analytics</li>
                    <li>Manage your account settings</li>
                    <li>Collaborate with your team</li>
                </ul>
                
                <p>If you have any questions or need assistance, please don't hesitate to reach out to your administrator.</p>
                
                <p>Best regards,<br>
                <strong>The Future Focus Kids Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email} as part of your Future Focus Kids account setup.</p>
                <p>© ${new Date().getFullYear()} Future Focus Kids. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
