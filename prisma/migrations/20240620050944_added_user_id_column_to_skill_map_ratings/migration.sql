-- AlterTable
ALTER TABLE `skill_map_ratings` ADD COLUMN `user_id` INTEGER NULL AFTER `skill_map_result_id`;

-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
