// src/lib/email.ts

import { getSupabaseServer } from '@/lib/supabase';

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
  const supabase = getSupabaseServer();
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { name, email, password },
    });
    if (error) return { success: false, error: (error as any)?.message ?? String(error) };
    if (data && typeof data === 'object' && 'success' in (data as any)) {
      const d = data as { success: boolean; error?: string };
      return d.success ? { success: true } : { success: false, error: d.error ?? 'Unknown failure' };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('sendWelcomeEmail failed:', msg);
    return { success: false, error: msg };
  }
}
