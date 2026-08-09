-- AlterTable: sizes + size chart on shop items
ALTER TABLE "ShopItem"
    ADD COLUMN "hasSizes" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "sizes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "sizeChartUrl" TEXT;

-- AlterTable: chosen size on an order line
ALTER TABLE "OrderItem"
    ADD COLUMN "size" TEXT;
