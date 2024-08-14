/*
  Warnings:

  - You are about to drop the column `http_method` on the `test_items` table. All the data in the column will be lost.
  - Added the required column `http_method` to the `test_apis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `test_apis` ADD COLUMN `http_method` ENUM('get', 'post', 'put', 'patch', 'delete') NOT NULL AFTER `endpoint`;

-- AlterTable
ALTER TABLE `test_items` DROP COLUMN `http_method`;
