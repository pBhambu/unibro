"use client";
import { usePathname } from "next/navigation";
import { CounselorBro } from "./CounselorBro";

export function ConditionalCounselorBro() {
  const pathname = usePathname();
  
  // Don't show on landing page
  if (pathname === '/') {
    return null;
  }
  
  return <CounselorBro />;
}
