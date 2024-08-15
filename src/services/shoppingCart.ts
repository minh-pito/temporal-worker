import { log } from "@temporalio/activity";
import type * as Params from "../types/params";
import { v4 as uuidv4 } from "uuid";
import { DbTables } from "../shared/config";
import { supabase } from "../shared/supabase";

export class CartService {
  async validateCart(params: Params.ValidateCart) {
    const { sessionId, userId } = params;

    log.info("validate_cart", { sessionId, userId });
    const { data: shoppingSession, error: shoppingSessionError } =
      await supabase
        .from(DbTables.ShoppingSessions)
        .select(
          `
      *,
      cart_items!inner( *, items (*) ),
      stores:store_id!inner (*)
    `,
        )
        .eq("id", sessionId)
        .eq("customer_id", userId)
        .single();

    if (shoppingSessionError) {
      throw new Error(
        `Shopping session not found ${shoppingSessionError.message}`,
      );
    }

    const { cart_items: cartItems, stores: store } = shoppingSession;

    if (!cartItems || !cartItems.length) {
      throw new Error("Cart items not found");
    }

    if (!store.is_active) {
      throw new Error("Store is not active");
    }

    const { error: partnerError } = await supabase
      .from(DbTables.Partners)
      .select("id, is_active, business_name, email, phone")
      .eq("id", store.partner_id)
      .eq("is_active", true)
      .single();

    if (partnerError) {
      throw new Error(`Partner error: ${partnerError.message}`);
    }

    const orderId = uuidv4();
    return { shoppingSession, orderId };
  }
}
