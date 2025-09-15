-- CreateTable
CREATE TABLE "public"."GrammarRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "examples" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GrammarPractice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grammarRuleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPracticed" TIMESTAMP(3),
    "practiceCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrammarPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GrammarPracticeAttempt" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "userInput" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "aiFeedback" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrammarPracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrammarPractice_userId_grammarRuleId_key" ON "public"."GrammarPractice"("userId", "grammarRuleId");

-- AddForeignKey
ALTER TABLE "public"."GrammarPractice" ADD CONSTRAINT "GrammarPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GrammarPractice" ADD CONSTRAINT "GrammarPractice_grammarRuleId_fkey" FOREIGN KEY ("grammarRuleId") REFERENCES "public"."GrammarRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GrammarPracticeAttempt" ADD CONSTRAINT "GrammarPracticeAttempt_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "public"."GrammarPractice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
