/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `TeamRole` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `TeamRole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `TeamRole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `icon` on table `TeamRole` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TeamRole" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "icon" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TeamRole_slug_key" ON "TeamRole"("slug");
