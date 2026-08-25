import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../_helpers';

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'payment-pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
});

const paymentSchema = z.object({
  payment_status: z.enum(['unpaid', 'pending', 'paid', 'refunded', 'failed']),
});

export async function GET() {
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('id, reference, customer_name, customer_phone, customer_email, delivery_location, status, payment_status, whatsapp_handoff_status, subtotal, delivery_fee, total, notes, created_at')
    .order('created_at', { ascending: false });

  if (error) return jsonError(error.message, 500);
  if (!orders || orders.length === 0) return NextResponse.json([]);

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await adminSupabase
    .from('order_items')
    .select('id, order_id, product_id, name, size, colour, quantity, unit_price, line_total')
    .in('order_id', orderIds);

  const itemsByOrder: Record<string, NonNullable<typeof items>> = {};
  for (const item of items ?? []) {
    const key = item.order_id as string;
    if (!itemsByOrder[key]) itemsByOrder[key] = [];
    itemsByOrder[key].push(item);
  }

  const result = orders.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] ?? [],
  }));

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const { orderId, ...updates } = body as {
    orderId: string;
    status?: string;
    payment_status?: string;
  };

  if (!orderId) return jsonError('orderId is required', 400);

  const updateData: Record<string, unknown> = {};
  if (updates.status) {
    const parsed = statusSchema.safeParse({ status: updates.status });
    if (!parsed.success) return jsonError('Invalid order status', 422);
    updateData.status = parsed.data.status;
  }
  if (updates.payment_status) {
    const parsed = paymentSchema.safeParse({ payment_status: updates.payment_status });
    if (!parsed.success) return jsonError('Invalid payment status', 422);
    updateData.payment_status = parsed.data.payment_status;
  }

  if (Object.keys(updateData).length === 0) {
    return jsonError('No valid fields to update', 400);
  }

  const { error } = await adminSupabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ updated: true });
}
