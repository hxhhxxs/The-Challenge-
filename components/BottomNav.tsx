"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home", icon: "M3 11l9-8 9 8M5 10v10h14V10M9 20v-6h6v6" },
  { href: "/check-in", label: "Log", icon: "M5 13l4 4L19 7" },
  { href: "/progress", label: "Progress", icon: "M4 19V5M8 17v-6M13 17V8M18 17v-9M4 19h17" },
  { href: "/learning", label: "Library", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 19.5v-15Z" },
  { href: "/tools", label: "More", icon: "M12 8h.01M12 12h.01M12 16h.01M4 12h.01M20 12h.01" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-black transition ${active ? "bg-emerald-100 text-emerald-900" : "text-slate-500 hover:bg-slate-50"}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
