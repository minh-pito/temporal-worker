import { initializeServices } from "./services";

export const createActivities = () => {
  const { cartService, voucherService, orderService, paymentService } =
    initializeServices();

  return {
    validateCart: cartService.validateCart,
    calculateDiscount: voucherService.calculateDiscount,
    createOrder: orderService.createOrder,
    createOrderItems: orderService.createOrderItems,
    createPayment: paymentService.createPayment,
    createTransaction: paymentService.createTransaction,
  };
};
