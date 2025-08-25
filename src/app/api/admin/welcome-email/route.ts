import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

   const { email, name, tempPassword } = await request.json();
   if (!email || !name) {
     return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
   }

   // OPTIONAL: ensure user exists
   const user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
   if (!user) {
     return NextResponse.json({ error: 'User not found' }, { status: 404 });
   }

   // Call the Supabase Edge Function to send the welcome email
   const { data, error } = await supabase.functions.invoke('send-welcome-email', {
     body: { name, email, password: tempPassword ?? '' },
   });
   if (error) {
     return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
   }

   return NextResponse.json({ message: 'Welcome email sent successfully', data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
    await prisma.$disconnect();
            .header p { color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .welcome { font-size: 20px; color: #1f2937; margin-bottom: 20px; }
            .credentials { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }

    // Call the Supabase Edge Function to send the welcome email
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { name, email, password: tempPassword ?? '' },
    });
    if (error) {
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Welcome email sent successfully', data }, { status: 200 });
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
                
                <p>If you have any questions or need assistance, please don&apos;t hesitate to reach out to your administrator.</p>
                
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
