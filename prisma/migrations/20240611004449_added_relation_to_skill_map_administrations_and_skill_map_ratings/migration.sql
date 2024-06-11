-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_skill_map_administration_id_fkey` FOREIGN KEY (`skill_map_administration_id`) REFERENCES `skill_map_administrations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
