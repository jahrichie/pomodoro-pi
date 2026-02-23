import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing auth code' }, { status: 400 });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(`${baseUrl}/?import=1`);

    response.cookies.set('gcal_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    if (tokens.refresh_token) {
      response.cookies.set('gcal_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token exchange failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
