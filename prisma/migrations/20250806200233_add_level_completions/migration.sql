-- CreateTable
CREATE TABLE "public"."LevelCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "public"."LanguageLevel" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,

    CONSTRAINT "LevelCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelCompletion_userId_level_key" ON "public"."LevelCompletion"("userId", "level");

-- AddForeignKey
ALTER TABLE "public"."LevelCompletion" ADD CONSTRAINT "LevelCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
