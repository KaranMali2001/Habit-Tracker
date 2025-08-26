/*
  Warnings:

  - Added the required column `endDate` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DailyTask" ADD COLUMN     "scheduledTime" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "endDate" DATE NOT NULL;
