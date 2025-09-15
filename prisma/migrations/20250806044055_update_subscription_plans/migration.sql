/*
  Warnings:

  - The values [BASIC,PREMIUM] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubscriptionPlan_new" AS ENUM ('FREE', 'TRIAL', 'MONTHLY', 'YEARLY');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" TYPE "public"."SubscriptionPlan_new" USING ("plan"::text::"public"."SubscriptionPlan_new");
ALTER TYPE "public"."SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "public"."SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;
