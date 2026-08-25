import { supabase } from '@/lib/supabase-client';
import type { Order, OrderItem, OrderStatus, PaymentStatus, WhatsAppHandoffStatus } from '@/lib/types';
import { generateOrderReference } from '@/lib/format';

export type CreateOrderInput = {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryLocation?: string;
  notes?: string;
  items: {
    productId?: string;
    name: string;
    size?: string;
    colour?: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const reference = generateOrderReference();

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      reference,
      customer_name: input.customerName ?? null,
      customer_phone: input.customerPhone ?? null,
      customer_email: input.customerEmail ?? null,
      delivery_location: input.deliveryLocation ?? null,
      notes: input.notes ?? null,
      status: 'new',
      payment_status: 'unpaid',
      whatsapp_handoff_status: 'pending',
      subtotal: input.subtotal,
    })
    .select('id, reference, customer_name, customer_phone, customer_email, delivery_location, status, payment_status, whatsapp_handoff_status, subtotal, delivery_fee, total, notes')
    .single();

  if (orderError) throw orderError;
  if (!orderRow) throw new Error('Failed to create order');

  const orderItems = input.items.map((item) => ({
    order_id: orderRow.id,
    product_id: item.productId ?? null,
    name: item.name,
    size: item.size ?? null,
    colour: item.colour ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
  }));

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select('id, product_id, name, size, colour, quantity, unit_price, line_total');

  if (itemsError) throw itemsError;

  return {
    id: orderRow.id,
    reference: orderRow.reference,
    customerName: orderRow.customer_name,
    customerPhone: orderRow.customer_phone,
    customerEmail: orderRow.customer_email,
    deliveryLocation: orderRow.delivery_location,
    status: orderRow.status as OrderStatus,
    paymentStatus: orderRow.payment_status as PaymentStatus,
    whatsappHandoffStatus: orderRow.whatsapp_handoff_status as WhatsAppHandoffStatus,
    subtotal: Number(orderRow.subtotal),
    deliveryFee: orderRow.delivery_fee != null ? Number(orderRow.delivery_fee) : null,
    total: orderRow.total != null ? Number(orderRow.total) : null,
    notes: orderRow.notes,
    items: (itemRows ?? []).map(mapOrderItem),
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, reference, customer_name, customer_phone, customer_email,
      delivery_location, status, payment_status, whatsapp_handoff_status,
      subtotal, delivery_fee, total, notes
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const orders = data ?? [];
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, name, size, colour, quantity, unit_price, line_total')
    .in('order_id', orderIds);

  if (itemsError) throw itemsError;

  const itemsByOrder = (itemRows ?? []).reduce((acc, row) => {
    const key = row.order_id as string;
    (acc[key] ??= []).push(row);
    return acc;
  }, {} as Record<string, Record<string, unknown>[]>);

  return orders.map((row) => ({
    id: row.id,
    reference: row.reference,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryLocation: row.delivery_location,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    whatsappHandoffStatus: row.whatsapp_handoff_status as WhatsAppHandoffStatus,
    subtotal: Number(row.subtotal),
    deliveryFee: row.delivery_fee != null ? Number(row.delivery_fee) : null,
    total: row.total != null ? Number(row.total) : null,
    notes: row.notes,
    items: (itemsByOrder[row.id] ?? []).map(mapOrderItem),
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', orderId);

  if (error) throw error;
}

export async function updateWhatsAppHandoffStatus(
  orderId: string,
  handoffStatus: WhatsAppHandoffStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ whatsapp_handoff_status: handoffStatus })
    .eq('id', orderId);

  if (error) throw error;
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: (row.product_id as string) ?? null,
    name: row.name as string,
    size: (row.size as string) ?? null,
    colour: (row.colour as string) ?? null,
    quantity: row.quantity as number,
    unitPrice: Number(row.unit_price ?? 0),
    lineTotal: Number(row.line_total ?? 0),
  };
}
