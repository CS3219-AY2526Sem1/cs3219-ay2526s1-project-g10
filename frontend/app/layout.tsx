import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
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
      </body>
    </html>
  );
}