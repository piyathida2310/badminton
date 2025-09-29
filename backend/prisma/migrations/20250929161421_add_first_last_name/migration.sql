/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PlayType" AS ENUM ('SINGLE', 'DOUBLE', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."TeamType" AS ENUM ('SINGLE', 'DOUBLE', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."RegisterStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BracketStage" AS ENUM ('GROUP', 'KNOCKOUT', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- DropIndex
DROP INDEX "public"."users_user_name_idx";

-- DropIndex
DROP INDEX "public"."users_user_name_key";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "email" TEXT NOT NULL DEFAULT 'temp@example.com',
ADD COLUMN     "first_name" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "last_name" TEXT NOT NULL DEFAULT 'User',
ADD COLUMN     "play_type" "public"."PlayType",
ADD COLUMN     "rank" INTEGER,
ALTER COLUMN "user_name" DROP NOT NULL;

-- Update existing records with proper values
UPDATE "public"."users" SET 
  "email" = 'user' || "user_id" || '@example.com',
  "first_name" = COALESCE("user_name", 'User'),
  "last_name" = 'Player'
WHERE "email" = 'temp@example.com';

-- Remove default values
ALTER TABLE "public"."users" ALTER COLUMN "email" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "first_name" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "last_name" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" SERIAL NOT NULL,
    "team_name" TEXT NOT NULL,
    "team_type" "public"."TeamType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tournament" (
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
CREATE TABLE "public"."register" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "status" "public"."RegisterStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "public"."payment" (
    "id" SERIAL NOT NULL,
    "register_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pay_at" TIMESTAMP(3),
    "confirmed_by" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matches" (
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
    "status_match" "public"."MatchStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shuttle_usage" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "broken_count" INTEGER NOT NULL DEFAULT 0,
    "shuttle_price" DECIMAL(10,2),

    CONSTRAINT "shuttle_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brackets" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "round" INTEGER,
    "match_id" INTEGER,
    "position" INTEGER,
    "bracket_stage" "public"."BracketStage" NOT NULL,

    CONSTRAINT "brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."history" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "result" "public"."MatchResult",
    "score" INTEGER,
    "played_at" TIMESTAMP(3),

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_team_name_team_type_key" ON "public"."teams"("team_name", "team_type");

-- CreateIndex
CREATE INDEX "tournament_organizer_id_idx" ON "public"."tournament"("organizer_id");

-- CreateIndex
CREATE INDEX "register_tournament_id_idx" ON "public"."register"("tournament_id");

-- CreateIndex
CREATE INDEX "register_player_id_idx" ON "public"."register"("player_id");

-- CreateIndex
CREATE INDEX "register_team_id_idx" ON "public"."register"("team_id");

-- CreateIndex
CREATE INDEX "payment_register_id_idx" ON "public"."payment"("register_id");

-- CreateIndex
CREATE INDEX "payment_confirmed_by_idx" ON "public"."payment"("confirmed_by");

-- CreateIndex
CREATE INDEX "matches_tournament_id_idx" ON "public"."matches"("tournament_id");

-- CreateIndex
CREATE INDEX "matches_team1_id_idx" ON "public"."matches"("team1_id");

-- CreateIndex
CREATE INDEX "matches_team2_id_idx" ON "public"."matches"("team2_id");

-- CreateIndex
CREATE INDEX "matches_winner_team_id_idx" ON "public"."matches"("winner_team_id");

-- CreateIndex
CREATE INDEX "shuttle_usage_match_id_idx" ON "public"."shuttle_usage"("match_id");

-- CreateIndex
CREATE INDEX "brackets_tournament_id_idx" ON "public"."brackets"("tournament_id");

-- CreateIndex
CREATE INDEX "brackets_match_id_idx" ON "public"."brackets"("match_id");

-- CreateIndex
CREATE INDEX "history_player_id_idx" ON "public"."history"("player_id");

-- CreateIndex
CREATE INDEX "history_tournament_id_idx" ON "public"."history"("tournament_id");

-- CreateIndex
CREATE INDEX "history_match_id_idx" ON "public"."history"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_first_name_last_name_idx" ON "public"."users"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."tournament" ADD CONSTRAINT "tournament_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."register" ADD CONSTRAINT "register_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."register" ADD CONSTRAINT "register_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."register" ADD CONSTRAINT "register_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shuttle_usage" ADD CONSTRAINT "shuttle_usage_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brackets" ADD CONSTRAINT "brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brackets" ADD CONSTRAINT "brackets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history" ADD CONSTRAINT "history_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history" ADD CONSTRAINT "history_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history" ADD CONSTRAINT "history_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
