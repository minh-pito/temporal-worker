import type * as Params from "../types/params";
import { checkVoucherValid } from "../shared/helper";
import { VoucherUnit } from "../enums/common";
import { supabase } from "../shared/supabase";

export class VoucherService {
  async calculateDiscount(
    params: Params.CalculateDiscount,
  ): Promise<{ discountAmount: number; discountShippingFee: number }> {
    const { voucherIds, shippingFee, subTotalPrice, userId } = params;
    let discountAmount = 0;
    let discountShippingFee = 0;

    const calculateVouchersAsync = voucherIds.map(async (voucherId: string) => {
      const voucher = await checkVoucherValid(supabase, userId, voucherId);

      if (voucher.unit === VoucherUnit.percent) {
        if (voucher.code === "FREE_SHIP") {
          discountShippingFee += Math.round(
            (shippingFee * voucher.value) / 100,
          );
        } else {
          discountAmount += Math.round((subTotalPrice * voucher.value) / 100);
        }
      } else {
        discountAmount += voucher.value;
      }
    });
    await Promise.all(calculateVouchersAsync);

    return { discountAmount, discountShippingFee };
  }
}
