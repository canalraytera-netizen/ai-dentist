import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Нет prompt" }, { status: 400 });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // 🔴 ВАЖНО: логируем ответ (чтобы видеть ошибки)
    console.log("DEEPSEEK RESPONSE:", data);

    // ❌ если API вернул ошибку
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Ошибка DeepSeek" },
        { status: 500 }
      );
    }

    // ✅ нормальный ответ
    const text = data.choices?.[0]?.message?.content || "Нет ответа";

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}