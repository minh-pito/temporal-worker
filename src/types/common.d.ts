declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    supabaseJwt?: string;
  }
}

import type { User } from "@supabase/supabase-js";
import type { Request } from "express";

export interface WorkflowPayload {
  user: {
    id: string;
    email?: string;
  };
  supabaseJwt: string;
}

/*
 * ORDER ITEM, CART ITEM
 */
interface Option {
  choices: Choice[];
  option_id: string;
}

interface Item {
  id: string;
  name: string;
  base_price: string;
  preparation_time: number;
  options_and_choices: Array<Option>;
  raw_options_choices: Array<Option>;
}

export interface CartItem {
  items: Item;
  quantity: number;
  notes: string;
  raw_options_choices: string;
  total_price: number;
}

interface Choice {
  quantity: number;
  choice_id: string;
  choice_name: string;
  base_price: number;
}

export interface OrderItem {
  item: Item;
  item_id: string;
  price: number;
  quantity: number;
  total_price: number;
  notes: string;
  order_id: string;
  raw_options_choices: Array<Option> | string;
  created_at: string;
}

/*
 * MAILER
 */
export interface BaseMailPayload {
  subject: string;
  to: string;
  text?: string;
  metadata?: Record<string, string>;
}

export interface TemplateMailPayload {
  payload: Record<string, unknown> | Array<Record<string, unknown>>;
  mails: string[];
  templateId: string;
  subject: string;
}

export interface CartItemMail {
  item_name: string;
  item_amount: string;
  count: number;
  notes: string;
}

export interface OrderMailPayload {
  user_name: string;
  store_name: string;
  order_code: string;
  order_time: string;
  total_sub_amount: string;
  shipping_fee: string;
  voucher: string;
  total_paid: string;
  items: CartItemMail[];
  to: string[];
  link: string;
}
