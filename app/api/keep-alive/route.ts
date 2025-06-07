import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Realizar una consulta simple a la tabla settings
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection is alive',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to keep connection alive',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 