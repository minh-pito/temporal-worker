import { CartService } from "./shoppingCart";
import { OrderService } from "./order";
import { VoucherService } from "./voucher";
import { PaymentService } from "./payment";

export const initializeServices = () => {
  return {
    cartService: new CartService(),
    orderService: new OrderService(),
    voucherService: new VoucherService(),
    paymentService: new PaymentService(),
  };
};
