"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Common container classes
  const containerClasses = "min-h-screen bg-gradient-to-br from-white via-[#f8fff8] to-[#f0fff0] dark:from-gray-900 dark:to-gray-800";
  
  // Main content classes
  const mainContentClasses = "bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/50";

  // Chat functionality is now handled by the global CounselorBro component

  if (isHomePage) {
    return (
      <div className={containerClasses}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${containerClasses} min-h-screen`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className={mainContentClasses}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
