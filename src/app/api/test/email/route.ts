import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

// POST /api/test/email - Test email sending
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    const result = await sendWelcomeEmail({
      name,
      email,
      password: 'test123', // Test password
      organizationName: 'Future Focus Early Learning',
      loginUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001'
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error 
    }, { status: 500 });
  }
}
