-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_seller_id_idx" ON "Notification"("seller_id");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "SellerProfile"("clerk_user_id") ON DELETE CASCADE ON UPDATE CASCADE;
