import Link from 'next/link';
import { Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
import { Brand } from './brand';
import { mainNav } from './nav';
import { getSettingsAsync } from '@/lib/data/site-settings';

export async function SiteFooter() {
  const settings = await getSettingsAsync();

  return (
    <footer className="border-t border-border bg-noir text-ivory">
      <div className="container grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Brand
            asLink={false}
            className="text-ivory [&>span:first-child]:text-ivory"
          />
          <p className="mt-4 max-w-xs text-sm text-ivory/70">
            {settings.aboutShort}
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-ivory/60">Explore</h3>
          <ul className="mt-4 space-y-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-underline text-sm text-ivory/80 hover:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-ivory/60">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/80">
            <li>
              <a
                href={settings.whatsappUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ivory"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 hover:text-ivory"
              >
                <Mail className="h-4 w-4" /> {settings.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${(settings.phone ?? '').replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 hover:text-ivory"
              >
                <Phone className="h-4 w-4" /> {settings.phone ?? 'N/A'}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-ivory/60">Follow</h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/80">
            <li>
              <a
                href={settings.instagramUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ivory"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </li>
            <li>
              <a
                href={settings.tiktokUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ivory"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3v6.3a6.5 6.5 0 1 1-6.5-6.5c.34 0 .67.03 1 .09v3.1a3.5 3.5 0 1 0 2.5 3.36V3h3z" />
                </svg>
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-ivory/50 md:flex-row">
          <p>© {new Date().getFullYear()} EMMY NOIR. All rights reserved.</p>
          <p className="tracking-wider2 uppercase">EMMY WEARS · EMMY JEWELRIES</p>
        </div>
      </div>
    </footer>
  );
}
