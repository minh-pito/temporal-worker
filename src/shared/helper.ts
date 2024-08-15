import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderItem } from "../types/common";
import dayjs from "dayjs";
import { DbTables } from "./config";
import { OrderType, VoucherUnit } from "../enums/common";

export function calculateSubTotalPrice(orderItems: OrderItem[]) {
  return orderItems.reduce((sum, item) => sum + item.total_price, 0);
}

export async function createOrderCode(
  supabase: any,
  storeId: string,
  orderType: string,
) {
  const { data: lastOrder } = await supabase
    .from(DbTables.Orders)
    .select("id, order_count, store_id")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastOrder && lastOrder.order_count) {
    const result = generateOrderCode(
      orderType,
      `${orderType}${lastOrder.order_count}`,
    );

    return result.codeNumberString;
  }

  return "0001";
}

function generateOrderCode(orderType: string, currentCode: string) {
  // Define the prefix and character set for each order type
  const orderPrefixes: Record<string, string> = {
    XP: "XP",
    CT: "CT",
  };

  // Extract the order type prefix and current code number
  const prefix = orderPrefixes[orderType];
  let codeNumber = parseInt(currentCode.substring(prefix.length));
  codeNumber++;
  const codeNumberString = codeNumber.toString().padStart(4, "0");

  // Generate the final order code
  const orderCode = prefix + codeNumberString;

  // Return the unique order code
  return { orderCode, codeNumberString };
}

export const checkVoucherValid = async (
  supabase: any,
  userId: string,
  voucherId: string,
) => {
  const [
    { data: voucher, error: voucherError },
    { data: userVoucher, error: userVoucherError },
  ] = await Promise.all([
    supabase
      .from(DbTables.Vouchers)
      .select("*")
      .eq("id", voucherId)
      .gte("valid_until", dayjs().toISOString())
      .single(),
    supabase
      .from(DbTables.UserVouchers)
      .select("*")
      .eq("user_id", userId)
      .eq("voucher_id", voucherId)
      .single(),
  ]);

  if (voucherError) throw new Error(`Voucher error: ${voucherError.message}`);
  if (userVoucherError) {
    throw new Error(`User Voucher error: ${userVoucherError.message}`);
  }

  if (!userVoucher || !voucher) {
    return { unit: VoucherUnit.currency, value: 0, code: "" };
  }

  const { value, max_usage, value_unit } = voucher;
  const { created_at } = userVoucher;

  const usage_count = userVoucher.usage_count || 0;

  if (usage_count >= max_usage) {
    throw new Error("Voucher usage limit exceeded");
  }

  const voucherDate = dayjs(created_at).add(30, "days");
  const currentDate = dayjs();
  const diff = currentDate.diff(voucherDate, "minutes");

  if (diff > 0) {
    throw new Error("Voucher expired");
  }

  return { unit: value_unit, value, code: voucher.voucher_code };
};

export async function createTxCode(client: SupabaseClient, type: OrderType) {
  const code = generateTxCode(type);

  const tx = await client
    .from(DbTables.Transactions)
    .select()
    .eq("tx_code", code)
    .single();

  if (tx.data) {
    return await createTxCode(client, type);
  }

  return code;
}

export function generateTxCode(type: OrderType) {
  const prefix: string = type;

  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = 12;
  let txCode = prefix;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    txCode += characters.charAt(randomIndex);
  }

  return txCode;
}
