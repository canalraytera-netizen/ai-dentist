import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const editType = formData.get('editType') as string;
    const promptText = formData.get('prompt') as string || "";
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'Не загружено фото' }, { status: 400 });
    }

    // Демо-режим: возвращаем тестовое изображение
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Эффект: ${editType}`, 256, 250);
    ctx.font = '18px Arial';
    ctx.fillText(promptText || "Ваш запрос", 256, 320);
    
    const buffer = canvas.toBuffer('image/png');
    
    const timestamp = Date.now();
    const filename = `edited-demo-${timestamp}-${uuidv4()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const savedUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, editedImageUrl: savedUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}