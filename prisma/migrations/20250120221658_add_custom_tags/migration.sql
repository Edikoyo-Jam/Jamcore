-- CreateTable
CREATE TABLE "CustomTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomTagToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CustomTagToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CustomTagToPost_B_index" ON "_CustomTagToPost"("B");

-- AddForeignKey
ALTER TABLE "_CustomTagToPost" ADD CONSTRAINT "_CustomTagToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomTagToPost" ADD CONSTRAINT "_CustomTagToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
