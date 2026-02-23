import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOAuth2Client, SCOPES } from '@/lib/google';

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state,
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
