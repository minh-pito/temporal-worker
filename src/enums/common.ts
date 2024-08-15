/**
 * ORDER
 */
export enum OrderStatus {
  draft = "draft",
  waiting = "waiting",
  received = "received",
  processing = "processing",
  delivering = "delivering",
  refunding = "refunding",
  refunded = "refunded",
  canceled = "canceled",
  completed = "completed",
}

export enum PartnerOrderStatus {
  created = "created",
  processing = "processing",
  canceled = "canceled",
  rejected = "rejected",
  missed = "missed",
  prepared = "prepared",
  completed = "completed",
}

export enum OrderType {
  XP = "XP",
  CT = "CT",
}

export enum OrderErrorCode {
  draft = 1000,
  waiting = 100,
  approved = 200,
  processing = 300,
  prepared = 301,
  delivering = 400,
  completed = 500,
  customer_canceled = 701,
  partner_canceled = 702,
  payment_failed = 704,
}

export enum VoucherType {
  all = "all",
  individual = "individual",
}

export enum VoucherUnit {
  percent = "percent",
  currency = "currency",
}

/**
 * ORDER EVENT
 */
export enum EventType {
  order_created = "order_created",
  customer_cancel = "customer_cancel",
  driver_request = "driver_request",
  driver_cancel = "driver_cancel",
}

export enum EventStatus {
  created = "created",
  timeout = "timeout",
  approved = "approved",
  rejected = "rejected",
}

/**
 * DRIVER SHIPPING
 */
export enum DeliveryStatus {
  received = "received",
  delivering = "delivering",
  canceled = "canceled",
  completed = "completed",
}

/**
 * PAYMENT
 */
export enum PaymentStatus {
  created = "created",
  completed = "completed",
  failed = "failed",
  pending = "pending",
  refunded = "refunded",
}

export enum PaymentGateway {
  vnpay = "vnpay",
  acb = "acb",
}

export enum PaymentType {
  DP = "DP", // direct payment
  AP = "AP", // debt
  RF = "RF", // refund
}

export enum PaymentMethod {
  qrcode = "qrcode",
  atm = "atm",
  visa = "visa",
  mastercard = "mastercard",
  jcb = "jcb",
  upi = "upi",
  amex = "amex",
}

export enum VNPayBankCodes {
  ATM = "ATM",
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  JCB = "JCB",
  UPI = "UPI",
  AMEX = "AMEX",
}

export enum TxErrorCode {
  init = 1000,
  success = 100,
  insufficient_funds = 401,
  invalid_card = 402,
  gateway_error = 403,
  tx_declined = 404,
  tx_timeout = 405,
  tx_cancelled = 406,
  unknow_error = 407,
  refund_error = 408,
  refund_rejected = 409,
  refunded = 500,
}
