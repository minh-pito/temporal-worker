import { z } from "zod";
import { createOrderSchema } from "../validations/createOrderSchema";
import type { OrderItem } from "./common";
import { OrderType, PaymentMethod } from "../enums/common";

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;

export interface ValidateCart {
  sessionId: string;
  userId: string;
}

export interface CalculateDiscount {
  userId: string;
  voucherIds: string[];
  shippingFee: number;
  subTotalPrice: number;
}

export interface CreateOrderItem {
  orderItems: OrderItem[];
}

export interface CreateOrder {
  orderId: string;
  storeId: string;
  orderType: string;
  storeCode: string;
  userId: string;
  partnerId: string;
  totalPrice: number;
  subTotalPrice: number;
  shippingFee: number;
  discountAmount: number;
  discountShippingFee: number;
  note?: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryLater: boolean;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  orderItems: OrderItem[];
  paymentMethod: PaymentMethod;
  vatInfo?: {
    name: string;
    tax_code: string;
    email: string;
    address: string;
    is_default: boolean;
  };
}

export interface CreatePayment {
  paymentMethod: PaymentMethod;
  orderType: OrderType;
  orderCode: string;
  orderId: string;
  totalPrice: number;
  bankCode?: string;
  vnpayCallbackUrl?: string;
  storeId: string;
  userId: string;
  supabaseJwt: string;
}

export interface CreateTransaction {
  txId: string;
}
