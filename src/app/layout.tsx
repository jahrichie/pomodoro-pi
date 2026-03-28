import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Pi",
  description: "A touchscreen Pomodoro timer built for Raspberry Pi. Import tasks from Google Calendar, manage your queue, and stay focused — one session at a time.",
  openGraph: {
    title: "Pomodoro Pi",
    description: "A touchscreen Pomodoro timer built for Raspberry Pi. Import tasks from Google Calendar, manage your queue, and stay focused — one session at a time.",
    type: "website",
    images: [{ url: "/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomodoro Pi",
    description: "A touchscreen Pomodoro timer built for Raspberry Pi. Import tasks from Google Calendar, manage your queue, and stay focused — one session at a time.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
