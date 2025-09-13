
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { supabaseUserService } from '@/lib/supabase-user-service';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, centreId } = body;

    console.log('📋 User data received:', { name, email, role, centreId });

    // Validate required fields
    if (!name || !email || !password || !role || !centreId) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user using Supabase
    const user = await supabaseUserService.createUser({
      name,
      email,
      password,
      role,
      centreId
    });

    // Send welcome email after successful user creation
    try {
      console.log('📧 Attempting to send welcome email to:', email);
      const { success, error: emailErrorMsg } = await sendWelcomeEmail(name, email, password);
      if (success) {
        console.log(`✅ Welcome email sent to ${email}`);
      } else {
        console.log(`⚠️ Failed to send welcome email to ${email}: ${emailErrorMsg ?? ''}`);
      }
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError);
      // Don't fail the user creation if email fails
    }

    console.log('✅ User creation successful:', user.id);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
