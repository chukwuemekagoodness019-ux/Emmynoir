import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/data/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryLocation,
      notes,
      items,
      subtotal,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json(
        { error: 'Invalid subtotal' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: customerName?.trim() || undefined,
      customerPhone: customerPhone?.trim() || undefined,
      customerEmail: customerEmail?.trim() || undefined,
      deliveryLocation: deliveryLocation?.trim() || undefined,
      notes: notes?.trim() || undefined,
      items: items.map(
        (item: {
          productId?: string;
          name: string;
          size?: string;
          colour?: string;
          quantity: number;
          unitPrice: number;
        }) => ({
          productId: item.productId,
          name: item.name,
          size: item.size,
          colour: item.colour,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
      ),
      subtotal,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
