import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'}/auth/update-password`,
    });
    if (error) {
      return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
  }
}
  }
}
