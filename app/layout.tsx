import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ConditionalCounselorBro } from "@/components/ConditionalCounselorBro";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UniBro",
  description: "Your AI-powered college application assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-white via-[#f8fff8] to-[#f0fff0] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-['Poppins']">
        <AppShell>
          {children}
        </AppShell>
        <ConditionalCounselorBro />
      </body>
    </html>
  );
}
