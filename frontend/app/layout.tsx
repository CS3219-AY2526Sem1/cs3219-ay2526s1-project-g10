import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { SessionWatcher } from "./SessionWatcher"; // likely uses next/navigation hooks
import { ThemeProvider } from "next-themes";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peer Prep",
  description: "Peer programming preparation platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const runtimeEnv = {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "",
    NEXT_PUBLIC_USER_API: process.env.NEXT_PUBLIC_USER_API ?? "",
    NEXT_PUBLIC_MATCH_API: process.env.NEXT_PUBLIC_MATCH_API ?? "",
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK ?? "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_COLLAB_WS_URL: process.env.NEXT_PUBLIC_COLLAB_WS_URL ?? "",
    NEXT_PUBLIC_COLLAB_URL: process.env.NEXT_PUBLIC_COLLAB_URL ?? "",
  };

  const serializedEnv = JSON.stringify(runtimeEnv).replace(/</g, "\\u003c");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {/* Wrap ONLY components that use client navigation/search hooks */}
            <Suspense fallback={null}>
              <SessionWatcher />
            </Suspense>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Script
          id="runtime-env"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `window.__ENV=${serializedEnv};` }}
        />
      </body>
    </html>
  );
}