import { NextRequest, NextResponse } from 'next/server';

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

    // Запрос через VPS прокси в Нидерландах
    const proxyResponse = await fetch('http://45.151.68.135:8080', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await proxyResponse.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    const result = data.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}