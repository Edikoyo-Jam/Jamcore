-- CreateTable
CREATE TABLE "ThemeSuggestion" (
    "id" SERIAL NOT NULL,
    "suggestion" TEXT NOT NULL,
    "totalSlaughterScore" INTEGER NOT NULL,
    "totalVotingScore" INTEGER NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "jamId" INTEGER NOT NULL,

    CONSTRAINT "ThemeSuggestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeSuggestion" ADD CONSTRAINT "ThemeSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSuggestion" ADD CONSTRAINT "ThemeSuggestion_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
