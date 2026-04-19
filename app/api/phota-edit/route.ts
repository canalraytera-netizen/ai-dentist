import { NextRequest, NextResponse } from 'next/server';

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
  const startTime = Date.now();
  
  try {
    console.log("=".repeat(50));
    console.log("📸 PHOTA EDIT через прокси");
    console.log("=".repeat(50));
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const promptText = formData.get('prompt') as string || "";
    
    console.log(`📝 Промпт: "${promptText}"`);
    console.log(`📁 Файл: ${file?.name}, размер: ${(file?.size / 1024).toFixed(2)} KB`);
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'Не загружено фото' }, { status: 400 });
    }

    const FAL_KEY = process.env.FAL_API_KEY;
    
    if (!FAL_KEY) {
      return NextResponse.json({ success: false, error: 'Нет API ключа Fal.ai' }, { status: 500 });
    }

    // Перевод промпта
    const englishPrompt = await translateToEnglish(promptText);
    console.log(`🌐 Английский промпт: "${englishPrompt}"`);

    // Конвертация в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    console.log(`✅ Base64 готов, размер: ${(base64Image.length / 1024).toFixed(2)} KB`);

    // Отправка запроса в Fal.ai
    console.log("🚀 Отправка запроса в Fal.ai...");
    
    const requestBody = JSON.stringify({
      prompt: englishPrompt,
      image_urls: [imageDataUrl],
      num_images: 1,
      resolution: "1K",
      output_format: "png",
    });
    
    const response = await fetch('https://fal.run/fal-ai/phota/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`📡 Статус: ${response.status} (${elapsed}с)`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка:`, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Fal.ai ошибка ${response.status}` 
      }, { status: response.status });
    }
    
    const result = await response.json();
    console.log("📦 Ответ от Fal.ai:", JSON.stringify(result, null, 2));
    
    // ПРАВИЛЬНОЕ получение URL изображения
    const editedImageUrl = result.images?.[0]?.url;
    
    if (!editedImageUrl) {
      console.error("❌ Не найден URL в ответе:", result);
      return NextResponse.json({ 
        success: false, 
        error: 'Не удалось получить URL изображения' 
      }, { status: 500 });
    }

    console.log(`✅ Успех! URL: ${editedImageUrl}`);
    console.log("=".repeat(50));
    
    // Возвращаем результат
    return NextResponse.json({ 
      success: true, 
      editedImageUrl: editedImageUrl 
    });
    
  } catch (error: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Ошибка после ${elapsed}с:`, error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}