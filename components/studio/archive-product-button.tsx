'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function ArchiveProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(`/api/studio/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to archive');
      toast({ title: 'Product archived' });
      router.push('/studio/products');
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not archive product.', variant: 'destructive' });
    } finally {
      setArchiving(false);
    }
  };

  if (!confirming) {
    return (
      <Button
        variant="outline"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground"
      >
        <Archive className="mr-2 h-4 w-4" /> Archive
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Archive this product?</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleArchive}
        disabled={archiving}
      >
        {archiving ? 'Archiving...' : 'Confirm'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
