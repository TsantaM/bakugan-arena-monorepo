/*
  Warnings:

  - Added the required column `looser` to the `Rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Rooms" ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "looser" TEXT NOT NULL,
ADD COLUMN     "winner" TEXT NOT NULL;
