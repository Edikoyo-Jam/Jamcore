-- CreateTable
CREATE TABLE "FeaturedStreamer" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "streamTitle" TEXT NOT NULL,
    "streamTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedStreamer_pkey" PRIMARY KEY ("id")
);
