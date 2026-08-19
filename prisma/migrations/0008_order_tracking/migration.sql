-- Physical-order lifecycle + delivery tracking.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';

ALTER TABLE "Order" ADD COLUMN "etaAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "trackingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingUrl" TEXT;
