import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProviders from "../providers/themeProviders";
import { AppProviders } from "../providers/appProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#1E3A8A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DashNote',
  },
  description: "Joan's DashNote",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProviders>
          <AppProviders>
            {children}
          </AppProviders>
        </ThemeProviders>
      </body>
    </html>
  );
}
