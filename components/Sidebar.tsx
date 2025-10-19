"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Pencil, CalendarClock, University, MessageCircle, Settings } from "lucide-react";

const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full hover:bg-emerald-50 dark:hover:bg-amber-900/20 ${
        active ? "bg-emerald-100 dark:bg-amber-900/40 text-emerald-800 dark:text-amber-200" : "text-gray-700 dark:text-gray-200"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium hidden sm:inline">{label}</span>
    </Link>
  );
};

export function Sidebar() {
  return (
    <aside className="w-16 sm:w-60 p-3 sm:p-4 glass border-r border-gray-200/50 dark:border-gray-700/50 sticky top-0 h-screen overflow-y-auto">
      <Link href="/" className="flex items-center justify-center sm:justify-start gap-3 mb-6 group">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image 
            src="/logo.png" 
            alt="UniBro" 
            width={40} 
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="hidden sm:inline font-bold text-xl text-emerald-800 dark:text-amber-400 font-title group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition">
          UniBro
        </span>
      </Link>
      <nav className="flex flex-col gap-2">
        <NavItem href="/application" label="Application" icon={Pencil} />
        <NavItem href="/colleges" label="Colleges" icon={University} />
        <NavItem href="/plan" label="My Plan" icon={CalendarClock} />
        <NavItem href="/counselor" label="CounselorBro" icon={MessageCircle} />
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem href="/settings" label="Settings" icon={Settings} />
        </div>
      </nav>
    </aside>
  );
}
