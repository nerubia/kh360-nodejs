-- AlterTable
ALTER TABLE `survey_template_answers` ADD COLUMN `survey_template_category_id` INTEGER NULL AFTER `survey_template_question_id`;

-- AlterTable
ALTER TABLE `survey_template_questions` ADD COLUMN `survey_template_category_id` INTEGER NULL AFTER `survey_template_id`;

-- CreateTable
CREATE TABLE `survey_template_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `sequence_no` INTEGER NULL,
    `description` TEXT NULL,
    `category_type` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `survey_template_questions` ADD CONSTRAINT `survey_template_questions_survey_template_category_id_fkey` FOREIGN KEY (`survey_template_category_id`) REFERENCES `survey_template_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_answers` ADD CONSTRAINT `survey_template_answers_survey_template_category_id_fkey` FOREIGN KEY (`survey_template_category_id`) REFERENCES `survey_template_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
