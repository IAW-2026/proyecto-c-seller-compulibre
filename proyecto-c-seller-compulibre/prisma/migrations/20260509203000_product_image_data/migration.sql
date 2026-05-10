ALTER TABLE "ProductImage"
ADD COLUMN "mime_type" TEXT,
ADD COLUMN "original_name" TEXT,
ADD COLUMN "size" INTEGER,
ADD COLUMN "image_data" BYTEA;
