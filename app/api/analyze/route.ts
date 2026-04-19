import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const text = (formData.get('text') as string) || '';
    const file = formData.get('file') as File | null;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY не задан' }, { status: 500 });
    }

    let systemPrompt = '';
    switch (type) {
      case 'blood':
        systemPrompt = 'Ты — эксперт-гематолог и стоматолог. Анализируй анализы крови, указывай отклонения. Отвечай на русском.';
        break;
      case 'xray':
        systemPrompt = 'Ты — рентгенолог. Анализируй рентгеновский снимок, выяви кариес, воспаление. Отвечай на русском.';
        break;
      case 'oral':
        systemPrompt = 'Ты — стоматолог. Анализируй фото полости рта, найди проблемы. Отвечай на русском.';
        break;
      default:
        systemPrompt = 'Ты — медицинский ассистент. Отвечай на русском.';
    }

    let userContent: any;
    if (file && file.size > 0 && file.type.startsWith('image/')) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      userContent = [
        { type: 'text', text: text || 'Проанализируй изображение' },
        { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } },
      ];
    } else {
      userContent = text || 'Дай общую рекомендацию';
    }

    // Настройка прокси
    const proxyUrl = 'http://45.151.68.135:8080';
    const agent = new HttpsProxyAgent(proxyUrl);

    // Отправляем запрос через axios с агентом
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        httpsAgent: agent,
        proxy: false, // отключаем стандартный прокси, используем только agent
      }
    );

    const result = response.data.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in analyze API:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error?.message || error.message },
      { status: 500 }
    );
  }
}