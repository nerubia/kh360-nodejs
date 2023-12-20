-- AlterTable
ALTER TABLE `evaluation_result_details` ADD COLUMN `score_ratings_id` INTEGER NULL AFTER `weighted_zscore`;

-- AddForeignKey
ALTER TABLE `evaluation_result_details` ADD CONSTRAINT `evaluation_result_details_score_ratings_id_fkey` FOREIGN KEY (`score_ratings_id`) REFERENCES `score_ratings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
