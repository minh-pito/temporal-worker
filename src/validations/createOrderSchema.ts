import { z } from "zod";
import { OrderType, PaymentMethod, VNPayBankCodes } from "../enums/common";

export const createOrderSchema = z.object({
  session_id: z
    .string({ message: "Session id must not be empty" })
    .uuid({ message: "Session id must be a valid uuid" }),
  voucher_ids: z
    .array(z.string().uuid({ message: "Voucher id must be a valid uuid" }))
    .optional(),
  note: z.string().optional(),
  receiver_name: z.string({ message: "Name must not be empty" }),
  receiver_phone: z
    .string({ message: "Phone must not be empty" })
    // .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .transform((val) => val.replace("+84", "0")),
  delivery_address: z.string({ message: "Delivery address must not be empty" }),
  delivery_date: z
    .string({ message: "Delivery date must not be empty" })
    .date("Invalid date format"),
  delivery_time: z.string().time("Invalid time format").optional(),
  delivery_later: z.boolean(),
  payment_method: z.nativeEnum(PaymentMethod, {
    message: "Payment method invalid",
  }),
  order_type: z.nativeEnum(OrderType, {
    message: "Order type invalid",
  }),
  vnpay_callback_url: z
    .string()
    .url({ message: "Vnpay callback url invalid" })
    .optional(),
  bank_code: z.nativeEnum(VNPayBankCodes).optional(),
  vat_info: z
    .object({
      name: z.string({ message: "VAT Name must not be empty" }),
      tax_code: z.string({ message: "VAT Tax code must not be empty" }),
      email: z.string().email({ message: "VAT Email must be valid" }),
      address: z.string({ message: "VAT Address must not be empty" }),
      is_default: z.boolean().default(false),
    })
    .optional(),
});
