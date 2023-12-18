-- AlterTable
ALTER TABLE `evaluation_ratings` ADD COLUMN `score_ratings_id` INTEGER NULL AFTER `score`;

-- AddForeignKey
ALTER TABLE `evaluation_ratings` ADD CONSTRAINT `evaluation_ratings_score_ratings_id_fkey` FOREIGN KEY (`score_ratings_id`) REFERENCES `score_ratings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
