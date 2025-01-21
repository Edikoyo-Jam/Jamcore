-- CreateTable
CREATE TABLE "ThemeVote" (
    "id" SERIAL NOT NULL,
    "slaughterScore" INTEGER NOT NULL,
    "votingScore" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "jamId" INTEGER NOT NULL,

    CONSTRAINT "ThemeVote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeVote" ADD CONSTRAINT "ThemeVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeVote" ADD CONSTRAINT "ThemeVote_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
