import { NextResponse } from 'next/server';
import { adminSupabase, hasServiceRoleKey } from '@/lib/admin-client';

// Shared helpers for Studio API routes.

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requireAdmin() {
  if (!hasServiceRoleKey) {
    return jsonError(
      'Server is not configured for admin operations. Set SUPABASE_SERVICE_ROLE_KEY.',
      503
    );
  }
  return null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export { adminSupabase };
