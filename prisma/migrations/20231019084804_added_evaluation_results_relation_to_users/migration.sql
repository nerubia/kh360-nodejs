-- AddForeignKey
ALTER TABLE `evaluation_results` ADD CONSTRAINT `evaluation_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
