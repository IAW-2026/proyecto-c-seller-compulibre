ALTER TABLE "SellerOrder"
ADD COLUMN "buyer_id" TEXT,
ADD COLUMN "transaction_id" TEXT,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "SellerOrder_transaction_id_key" ON "SellerOrder"("transaction_id");
CREATE INDEX "SellerOrder_external_buyer_order_id_idx" ON "SellerOrder"("external_buyer_order_id");
