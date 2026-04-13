import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim() === "") return "change background";
  
  try {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) return text;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a translator. Translate the following Russian text to English. Return ONLY the translated text, nothing else."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Ошибка перевода:", error);
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const promptText = formData.get('prompt') as string || "";
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'Не загружено фото' }, { status: 400 });
    }

    // Пробуем оба варианта названия переменной
    const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
    
    console.log("FAL_KEY exists:", !!FAL_KEY);
    
    if (!FAL_KEY) {
      return NextResponse.json({ success: false, error: 'Нет API ключа Fal.ai. Проверьте .env.local' }, { status: 500 });
    }

    fal.config({
      credentials: FAL_KEY,
    });

    const englishPrompt = await translateToEnglish(promptText);
    console.log(`Промпт: "${promptText}" -> "${englishPrompt}"`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    // Phota Edit через Fal.ai
    const result = await fal.subscribe("fal-ai/phota/edit", {
      input: {
        prompt: englishPrompt,
        image_urls: [imageDataUrl],
        num_images: 1,
        resolution: "1K",
        output_format: "png",
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
      },
    });

    const editedImageUrl = result.data?.images?.[0]?.url;
    
    if (!editedImageUrl) {
      return NextResponse.json({ success: false, error: 'Не удалось получить изображение' }, { status: 500 });
    }

    return NextResponse.json({ success: true, editedImageUrl });
  } catch (error: any) {
    console.error("❌ Ошибка Phota Edit:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}