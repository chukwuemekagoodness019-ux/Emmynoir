// Centralized site settings access.
//
// This module bridges the old synchronous `getSettings()` call (used by
// Stage 1 server components) with the new async database fetch in
// `lib/data/site-settings`. Server components that can await should call
// `getSettingsAsync()` from `lib/data/site-settings` directly.

import { fallbackSettings, type ResolvedSiteSettings } from '@/lib/data/site-settings-fallback';

export type { ResolvedSiteSettings } from '@/lib/data/site-settings-fallback';
export type { SiteSettings } from '@/lib/types';

export const defaultSettings: ResolvedSiteSettings = fallbackSettings;

export function getSettings(): ResolvedSiteSettings {
  return fallbackSettings;
}

export { getSettingsAsync } from '@/lib/data/site-settings';
