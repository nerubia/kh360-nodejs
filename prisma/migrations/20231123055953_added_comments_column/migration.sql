-- AlterTable
ALTER TABLE `evaluation_ratings` ADD COLUMN `comments` VARCHAR(20) NULL DEFAULT '' AFTER `score`;
