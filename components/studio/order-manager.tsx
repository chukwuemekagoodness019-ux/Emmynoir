'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

type OrderItem = {
  id: string;
  name: string;
  size: string | null;
  colour: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: string;
  reference: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_location: string | null;
  status: string;
  payment_status: string;
  whatsapp_handoff_status: string;
  subtotal: number;
  delivery_fee: number | null;
  total: number | null;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
};

const ORDER_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'payment-pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUSES = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    'payment-pending': 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

function paymentBadgeClass(status: string): string {
  const map: Record<string, string> = {
    unpaid: 'bg-muted text-muted-foreground',
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    refunded: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderManager({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (orderId: string, field: 'status' | 'payment_status', value: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch('/api/studio/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, [field]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Order updated' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not update order', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="surface-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No orders yet. Orders will appear here when customers place them.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} className="surface-card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-base">{order.reference}</span>
                  <span className={`rounded px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 ${statusBadgeClass(order.status)}`}>
                    {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 ${paymentBadgeClass(order.payment_status)}`}>
                    {PAYMENT_STATUSES.find((p) => p.value === order.payment_status)?.label ?? order.payment_status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {order.customer_name ?? 'Guest'} · {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border p-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Customer info */}
                  <div className="flex flex-col gap-2">
                    <h3 className="eyebrow">Customer</h3>
                    <dl className="space-y-1.5 text-sm">
                      <div className="flex gap-2"><dt className="text-muted-foreground">Name:</dt><dd>{order.customer_name ?? 'Not provided'}</dd></div>
                      <div className="flex gap-2"><dt className="text-muted-foreground">Phone:</dt><dd>{order.customer_phone ?? 'Not provided'}</dd></div>
                      <div className="flex gap-2"><dt className="text-muted-foreground">Email:</dt><dd>{order.customer_email ?? 'Not provided'}</dd></div>
                      <div className="flex gap-2"><dt className="text-muted-foreground">Delivery:</dt><dd>{order.delivery_location ?? 'Not provided'}</dd></div>
                    </dl>
                    {order.notes && (
                      <div className="mt-2">
                        <span className="eyebrow">Notes</span>
                        <p className="mt-1 text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="eyebrow">WhatsApp Handoff</span>
                      <p className="mt-1 text-sm capitalize">{order.whatsapp_handoff_status}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2">
                    <h3 className="eyebrow">Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="rounded border border-border px-3 py-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.name}</span>
                            <span>{formatPrice(item.line_total)}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {[item.size, item.colour].filter(Boolean).join(' · ') || 'Standard'} · Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
                      <span className="eyebrow">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.delivery_fee != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>{formatPrice(order.delivery_fee)}</span>
                      </div>
                    )}
                    {order.total != null && (
                      <div className="flex justify-between border-t border-border pt-2 text-sm font-medium">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status controls */}
                <div className="mt-6 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <label className="eyebrow block">Order Status</label>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleUpdateStatus(order.id, 'status', v)}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="eyebrow block">Payment Status</label>
                    <Select
                      value={order.payment_status}
                      onValueChange={(v) => handleUpdateStatus(order.id, 'payment_status', v)}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {order.customer_phone && (
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-noir px-4 py-2 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Contact customer on WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
