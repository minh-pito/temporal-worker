import { v4 as uuidv4 } from "uuid";
import { log } from "@temporalio/activity";
import dayjs from "dayjs";

import type * as Params from "../types/params";
import { PaymentGateway, PaymentMethod } from "../enums/common";
import { invokeFunc, supabase } from "../shared/supabase";
import { createTxCode } from "../shared/helper";

export class PaymentService {
  async createPayment(params: Params.CreatePayment) {
    const {
      paymentMethod,
      orderType,
      orderCode,
      orderId,
      totalPrice,
      bankCode,
      storeId,
      userId,
      vnpayCallbackUrl,
      supabaseJwt,
    } = params;

    const channelName = `user:${userId}`;
    const channel = supabase.channel(channelName);

    const now = dayjs().toISOString();
    const txId = uuidv4();
    const txCode = await createTxCode(supabase, orderType);
    const paymentGateway =
      paymentMethod === PaymentMethod.qrcode
        ? PaymentGateway.acb
        : PaymentGateway.vnpay;

    let paymentInfo: Record<string, unknown> = {};
    let metadata = {};

    /*
     * CREATE PAYMENT
     */
    switch (paymentGateway) {
      case PaymentGateway.vnpay: {
        const { data: generateURLPayment, errorMessage } = await invokeFunc(
          supabase,
          "payment-vnpay",
          {
            headers: {
              "x-invoke-func": "create-url-payment",
              Authorization: `Bearer ${supabaseJwt}`,
            },
            body: {
              payload: {
                tx_code: txCode,
                order_code: orderCode,
                order_id: orderId,
                amount: totalPrice,
                bank_code: bankCode,
                callback_url: vnpayCallbackUrl,
              },
            },
          },
        );

        if (errorMessage) {
          log.error(`Payment VNPAY error: ${errorMessage}`);
          throw new Error(`Payment VNPAY error: ${errorMessage}`);
        }

        const { redirectUrl, params } = generateURLPayment.data;

        paymentInfo = { redirectUrl };
        metadata = {
          [now]: params,
        };
        break;
      }
      case PaymentGateway.acb: {
        const { data: generateQRCode, errorMessage } = await invokeFunc(
          supabase,
          "payment-acb",
          {
            headers: {
              "x-invoke-func": "create-qr-code",
              Authorization: `Bearer ${supabaseJwt}`,
            },
            body: {
              payload: {
                order_id: orderId,
                tx_id: txId,
                order_code: orderCode,
                store_id: storeId,
              },
            },
          },
        );

        if (errorMessage) {
          log.error(`Payment ACB error: ${errorMessage}`);
          throw new Error(`Payment ACB error: ${errorMessage}`);
        }

        const { responseStatus, responseBody } = generateQRCode.data;

        paymentInfo = {
          responseStatus,
          responseBody: { qrDataUrl: responseBody?.qrDataUrl },
        };
        break;
      }
      default:
        throw new Error(`Payment gateway not supported: ${paymentGateway}`);
    }

    channel.send({
      type: "broadcast",
      event: `order:create:${orderId}`,
      payload: { orderId, orderCode, txId, txCode, totalPrice, paymentInfo },
    });

    return { paymentInfo, metadata, txId };
  }

  async createTransaction(params: Params.CreateTransaction) {
    const { txId } = params;
    log.debug("Creating transaction", { txId });
  }
}
