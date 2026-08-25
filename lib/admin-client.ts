import { createClient } from '@supabase/supabase-js';

// Admin Supabase client using the service role key.
//
// This client bypasses RLS and is used ONLY in server-side contexts
// (Next.js API routes, server components) for admin mutations.
// It must NEVER be imported in client-side code.
//
// The service role key must be configured in the environment as
// SUPABASE_SERVICE_ROLE_KEY. If it is not yet set, the client falls
// back to the anon key — admin writes will fail via RLS until the
// key is configured, which is the correct secure behavior.

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  '';

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ??
  '';

const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  '';

// Use service role key if available; otherwise fall back to anon.
// When using anon, RLS will block admin writes — this is intentional
// and secure. Configure SUPABASE_SERVICE_ROLE_KEY to enable writes.
const key = serviceRoleKey || anonKey;

export const adminSupabase = createClient(supabaseUrl, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const hasServiceRoleKey = Boolean(serviceRoleKey);
