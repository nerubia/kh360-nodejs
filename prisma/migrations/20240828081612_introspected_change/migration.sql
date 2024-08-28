/*
  Warnings:

  - You are about to drop the column `contract_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `invoices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `project_member_skills` DROP FOREIGN KEY `project_member_skills_project_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_member_skills` DROP FOREIGN KEY `project_member_skills_skill_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_skills` DROP FOREIGN KEY `project_skills_skill_id_fkey`;

-- DropForeignKey
ALTER TABLE `skills` DROP FOREIGN KEY `skills_skill_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_survey_administration_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_survey_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_survey_template_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_survey_template_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_answers` DROP FOREIGN KEY `survey_answers_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_results` DROP FOREIGN KEY `survey_results_survey_administration_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_results` DROP FOREIGN KEY `survey_results_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_template_answers` DROP FOREIGN KEY `survey_template_answers_survey_template_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_template_answers` DROP FOREIGN KEY `survey_template_answers_survey_template_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_template_question_rules` DROP FOREIGN KEY `survey_template_question_rules_survey_template_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_template_question_rules` DROP FOREIGN KEY `survey_template_question_rules_survey_template_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_template_questions` DROP FOREIGN KEY `survey_template_questions_survey_template_id_fkey`;

-- DropIndex
DROP INDEX `index_invoices_on_contract_id` ON `invoices`;

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `contract_id`,
    DROP COLUMN `details`,
    DROP COLUMN `payment_date`,
    ADD COLUMN `billing_address_id` INTEGER NULL,
    ADD COLUMN `discount_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    ADD COLUMN `message` TEXT NULL,
    ADD COLUMN `payment_account_id` INTEGER NULL,
    ADD COLUMN `payment_term_id` INTEGER NULL,
    ADD COLUMN `sub_total` DECIMAL(8, 2) NULL DEFAULT 0.00,
    ADD COLUMN `tax_type_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address1` VARCHAR(255) NULL DEFAULT '',
    `address2` VARCHAR(255) NULL DEFAULT '',
    `city` VARCHAR(255) NULL DEFAULT '',
    `state` VARCHAR(255) NULL DEFAULT '',
    `country` VARCHAR(255) NULL DEFAULT '',
    `postal_code` VARCHAR(20) NULL DEFAULT '',
    `description` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_billings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NULL,
    `company_id` INTEGER NULL,
    `client_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `details` VARCHAR(255) NULL DEFAULT '',
    `billing_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `actual_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `bill_date` DATE NULL,
    `due_date` DATE NULL,
    `billing_status` VARCHAR(20) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_contract_billings_on_client_id`(`client_id`),
    INDEX `index_contract_billings_on_company_id`(`company_id`),
    INDEX `index_contract_billings_on_contract_id`(`contract_id`),
    INDEX `index_contract_billings_on_currency_id`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `sequence_no` INTEGER NULL,
    `filename` VARCHAR(255) NULL DEFAULT '',
    `description` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_invoice_attachments_on_invoice_id`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `contract_id` INTEGER NULL,
    `contract_billing_id` INTEGER NULL,
    `offering_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `employee_id` INTEGER NULL,
    `period_start` DATE NULL,
    `period_end` DATE NULL,
    `details` TEXT NULL,
    `quantity` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `uom_id` INTEGER NULL,
    `rate` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `sub_total` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `tax` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `total` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_invoice_details_on_contract_billing_id`(`contract_billing_id`),
    INDEX `index_invoice_details_on_contract_id`(`contract_id`),
    INDEX `index_invoice_details_on_employee_id`(`employee_id`),
    INDEX `index_invoice_details_on_invoice_id`(`invoice_id`),
    INDEX `index_invoice_details_on_offering_id`(`offering_id`),
    INDEX `index_invoice_details_on_project_id`(`project_id`),
    INDEX `index_invoice_details_on_uom_id`(`uom_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `sequence_no` INTEGER NULL,
    `email_type` VARCHAR(255) NULL DEFAULT '',
    `email_address` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_invoice_emails_on_invoice_id`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offering_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `offering_type` VARCHAR(20) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offerings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `client_id` INTEGER NULL,
    `offering_category_id` INTEGER NULL,
    `offering_type` VARCHAR(20) NULL,
    `sku` VARCHAR(50) NULL,
    `currency_id` INTEGER NULL,
    `uom_id` INTEGER NULL,
    `price` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_offerings_on_client_id`(`client_id`),
    INDEX `index_offerings_on_currency_id`(`currency_id`),
    INDEX `index_offerings_on_offering_category_id`(`offering_category_id`),
    INDEX `index_offerings_on_uom_id`(`uom_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL DEFAULT '',
    `currency_id` INTEGER NULL,
    `account_name` VARCHAR(255) NULL DEFAULT '',
    `account_type` VARCHAR(255) NULL DEFAULT '',
    `account_no` VARCHAR(255) NULL DEFAULT '',
    `bank_name` VARCHAR(255) NULL DEFAULT '',
    `bank_branch` VARCHAR(255) NULL DEFAULT '',
    `swift_code` VARCHAR(255) NULL DEFAULT '',
    `description` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_payment_accounts_on_currency_id`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `short_name` VARCHAR(10) NULL,
    `rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uoms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `short_name` VARCHAR(10) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `action` VARCHAR(20) NULL,
    `description` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_invoice_activities_on_invoice_id`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_member_skills` ADD CONSTRAINT `project_member_skills_project_member_id_fkey` FOREIGN KEY (`project_member_id`) REFERENCES `project_members`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member_skills` ADD CONSTRAINT `project_member_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_skills` ADD CONSTRAINT `project_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_skill_category_id_fkey` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_questions` ADD CONSTRAINT `survey_template_questions_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_question_rules` ADD CONSTRAINT `survey_template_question_rules_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_question_rules` ADD CONSTRAINT `survey_template_question_rules_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_answers` ADD CONSTRAINT `survey_template_answers_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_template_answers` ADD CONSTRAINT `survey_template_answers_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_results` ADD CONSTRAINT `survey_results_survey_administration_id_fkey` FOREIGN KEY (`survey_administration_id`) REFERENCES `survey_administrations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_results` ADD CONSTRAINT `survey_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_administration_id_fkey` FOREIGN KEY (`survey_administration_id`) REFERENCES `survey_administrations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_result_id_fkey` FOREIGN KEY (`survey_result_id`) REFERENCES `survey_results`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_id_fkey` FOREIGN KEY (`survey_template_id`) REFERENCES `survey_templates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_template_question_id_fkey` FOREIGN KEY (`survey_template_question_id`) REFERENCES `survey_template_questions`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offerings` ADD CONSTRAINT `offerings_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offerings` ADD CONSTRAINT `offerings_offering_category_id_fkey` FOREIGN KEY (`offering_category_id`) REFERENCES `offering_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
