-- AlterTable
ALTER TABLE `evaluation_templates` ADD COLUMN `with_recommendation` BOOLEAN NULL DEFAULT false AFTER `template_class`;
