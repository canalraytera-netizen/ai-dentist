import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
    }

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEYS || '{}');
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Ищем пользователя по email
    const user = rows.find(row => row.get('email') === email);

    if (!user) {
      return NextResponse.json({ subscribed: false, error: 'Пользователь не найден' });
    }

    const status = user.get('status');
    const expiresAt = user.get('expires_at');
    const isExpired = new Date(expiresAt) < new Date();

    if (status !== 'active' || isExpired) {
      return NextResponse.json({ subscribed: false, status: 'inactive' });
    }

    const plan = user.get('plan');
    
    // Лимиты по тарифам
    const limits = {
      standard: { chat: 500, image: 100, analysis: 50, video: 0 },
      pro: { chat: 2000, image: 500, analysis: 200, video: 20 },
      business: { chat: 999999, image: 999999, analysis: 999999, video: 999999 },
    };

    return NextResponse.json({ 
      subscribed: true, 
      plan: plan,
      limits: limits[plan as keyof typeof limits],
      expiresAt: expiresAt
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}