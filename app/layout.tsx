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
  title: "Side Project Graveyard",
  description: "Where side projects go to rest",
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
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-sm text-muted">
          Built for{" "}
          <a
            href="https://vibe-board-sand.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-light hover:text-accent transition-colors underline underline-offset-2"
          >
            VibeBoard
          </a>
        </footer>
      </body>
    </html>
  );
}
