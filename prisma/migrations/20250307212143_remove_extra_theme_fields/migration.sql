/*
  Warnings:

  - You are about to drop the column `totalSlaughterScore` on the `ThemeSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `totalVotingScore` on the `ThemeSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `votingScore` on the `ThemeVote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ThemeSuggestion" DROP COLUMN "totalSlaughterScore",
DROP COLUMN "totalVotingScore";

-- AlterTable
ALTER TABLE "ThemeVote" DROP COLUMN "votingScore";
