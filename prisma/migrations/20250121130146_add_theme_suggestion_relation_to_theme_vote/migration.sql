/*
  Warnings:

  - Added the required column `themeSuggestionId` to the `ThemeVote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ThemeVote" ADD COLUMN     "themeSuggestionId" INTEGER NOT NULL,
ALTER COLUMN "slaughterScore" SET DEFAULT 0,
ALTER COLUMN "votingScore" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "ThemeVote" ADD CONSTRAINT "ThemeVote_themeSuggestionId_fkey" FOREIGN KEY ("themeSuggestionId") REFERENCES "ThemeSuggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
