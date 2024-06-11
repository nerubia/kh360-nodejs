-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_answer_option_id_fkey` FOREIGN KEY (`answer_option_id`) REFERENCES `answer_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
