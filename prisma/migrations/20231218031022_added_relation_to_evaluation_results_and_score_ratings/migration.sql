-- AlterTable
ALTER TABLE `evaluation_results` ADD COLUMN `score_ratings_id` INTEGER NULL AFTER `score`;

-- AddForeignKey
ALTER TABLE `evaluation_results` ADD CONSTRAINT `evaluation_results_score_ratings_id_fkey` FOREIGN KEY (`score_ratings_id`) REFERENCES `score_ratings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
