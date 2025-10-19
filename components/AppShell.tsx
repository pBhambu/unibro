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
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
