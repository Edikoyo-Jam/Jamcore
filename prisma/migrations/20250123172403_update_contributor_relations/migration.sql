/*
  Warnings:

  - You are about to drop the `_GameToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_B_fkey";

-- DropTable
DROP TABLE "_GameToUser";

-- CreateTable
CREATE TABLE "_ContributedGames" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContributedGames_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ContributedGames_B_index" ON "_ContributedGames"("B");

-- AddForeignKey
ALTER TABLE "_ContributedGames" ADD CONSTRAINT "_ContributedGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributedGames" ADD CONSTRAINT "_ContributedGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
