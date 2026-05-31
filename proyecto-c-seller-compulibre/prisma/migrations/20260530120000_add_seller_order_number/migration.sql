-- AlterTable
ALTER TABLE "SellerOrder"
ADD COLUMN "order_number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SellerOrder_order_number_key" ON "SellerOrder"("order_number");
