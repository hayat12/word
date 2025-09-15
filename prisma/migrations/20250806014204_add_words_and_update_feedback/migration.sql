/*
  Warnings:

  - The values [TRIAL,WEEKLY,MONTHLY] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `authorId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubscriptionPlan_new" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" TYPE "public"."SubscriptionPlan_new" USING ("plan"::text::"public"."SubscriptionPlan_new");
ALTER TYPE "public"."SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "public"."SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Feedback" DROP CONSTRAINT "Feedback_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."Feedback" DROP COLUMN "authorId",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "userId" TEXT;

-- Update existing feedback records to assign them to the first user (or delete them)
DELETE FROM "public"."Feedback";

-- Now make userId required
ALTER TABLE "public"."Feedback" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "createdAt",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "updatedAt",
ALTER COLUMN "status" SET DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "public"."Word" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "example" TEXT,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
