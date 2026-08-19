-- Per-size stock for sized items.
ALTER TABLE "ShopItem" ADD COLUMN "sizeStock" JSONB;

-- Shipping fee snapshot + refund tracking on orders.
ALTER TABLE "Order" ADD COLUMN "shippingInr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "refundedAt" TIMESTAMP(3);
