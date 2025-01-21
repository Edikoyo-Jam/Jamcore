/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "autoRegex" TEXT,
ADD COLUMN     "modOnly" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
