import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/site/section-heading';
import { getSettingsAsync } from '@/lib/data/site-settings';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getSettingsAsync();

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Talk to us"
        title="Contact"
        description="Reach the house through any of the channels below."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {settings.whatsappUrl && (
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-foreground animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <MessageCircle className="h-5 w-5 text-gold" />
            <div>
              <p className="eyebrow">WhatsApp</p>
              <p className="mt-1 text-sm">{settings.whatsappNumber || 'Message us'}</p>
            </div>
          </a>
        )}
        {settings.email && (
          <a
            href={`mailto:${settings.email}`}
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-foreground animate-fade-up"
            style={{ animationDelay: '60ms' }}
          >
            <Mail className="h-5 w-5 text-gold" />
            <div>
              <p className="eyebrow">Email</p>
              <p className="mt-1 text-sm">{settings.email}</p>
            </div>
          </a>
        )}
        {settings.phone && (
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-foreground animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <Phone className="h-5 w-5 text-gold" />
            <div>
              <p className="eyebrow">Phone</p>
              <p className="mt-1 text-sm">{settings.phone}</p>
            </div>
          </a>
        )}
        {settings.instagramUrl && (
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-foreground animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <Instagram className="h-5 w-5 text-gold" />
            <div>
              <p className="eyebrow">Instagram</p>
              <p className="mt-1 text-sm">Follow us</p>
            </div>
          </a>
        )}
        {settings.tiktokUrl && (
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-foreground animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gold"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3v6.3a6.5 6.5 0 1 1-6.5-6.5c.34 0 .67.03 1 .09v3.1a3.5 3.5 0 1 0 2.5 3.36V3h3z" />
            </svg>
            <div>
              <p className="eyebrow">TikTok</p>
              <p className="mt-1 text-sm">Watch us</p>
            </div>
          </a>
        )}
      </div>
      {settings.deliveryMessage && (
        <p className="mt-8 max-w-editorial text-sm text-muted-foreground">
          {settings.deliveryMessage}
        </p>
      )}
    </div>
  );
}
