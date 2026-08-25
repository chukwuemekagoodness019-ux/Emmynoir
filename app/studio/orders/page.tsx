import { adminSupabase } from '@/lib/admin-client';
import { OrderManager } from '@/components/studio/order-manager';

export const dynamic = 'force-dynamic';

type OrderItem = {
  id: string;
  order_id: string;
  name: string;
  size: string | null;
  colour: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type OrderRow = {
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
};

export default async function StudioOrdersPage() {
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('id, reference, customer_name, customer_phone, customer_email, delivery_location, status, payment_status, whatsapp_handoff_status, subtotal, delivery_fee, total, notes, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="editorial-heading text-3xl">Orders</h1>
        </div>
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading orders: {error.message}
        </div>
      </div>
    );
  }

  const orderList = (orders ?? []) as OrderRow[];
  const orderIds = orderList.map((o) => o.id);

  let itemsByOrder: Record<string, OrderItem[]> = {};
  if (orderIds.length > 0) {
    const { data: itemRows } = await adminSupabase
      .from('order_items')
      .select('id, order_id, name, size, colour, quantity, unit_price, line_total')
      .in('order_id', orderIds);

    for (const item of (itemRows ?? []) as OrderItem[]) {
      (itemsByOrder[item.order_id] ??= []).push(item);
    }
  }

  const ordersWithItems = orderList.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] ?? [],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {orderList.length} order{orderList.length !== 1 ? 's' : ''}. Click an order to view details and update status.
        </p>
      </div>

      <OrderManager orders={ordersWithItems} />
    </div>
  );
}
