-- CreateTable
CREATE TABLE "ThemeVote2" (
    "id" SERIAL NOT NULL,
    "voteScore" INTEGER NOT NULL,
    "voteRound" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "jamId" INTEGER NOT NULL,
    "themeSuggestionId" INTEGER NOT NULL,

    CONSTRAINT "ThemeVote2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeVote2" ADD CONSTRAINT "ThemeVote2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeVote2" ADD CONSTRAINT "ThemeVote2_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeVote2" ADD CONSTRAINT "ThemeVote2_themeSuggestionId_fkey" FOREIGN KEY ("themeSuggestionId") REFERENCES "ThemeSuggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
