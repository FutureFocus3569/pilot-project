import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { name, email } = await req.json();
  const result = await sendWelcomeEmail(name, email, 'test123');

  if (result.success) {
    return NextResponse.json({ success: true, message: 'Test email sent successfully' });
  }
  return NextResponse.json(
    { success: false, error: result.error ?? 'Failed to send test email' },
    { status: 500 }
  );
}
