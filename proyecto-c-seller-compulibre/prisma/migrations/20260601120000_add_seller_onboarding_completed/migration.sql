ALTER TABLE "SellerProfile"
ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;

UPDATE "SellerProfile"
SET "onboarding_completed" = true
WHERE "seller_address" IS NOT NULL
  AND "postal_code" IS NOT NULL;
