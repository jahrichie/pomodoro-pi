# Pomodoro Pi

A touchscreen-optimized Pomodoro timer built with Next.js. Features a circular drag-to-set dial, a task list, and Google Calendar integration.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Calendar Integration (optional)

Import today's calendar events as timer tasks.

### 1. Create Google Cloud credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services > Library** and enable **Google Calendar API**
4. Go to **APIs & Services > Credentials** and click **Create Credentials > OAuth 2.0 Client ID**
5. Choose **Web application** as the type
6. Add your authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Raspberry Pi: `http://raspberrypi.local:3000/api/auth/google/callback`
   - Vercel: `https://your-app.vercel.app/api/auth/google/callback`

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BASE_URL=http://localhost:3000
```

### 3. Use it

Click **Import from Google Calendar** in the task list. You'll be redirected to Google's consent screen, then back to the app with your events ready to import.

## Deployment

### Vercel

Set the three environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BASE_URL`) in your Vercel project settings. Update the authorized redirect URI in Google Cloud to match your Vercel URL.

### Raspberry Pi

Run `npm run build && npm start` on the Pi. Set `BASE_URL` to the Pi's local address (e.g. `http://raspberrypi.local:3000`).
