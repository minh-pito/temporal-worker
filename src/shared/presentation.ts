import type { CartItem, OrderItem } from "../types/common";

type Props = {
  items: CartItem[];
  orderId: string;
  createdAt: string;
};

export function toOrderItems({
  items,
  orderId,
  createdAt,
}: Props): OrderItem[] {
  return items.map((item: CartItem) => ({
    item: item.items,
    item_id: item.items?.id,
    price: +item.items?.base_price,
    quantity: item.quantity,
    total_price: +item.total_price,
    notes: item.notes,
    order_id: orderId,
    raw_options_choices: item.raw_options_choices,
    created_at: createdAt,
  }));
}
