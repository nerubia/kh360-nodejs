-- AlterTable
ALTER TABLE `survey_template_answers` ADD COLUMN `answer_description` TEXT NULL AFTER `answer_text`;

-- AlterTable
ALTER TABLE `survey_template_question_rules` MODIFY `rule_key` VARCHAR(255) NULL,
    MODIFY `rule_value` VARCHAR(255) NULL;
