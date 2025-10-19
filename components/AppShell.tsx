"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/";

  if (hideSidebar) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-[#f8fff8] to-[#f0fff0] dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/50">
          {children}
        </div>
      </main>
    </div>
  );
}
