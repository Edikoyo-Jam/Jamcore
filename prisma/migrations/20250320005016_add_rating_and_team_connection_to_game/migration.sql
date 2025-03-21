/*
  Warnings:

  - You are about to drop the column `authorId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the `_ContributedGames` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teamId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('REGULAR', 'ODA');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_ContributedGames" DROP CONSTRAINT "_ContributedGames_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContributedGames" DROP CONSTRAINT "_ContributedGames_B_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "authorId",
ADD COLUMN     "category" "GameCategory" NOT NULL,
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ContributedGames";

-- CreateTable
CREATE TABLE "RatingCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_teamId_key" ON "Game"("teamId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RatingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
