import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Симулируем запрос к phota-edit
  const formData = new FormData();
  // Просто проверяем, что API отвечает
  return NextResponse.json({ message: "Test endpoint works" });
}