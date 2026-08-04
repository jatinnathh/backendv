/*
  Warnings:

  - You are about to drop the `http_lab_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "http_lab_users";

-- CreateTable
CREATE TABLE "http_lab_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "http_lab_items_pkey" PRIMARY KEY ("id")
);
