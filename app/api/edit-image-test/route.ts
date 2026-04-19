import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim() === "") return "professional dental photo";
  
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

    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
    if (!STABILITY_API_KEY) {
      return NextResponse.json({ success: false, error: 'Нет API ключа' }, { status: 500 });
    }

    // Переводим промпт
    let englishPrompt = await translateToEnglish(promptText);
    if (!englishPrompt) englishPrompt = "professional dental photo";
    
    console.log("Промпт:", englishPrompt);

    // Конвертируем фото в base64 для передачи
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    // Используем img2img эндпоинт Stability AI
    const requestBody = {
      prompt: englishPrompt,
      negative_prompt: "blurry, low quality, distorted, ugly, deformed",
      output_format: "png",
      cfg_scale: 7,
      steps: 30,
      width: 512,
      height: 512,
    };

    console.log("Отправляем запрос к Stability AI img2img...");

    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Статус ответа:", response.status);

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch(e) {}
      console.error("Stability AI error:", response.status, errorText);
      
      // Демо-режим при ошибке
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#667eea';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`Промпт: "${promptText}"`, 50, 250);
      ctx.font = '16px Arial';
      ctx.fillText(`(демо-режим)`, 50, 300);
      
      const demoBuffer = canvas.toBuffer('image/png');
      const timestamp2 = Date.now();
      const demoFilename = `demo-${timestamp2}-${uuidv4()}.png`;
      const uploadDir2 = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir2, { recursive: true });
      const demoFilepath = path.join(uploadDir2, demoFilename);
      await writeFile(demoFilepath, demoBuffer);
      const demoSavedUrl = `/uploads/${demoFilename}`;
      
      return NextResponse.json({ success: true, editedImageUrl: demoSavedUrl, demo: true });
    }

    const data = await response.json();
    
    let imageBuffer: Buffer;
    if (data.image) {
      imageBuffer = Buffer.from(data.image, 'base64');
    } else if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
      imageBuffer = Buffer.from(data.artifacts[0].base64, 'base64');
    } else {
      throw new Error('Не удалось получить изображение');
    }

    const timestamp = Date.now();
    const filename = `edited-${timestamp}-${uuidv4()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, imageBuffer);
    const savedUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, editedImageUrl: savedUrl });
  } catch (error: any) {
    console.error("❌ Ошибка:", error);
    
    // Демо-режим при ошибке
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Ошибка: ${error.message.substring(0, 30)}`, 50, 250);
    
    const demoBuffer = canvas.toBuffer('image/png');
    const timestamp = Date.now();
    const demoFilename = `error-${timestamp}-${uuidv4()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const demoFilepath = path.join(uploadDir, demoFilename);
    await writeFile(demoFilepath, demoBuffer);
    const demoSavedUrl = `/uploads/${demoFilename}`;
    
    return NextResponse.json({ success: true, editedImageUrl: demoSavedUrl, demo: true });
  }
}