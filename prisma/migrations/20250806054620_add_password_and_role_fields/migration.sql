-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';
