import { proxyActivities, log } from "@temporalio/workflow";
import { ApplicationFailure } from "@temporalio/common";
import dayjs from "dayjs";
import { createActivities } from "./activities";
import type { CreateOrderPayload } from "./types/params";
import type { OrderItem, WorkflowPayload } from "./types/common";
import { toOrderItems } from "./shared/presentation";
import { calculateSubTotalPrice } from "./shared/helper";

type Activity = ReturnType<typeof createActivities>;

const {
  validateCart,
  calculateDiscount,
  createOrder,
  createOrderItems,
  createPayment,
  createTransaction,
} = proxyActivities<Activity>({
  startToCloseTimeout: "1 minute",
  retry: {
    initialInterval: "1 second",
    maximumInterval: "1 minute",
    backoffCoefficient: 2,
    maximumAttempts: 3,
    nonRetryableErrorTypes: ["InvalidAccountError", "InsufficientFundsError"],
  },
});

export async function createNewOrder(
  payload: CreateOrderPayload,
  workflow: WorkflowPayload,
) {
  try {
    const { user, supabaseJwt } = workflow;
    log.info("create_order", {
      payload,
      user: { userId: user.id, email: user.email },
    });

    const {
      note,
      session_id: sessionId,
      voucher_ids: voucherIds,
      delivery_address: deliveryAddress,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_later: deliveryLater,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      order_type: orderType,
      payment_method: paymentMethod,
      bank_code: bankCode,
      vnpay_callback_url: vnpayCallbackUrl,
      vat_info: vatInfo,
    } = payload;

    const { id: userId, email } = user;
    const now = dayjs().toISOString();
    let discountAmount = 0;
    let discountShippingFee = 0;

    const { shoppingSession, orderId } = await validateCart({
      sessionId,
      userId,
    });

    const {
      store_id: storeId,
      stores: store,
      shipping_fee: shippingFee,
      cart_items: cartItems,
    } = shoppingSession;
    const {
      // store_name: storeName,
      store_code: storeCode,
      partner_id: partnerId,
    } = store;

    const orderItems: OrderItem[] = toOrderItems({
      items: cartItems,
      orderId,
      createdAt: now,
    });
    const subTotalPrice = calculateSubTotalPrice(orderItems);

    if (voucherIds && voucherIds.length) {
      ({ discountAmount, discountShippingFee } = await calculateDiscount({
        userId,
        voucherIds,
        shippingFee,
        subTotalPrice,
      }));
    }

    const totalPrice = discountShippingFee
      ? subTotalPrice - discountAmount + (shippingFee - discountShippingFee)
      : subTotalPrice - discountAmount + shippingFee;

    if (!totalPrice || totalPrice < 0) {
      throw new ApplicationFailure(
        `Total price cannot be negative. Total price: ${totalPrice}`,
      );
    }

    const { orderCode } = await createOrder({
      orderId,
      storeId,
      orderType,
      storeCode,
      userId,
      partnerId,
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
      receiverName,
      receiverPhone,
      receiverEmail: email!,
      orderItems,
      paymentMethod,
      vatInfo,
    });

    await createOrderItems({ orderItems });

    const payment = await createPayment({
      paymentMethod,
      orderType,
      orderCode,
      orderId,
      totalPrice,
      bankCode,
      vnpayCallbackUrl,
      storeId,
      userId,
      supabaseJwt,
    });
    log.info("payment_created", { payment });

    await createTransaction({ txId: payment.txId });

    return "Order created successfully";
  } catch (error) {
    log.error("workflow_failed", { error });
    throw new ApplicationFailure(`Workflow failed. Error: ${error}`);
  }
}
