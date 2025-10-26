-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ORGANIZER', 'PLAYER');

-- CreateEnum
CREATE TYPE "PlayType" AS ENUM ('SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "RegisterStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BracketStage" AS ENUM ('GROUP', 'KNOCKOUT', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER,
    "play_type" "PlayType",

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "team_name" TEXT NOT NULL,
    "team_type" "TeamType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament" (
    "id" SERIAL NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "entry_fee" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adposter" TEXT,
    "addposter" TEXT,
    "max_players" INTEGER,
    "status" TEXT,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "register" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "status" "RegisterStatus" NOT NULL DEFAULT 'PENDING',
    "payment_proof" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank_score" INTEGER,
    "team_id" INTEGER,
    "birthday" TIMESTAMP(3),
    "video" TEXT,
    "group_no" INTEGER,
    "group_rank" INTEGER,
    "manager" BOOLEAN DEFAULT false,

    CONSTRAINT "register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "register_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pay_at" TIMESTAMP(3),
    "confirmed_by" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "round" INTEGER,
    "team1_id" INTEGER,
    "team2_id" INTEGER,
    "winner_team_id" INTEGER,
    "scheduled_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score_player1" INTEGER,
    "score_player2" INTEGER,
    "status_match" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shuttle_usage" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "broken_count" INTEGER NOT NULL DEFAULT 0,
    "shuttle_price" DECIMAL(10,2),

    CONSTRAINT "shuttle_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brackets" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "round" INTEGER,
    "match_id" INTEGER,
    "position" INTEGER,
    "bracket_stage" "BracketStage" NOT NULL,

    CONSTRAINT "brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "result" "MatchResult",
    "score" INTEGER,
    "played_at" TIMESTAMP(3),

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_first_name_last_name_idx" ON "users"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_team_name_team_type_key" ON "teams"("team_name", "team_type");

-- CreateIndex
CREATE INDEX "tournament_organizer_id_idx" ON "tournament"("organizer_id");

-- CreateIndex
CREATE INDEX "register_tournament_id_idx" ON "register"("tournament_id");

-- CreateIndex
CREATE INDEX "register_player_id_idx" ON "register"("player_id");

-- CreateIndex
CREATE INDEX "register_team_id_idx" ON "register"("team_id");

-- CreateIndex
CREATE INDEX "payment_register_id_idx" ON "payment"("register_id");

-- CreateIndex
CREATE INDEX "payment_confirmed_by_idx" ON "payment"("confirmed_by");

-- CreateIndex
CREATE INDEX "matches_tournament_id_idx" ON "matches"("tournament_id");

-- CreateIndex
CREATE INDEX "matches_team1_id_idx" ON "matches"("team1_id");

-- CreateIndex
CREATE INDEX "matches_team2_id_idx" ON "matches"("team2_id");

-- CreateIndex
CREATE INDEX "matches_winner_team_id_idx" ON "matches"("winner_team_id");

-- CreateIndex
CREATE INDEX "shuttle_usage_match_id_idx" ON "shuttle_usage"("match_id");

-- CreateIndex
CREATE INDEX "brackets_tournament_id_idx" ON "brackets"("tournament_id");

-- CreateIndex
CREATE INDEX "brackets_match_id_idx" ON "brackets"("match_id");

-- CreateIndex
CREATE INDEX "history_player_id_idx" ON "history"("player_id");

-- CreateIndex
CREATE INDEX "history_tournament_id_idx" ON "history"("tournament_id");

-- CreateIndex
CREATE INDEX "history_match_id_idx" ON "history"("match_id");

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "register" ADD CONSTRAINT "register_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "register" ADD CONSTRAINT "register_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "register" ADD CONSTRAINT "register_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuttle_usage" ADD CONSTRAINT "shuttle_usage_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
