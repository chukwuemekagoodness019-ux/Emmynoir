import { adminSupabase } from '@/lib/admin-client';
import { DivisionManager } from '@/components/studio/division-manager';

export const dynamic = 'force-dynamic';

export default async function StudioDivisionsPage() {
  const { data, error } = await adminSupabase
    .from('divisions')
    .select('id, name, slug, tagline, description, is_active, sort_order')
    .order('sort_order', { ascending: true });

  const divisions = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Divisions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage the main divisions of the house. EMMY LUXE can be kept inactive until launch.
        </p>
      </div>

      {error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading divisions: {error.message}
        </div>
      )}

      <DivisionManager divisions={divisions} />
    </div>
  );
}
