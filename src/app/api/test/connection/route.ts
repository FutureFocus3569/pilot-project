import { supabaseUserService } from '@/lib/supabase-user-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connectionTest = await supabaseUserService.testConnection();
    
    return NextResponse.json({
      success: true,
      connection: connectionTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: String(error)
    });
  }
}
