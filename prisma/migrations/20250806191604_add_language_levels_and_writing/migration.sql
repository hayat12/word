/*
  Warnings:

  - The `level` column on the `GrammarRule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userLevel` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."LanguageLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- AlterTable
ALTER TABLE "public"."GrammarRule" DROP COLUMN "level",
ADD COLUMN     "level" "public"."LanguageLevel" NOT NULL DEFAULT 'A1';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "userLevel",
ADD COLUMN     "userLevel" "public"."LanguageLevel" NOT NULL DEFAULT 'A1';

-- CreateTable
CREATE TABLE "public"."WritingPractice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'German',
    "userLevel" "public"."LanguageLevel" NOT NULL,
    "aiFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingPractice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WritingPractice" ADD CONSTRAINT "WritingPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
