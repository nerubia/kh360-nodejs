/*
  Warnings:

  - You are about to drop the column `description` on the `score_ratings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `score_ratings` DROP COLUMN `description`,
    ADD COLUMN `result_description` TEXT NULL AFTER `max_score`,
    ADD COLUMN `evaluee_description` TEXT NULL AFTER `result_description`;
