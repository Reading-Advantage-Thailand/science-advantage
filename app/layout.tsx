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
  title: "Science Advantage",
  description: "K-12 science curriculum platform skeleton.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased text-foreground`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
              <span className="text-lg font-semibold tracking-tight">Science Advantage</span>
              <span className="text-sm text-muted-foreground">Sprint S0 · Skeleton + Auth</span>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-border bg-background/80 py-4">
            <div className="mx-auto w-full max-w-5xl px-4 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Science Advantage. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
