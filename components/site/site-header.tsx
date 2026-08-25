'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { Brand } from './brand';
import { mainNav } from './nav';
import { useBag } from './bag-context';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useBag();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center md:justify-start">
          <Brand />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline text-sm uppercase tracking-wider2 text-foreground/80 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/bag"
            aria-label="Shopping bag"
            className="relative inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-noir px-1 text-[0.625rem] font-medium text-ivory">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        {/* Opaque overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-noir/70 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
        />
        {/* Drawer panel */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto bg-background shadow-2xl transition-transform duration-300 ease-editorial',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Brand asLink={false} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-4 font-serif text-2xl tracking-tight text-foreground transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/bag"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
            >
              <ShoppingBag className="h-4 w-4" />
              Shopping Bag {count > 0 && `(${count})`}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
