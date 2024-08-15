export default {
  tz: "Asia/Ho_Chi_Minh",
  namespace: "pito-dev.gsmty",
  address: "pito-dev.gsmty.tmprl.cloud:7233",
  taskQueue: "order-processing",
  projectId: "pito-platform-418503",
  jwtKey: "secret",
  supabaseUrl: "https://api-dev.pito.vn",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YXdxbndybm1mdnN4cnZtcnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwNTU0MjUsImV4cCI6MjAzMDYzMTQyNX0.vycUFsNit8nqJx4E6M-M_oU6WhLHilEu-BmEb2LU5DQ",
  serviceRole:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YXdxbndybm1mdnN4cnZtcnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTA1NTQyNSwiZXhwIjoyMDMwNjMxNDI1fQ.uivauXuivxap2bBETCf-6S-8Z4SqgD7t4FnJ9IjJJ5o",
};

export const DbTables = Object.freeze({
  Partners: "partners",
  Orders: "orders",
  OrderItems: "order_items",
  OrderEvents: "order_events",
  PartnerOrders: "partner_orders",
  Transactions: "transactions",
  CartItems: "cart_items",
  ShoppingSessions: "shopping_sessions",
  Stores: "stores",
  Vouchers: "vouchers",
  UserVouchers: "user_vouchers",
});
