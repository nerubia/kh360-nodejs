-- AddForeignKey
ALTER TABLE `user_details` ADD CONSTRAINT `user_details_user_id` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
