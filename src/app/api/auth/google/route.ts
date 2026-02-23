import { NextResponse } from 'next/server';
import { getOAuth2Client, SCOPES } from '@/lib/google';

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    return NextResponse.redirect(authUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth config error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
