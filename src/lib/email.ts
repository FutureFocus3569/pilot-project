// src/lib/email.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Minimal inline client. If you have a shared client (e.g. "@/lib/supabaseClient"),
// you can delete these two lines and import that client instead.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EmailResult = { success: boolean; error?: string };

/**
 * Sends a welcome email via Supabase Edge Function `send-welcome-email`.
 * Always returns { success, error? } — never a bare boolean.
 */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  password: string
): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { name, email, password }, // plain object payload
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { success: false, error: (error as any)?.message ?? String(error) };
    }

    // If your function returns { success: boolean, error?: string }
    if (data && typeof data === 'object' && 'success' in (data as any)) {
      const d = data as { success: boolean; error?: string };
      return d.success ? { success: true } : { success: false, error: d.error ?? 'Unknown failure' };
    }

    // Otherwise assume success when no error was thrown
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('sendWelcomeEmail failed:', msg);
    return { success: false, error: msg };
  }
}
