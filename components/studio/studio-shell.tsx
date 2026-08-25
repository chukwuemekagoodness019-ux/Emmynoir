'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { studioNav } from './nav';

// Studio authentication foundation.
//
// The Studio must be protected by real authentication and server-side
// authorization. The route name ("/studio") is NOT the security mechanism.
// This layout renders a gated shell; the actual auth gate is implemented in
// a later stage once Supabase auth is configured. Until then we render a
// clear "authentication required" state so no admin functionality is
// accidentally exposed as usable.

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-noir text-ivory transition-transform duration-300 ease-editorial md:static md:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span className="font-serif text-lg tracking-[0.2em] uppercase">
              Studio
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center text-ivory md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {studioNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/studio' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex flex-col gap-0.5 rounded px-3 py-2.5 transition-colors',
                    active
                      ? 'bg-ivory/10 text-ivory'
                      : 'text-ivory/70 hover:bg-ivory/5 hover:text-ivory'
                  )}
                >
                  <span className="text-sm">{item.label}</span>
                  <span className="text-[0.625rem] text-ivory/40">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute inset-x-0 bottom-0 border-t border-ivory/10 p-3">
            <button className="flex w-full items-center gap-2 rounded px-3 py-2.5 text-sm text-ivory/70 hover:bg-ivory/5 hover:text-ivory">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center text-foreground md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutDashboard className="h-4 w-4" />
                <span className="uppercase tracking-wider2">EMMY NOIR Studio</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Protected area
            </div>
          </header>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
