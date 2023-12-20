/*
  Warnings:

  - You are about to alter the column `email_status` on the `email_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `email_logs` MODIFY `email_address` VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY `mail_id` VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY `email_status` VARCHAR(20) NOT NULL DEFAULT '';
