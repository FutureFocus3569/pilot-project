import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { email, name, tempPassword } = await request.json();
  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and name are required" },
      { status: 400 },
    );
  }

  const { error } = await supabase.functions.invoke("send-welcome-email", {
    body: { name, email, password: tempPassword ?? "" },
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Welcome email sent successfully" },
    { status: 200 },
  );
}
