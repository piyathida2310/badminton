-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ORGANIZER', 'PLAYER');

-- CreateEnum
CREATE TYPE "PlayType" AS ENUM ('SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "HandType" AS ENUM ('BG', 'NB', 'N', 'S', 'P-', 'P+');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('WAITING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CancellationStatus" AS ENUM ('REQUESTED', 'REFUNDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('UPPER', 'LOWER', 'GRAND_FINAL', 'THIRD_PLACE');

-- CreateEnum
CREATE TYPE "MatchSlot" AS ENUM ('P1', 'P2');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "playType" "PlayType",
    "profileImg" TEXT,
    "gmail" TEXT,
    "clerk_id" TEXT,
    "phone_number" TEXT,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "playType" "PlayType" NOT NULL,
    "rank" TEXT[],
    "shuttlePrice" DOUBLE PRECISION NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "posterImg" TEXT,
    "qrCodeImg" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "isLowerBracket" BOOLEAN NOT NULL DEFAULT false,
    "isCancel" BOOLEAN NOT NULL DEFAULT false,
    "organizerId" INTEGER NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "detail" TEXT NOT NULL,
    "rank" TEXT[],
    "tournamentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Register" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "teamName" TEXT,
    "playType" "HandType" NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "videoUrl" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'WAITING',
    "score" DOUBLE PRECISION,
    "comment" TEXT,
    "managerName" TEXT,
    "player1Name" TEXT,
    "player1Gender" "Gender",
    "player1Birthday" TIMESTAMP(3),
    "player2Name" TEXT,
    "player2Gender" "Gender",
    "player2Phone" TEXT,
    "player2Birthday" TIMESTAMP(3),
    "groupId" INTEGER,

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" SERIAL NOT NULL,
    "registerId" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "CancellationStatus" NOT NULL DEFAULT 'REQUESTED',
    "bankName" TEXT,
    "accountNum" TEXT,
    "accountName" TEXT,
    "qrCode" TEXT,
    "refundSlip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "registerId" INTEGER NOT NULL,
    "slipImg" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMatch" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "handType" "HandType",
    "roundName" TEXT,
    "player1Id" INTEGER,
    "matchSequence" INTEGER,
    "player2Id" INTEGER,
    "winnerId" INTEGER,
    "score1" INTEGER,
    "score2" INTEGER,
    "sets" TEXT,
    "shuttle" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledTime" TIMESTAMP(3),

    CONSTRAINT "GroupMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BracketMatch" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "handType" "HandType",
    "stage" "MatchStage" NOT NULL DEFAULT 'UPPER',
    "roundSequence" INTEGER,
    "matchSequence" INTEGER,
    "player1Id" INTEGER,
    "player2Id" INTEGER,
    "winnerId" INTEGER,
    "score1" INTEGER,
    "score2" INTEGER,
    "sets" TEXT,
    "shuttle" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledTime" TIMESTAMP(3),
    "winnerNextMatchId" INTEGER,
    "winnerNextMatchSlot" "MatchSlot",
    "loserNextMatchId" INTEGER,
    "loserNextMatchSlot" "MatchSlot",

    CONSTRAINT "BracketMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "registerId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION,
    "shuttleUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_gmail_key" ON "User"("gmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_id_key" ON "User"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "CancellationRequest_registerId_key" ON "CancellationRequest"("registerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_registerId_key" ON "Payment"("registerId");

-- CreateIndex
CREATE INDEX "GroupMatch_tournamentId_idx" ON "GroupMatch"("tournamentId");

-- CreateIndex
CREATE INDEX "GroupMatch_groupId_idx" ON "GroupMatch"("groupId");

-- CreateIndex
CREATE INDEX "BracketMatch_tournamentId_idx" ON "BracketMatch"("tournamentId");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_winnerNextMatchId_fkey" FOREIGN KEY ("winnerNextMatchId") REFERENCES "BracketMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_loserNextMatchId_fkey" FOREIGN KEY ("loserNextMatchId") REFERENCES "BracketMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
