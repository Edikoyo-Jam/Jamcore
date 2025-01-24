/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "GameDownloadLink" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GameDownloadLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- AddForeignKey
ALTER TABLE "GameDownloadLink" ADD CONSTRAINT "GameDownloadLink_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
