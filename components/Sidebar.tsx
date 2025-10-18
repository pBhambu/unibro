"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil, CalendarClock, University } from "lucide-react";

const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full hover:bg-purple-100 ${
        active ? "bg-purple-100 text-brand-700" : "text-gray-700"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium hidden sm:inline">{label}</span>
    </Link>
  );
};

export function Sidebar() {
  return (
    <aside className="w-16 sm:w-60 p-3 sm:p-4 bg-white border-r border-gray-100">
      <div className="text-center sm:text-left font-semibold text-lg text-brand-700 mb-4">UniBro</div>
      <nav className="flex flex-col gap-2">
        <NavItem href="/application" label="Application" icon={Pencil} />
        <NavItem href="/colleges" label="Colleges" icon={University} />
        <NavItem href="/plan" label="My Plan" icon={CalendarClock} />
      </nav>
    </aside>
  );
}
