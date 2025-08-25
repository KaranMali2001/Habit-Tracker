-- CreateEnum
CREATE TYPE "public"."TaskCategory" AS ENUM ('DSA', 'PROJECT', 'WRITING', 'LEARNING', 'APPLICATION', 'INTERVIEW_PREP');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."Mood" AS ENUM ('EXCELLENT', 'GOOD', 'NEUTRAL', 'LOW', 'TERRIBLE');

-- CreateTable
CREATE TABLE "public"."DailyTask" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "category" "public"."TaskCategory" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "skipReason" TEXT,
    "targetMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "userId" TEXT NOT NULL,
    "dailyNoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyNote" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "autoContent" TEXT,
    "userContent" TEXT,
    "learnings" TEXT,
    "challenges" TEXT,
    "tomorrowPlan" TEXT,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "energyLevel" INTEGER NOT NULL DEFAULT 5,
    "mood" "public"."Mood" NOT NULL DEFAULT 'NEUTRAL',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyReport" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "dsaTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "projectTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "writingTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "autoSummary" TEXT,
    "blogDraft" TEXT,
    "reflections" TEXT,
    "nextWeekGoals" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "targetRole" TEXT NOT NULL DEFAULT 'Backend Developer',
    "targetSalary" TEXT NOT NULL DEFAULT '$30-40K USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTask_userId_date_title_key" ON "public"."DailyTask"("userId", "date", "title");

-- CreateIndex
CREATE UNIQUE INDEX "DailyNote_date_key" ON "public"."DailyNote"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyNote_userId_date_key" ON "public"."DailyNote"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_userId_weekNumber_key" ON "public"."WeeklyReport"("userId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."DailyTask" ADD CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailyTask" ADD CONSTRAINT "DailyTask_dailyNoteId_fkey" FOREIGN KEY ("dailyNoteId") REFERENCES "public"."DailyNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailyNote" ADD CONSTRAINT "DailyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyReport" ADD CONSTRAINT "WeeklyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
