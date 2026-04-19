import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const FAL_KEY = process.env.FAL_API_KEY;
    const proxyUrl = 'http://45.151.68.135:8080';
    
    console.log("🔑 API Key:", FAL_KEY ? "Есть" : "Нет");
    console.log("🌐 Прокси:", proxyUrl);
    
    // Минимальное тестовое изображение (1x1 пиксель, прозрачный PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageDataUrl = `data:image/png;base64,${testImageBase64}`;
    
    const requestBody = JSON.stringify({
      prompt: "make it blue",
      image_urls: [imageDataUrl],
      num_images: 1,
      resolution: "1K",
      output_format: "png",
    });
    
    console.log("📤 Отправка запроса в Fal.ai через прокси...");
    
    // Отправляем запрос через прокси (используем fetch с настройками прокси)
    const response = await fetch('https://fal.run/fal-ai/phota/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    console.log("📡 Статус ответа:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка:", errorText);
      return NextResponse.json({ 
        success: false, 
        status: response.status,
        error: errorText 
      });
    }
    
    const result = await response.json();
    console.log("✅ Успех! Получен ответ от Fal.ai");
    
    return NextResponse.json({
      success: true,
      status: response.status,
      hasImages: !!result.images,
      imagesCount: result.images?.length || 0,
      imageUrl: result.images?.[0]?.url || null,
      fullResponse: result
    });
    
  } catch (error: any) {
    console.error("❌ Ошибка:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}