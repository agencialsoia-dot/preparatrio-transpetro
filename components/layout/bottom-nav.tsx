"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = NAV_ITEMS.filter((i) => i.primary);
  const extra = NAV_ITEMS.filter((i) => !i.primary);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-3 bottom-[64px] rounded-2xl border border-border bg-surface p-2 shadow-lg">
            <div className="grid grid-cols-2 gap-1">
              {extra.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive(href) ? "bg-brand-soft text-brand" : "text-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex">
          {primary.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium",
                  isActive(href) ? "text-brand" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          ))}
          <li className="flex-1">
            <button
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "flex w-full flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium",
                open ? "text-brand" : "text-muted",
              )}
            >
              <MoreHorizontal className="size-5" />
              Mais
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
