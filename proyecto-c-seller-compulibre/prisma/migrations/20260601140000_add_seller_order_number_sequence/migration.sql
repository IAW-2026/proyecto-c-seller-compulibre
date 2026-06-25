ALTER TABLE "SellerProfile"
ADD COLUMN "next_order_number" INTEGER NOT NULL DEFAULT 1;

DROP INDEX "SellerOrder_order_number_key";

ALTER TABLE "SellerOrder"
ALTER COLUMN "order_number" DROP DEFAULT;

WITH numbered_orders AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "seller_id"
      ORDER BY "order_number", "created_at", "id"
    )::INTEGER AS "seller_order_number"
  FROM "SellerOrder"
)
UPDATE "SellerOrder"
SET "order_number" = numbered_orders."seller_order_number"
FROM numbered_orders
WHERE "SellerOrder"."id" = numbered_orders."id";

UPDATE "SellerProfile"
SET "next_order_number" = COALESCE((
  SELECT MAX("SellerOrder"."order_number") + 1
  FROM "SellerOrder"
  WHERE "SellerOrder"."seller_id" = "SellerProfile"."clerk_user_id"
), 1);

CREATE UNIQUE INDEX "SellerOrder_seller_id_order_number_key"
ON "SellerOrder"("seller_id", "order_number");
