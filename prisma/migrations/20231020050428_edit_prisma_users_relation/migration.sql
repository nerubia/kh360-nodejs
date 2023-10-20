/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `user_details` DROP FOREIGN KEY `user_details_user_id`;

-- CreateIndex
CREATE UNIQUE INDEX `user_details_user_id_key` ON `user_details`(`user_id`);

-- AddForeignKey
ALTER TABLE `user_details` ADD CONSTRAINT `user_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
