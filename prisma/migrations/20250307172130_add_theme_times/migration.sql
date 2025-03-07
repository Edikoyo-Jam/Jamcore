/*
  Warnings:

  - You are about to drop the column `creationTime` on the `ThemeSuggestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ThemeSuggestion" DROP COLUMN "creationTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ThemeVote" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
