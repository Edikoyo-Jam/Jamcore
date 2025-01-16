-- AlterTable
ALTER TABLE "_FlairToPost" ADD CONSTRAINT "_FlairToPost_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FlairToPost_AB_unique";

-- AlterTable
ALTER TABLE "_PostToUser" ADD CONSTRAINT "_PostToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PostToUser_AB_unique";

-- CreateTable
CREATE TABLE "Jam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingHours" INTEGER NOT NULL,
    "slaughterHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "jamId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JamToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JamToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GameToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GameToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JamToUser_B_index" ON "_JamToUser"("B");

-- CreateIndex
CREATE INDEX "_GameToUser_B_index" ON "_GameToUser"("B");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JamToUser" ADD CONSTRAINT "_JamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JamToUser" ADD CONSTRAINT "_JamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
