-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_survey_template_answer_id_fkey`;

-- AlterTable
ALTER TABLE `survey_answers` MODIFY `survey_template_answer_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_answer_id_fkey` FOREIGN KEY (`survey_template_answer_id`) REFERENCES `survey_template_answers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
