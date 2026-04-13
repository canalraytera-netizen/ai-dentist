import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Временно отключено для деплоя
  return NextResponse.json({ 
    success: true, 
    message: "Регистрация временно отключена" 
  });
}