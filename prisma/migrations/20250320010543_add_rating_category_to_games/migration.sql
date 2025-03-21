-- AlterTable
ALTER TABLE "RatingCategory" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "_GameToRatingCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GameToRatingCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GameToRatingCategory_B_index" ON "_GameToRatingCategory"("B");

-- AddForeignKey
ALTER TABLE "_GameToRatingCategory" ADD CONSTRAINT "_GameToRatingCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToRatingCategory" ADD CONSTRAINT "_GameToRatingCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "RatingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
