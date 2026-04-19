import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    return NextResponse.json({ error: 'Нет API ключа' }, { status: 500 });
  }

  try {
    // Простейший запрос к Stability AI
    const response = await fetch("https://api.stability.ai/v1/user/account", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
    });

    const data = await response.json();
    return NextResponse.json({ 
      status: response.status, 
      ok: response.ok,
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}