-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "defaultCategory" TEXT,
ADD COLUMN     "userLevel" INTEGER NOT NULL DEFAULT 1;
