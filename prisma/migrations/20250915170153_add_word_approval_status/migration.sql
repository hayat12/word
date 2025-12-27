-- CreateEnum
CREATE TYPE "public"."WordApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "public"."Word" ADD COLUMN     "approvalStatus" "public"."WordApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;
