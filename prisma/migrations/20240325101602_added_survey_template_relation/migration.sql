-- AlterTable
ALTER TABLE `survey_template_categories` ADD COLUMN `survey_template_id` INTEGER NULL AFTER `id`;

-- AddForeignKey
ALTER TABLE `survey_template_categories` ADD CONSTRAINT `survey_templates_survey_template_id` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
