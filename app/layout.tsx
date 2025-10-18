import "./globals.css";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UniBro",
  description: "College admissions copilot with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
