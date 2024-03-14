-- CreateTable
CREATE TABLE `survey_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `display_name` VARCHAR(150) NULL,
    `survey_type` VARCHAR(150) NULL,
    `remarks` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_template_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `survey_template_id` INTEGER NOT NULL,
    `sequence_no` INTEGER NULL,
    `question_type` VARCHAR(255) NULL,
    `question_text` VARCHAR(255) NULL,
    `is_required` BOOLEAN NULL,
    `is_active` BOOLEAN NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_template_question_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `survey_template_id` INTEGER NOT NULL,
    `survey_template_question_id` INTEGER NOT NULL,
    `rule_key` INTEGER NULL,
    `rule_value` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_template_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `survey_template_id` INTEGER NOT NULL,
    `survey_template_question_id` INTEGER NOT NULL,
    `sequence_no` INTEGER NULL,
    `answer_text` LONGTEXT NULL,
    `amount` INTEGER NULL,
    `answer_image` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_administrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `survey_start_date` DATE NULL,
    `survey_end_date` DATE NULL,
    `survey_template_id` INTEGER NULL,
    `remarks` VARCHAR(255) NULL,
    `email_subject` VARCHAR(255) NULL DEFAULT '',
    `email_content` TEXT NULL,
    `status` VARCHAR(255) NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `survey_administration_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `remarks` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `survey_administration_id` INTEGER NOT NULL,
    `survey_result_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `survey_template_id` INTEGER NOT NULL,
    `survey_template_question_id` INTEGER NOT NULL,
    `survey_template_answer_id` INTEGER NOT NULL,
    `remarks` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `survey_template_questions` ADD CONSTRAINT `survey_template_questions_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_question_rules` ADD CONSTRAINT `survey_template_question_rules_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_question_rules` ADD CONSTRAINT `survey_template_question_rules_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_answers` ADD CONSTRAINT `survey_template_answers_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_answers` ADD CONSTRAINT `survey_template_answers_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_results` ADD CONSTRAINT `survey_results_survey_administration_id_fkey` FOREIGN KEY (`survey_administration_id`) REFERENCES `survey_administrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_results` ADD CONSTRAINT `survey_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_administration_id_fkey` FOREIGN KEY (`survey_administration_id`) REFERENCES `survey_administrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_result_id_fkey` FOREIGN KEY (`survey_result_id`) REFERENCES `survey_results`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_answer_id_fkey` FOREIGN KEY (`survey_template_answer_id`) REFERENCES `survey_template_answers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
