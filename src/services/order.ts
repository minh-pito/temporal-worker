import dayjs from "dayjs";
import type * as Params from "../types/params";
import { DbTables } from "../shared/config";
import { supabase } from "../shared/supabase";
import { createOrderCode } from "../shared/helper";
import { OrderErrorCode, OrderStatus } from "../enums/common";

export class OrderService {
  async createOrder(params: Params.CreateOrder) {
    const {
      orderId,
      storeId,
      orderType,
      storeCode,
      userId,
      partnerId,
      receiverName,
      receiverPhone,
      receiverEmail,
      totalPrice,
      subTotalPrice,
      shippingFee,
      discountAmount,
      discountShippingFee,
      note,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      deliveryLater,
      orderItems,
      paymentMethod,
      vatInfo,
    } = params;

    const now = dayjs().toISOString();
    const orderCount = await createOrderCode(supabase, storeId, orderType);
    const orderCode = `${orderType}${storeCode}${orderCount}`;

    const newOrder = {
      id: orderId,
      customer_id: userId,
      partner_id: partnerId,
      store_id: storeId,
      total_price: totalPrice,
      sub_total_price: subTotalPrice,
      discount_amount: discountAmount,
      shipping_fee: shippingFee,
      discount_shipping_fee: discountShippingFee,
      note,
      delivery_address: deliveryAddress,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_later: deliveryLater,
      order_type: orderType,
      order_code: orderCode,
      order_count: orderCount,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_email: receiverEmail,
      order_items: orderItems,
      payment_method: paymentMethod,
      status: OrderStatus.draft,
      error_code: OrderErrorCode.draft,
      vat_info: vatInfo,
      created_at: now,
    };

    const order = await supabase.from(DbTables.Orders).insert(newOrder);
    if (order.status !== 201 || order.error) throw order.error;

    return { orderCode };
  }

  async createOrderItems(params: Params.CreateOrderItem) {
    const { orderItems } = params;

    const orderItem = await supabase
      .from(DbTables.OrderItems)
      .insert(orderItems);
    if (orderItem.status !== 201 || orderItem.error) throw orderItem.error;
  }
}
