-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';
