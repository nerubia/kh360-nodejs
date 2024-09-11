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

-- AlterTable
ALTER TABLE `clients` ADD COLUMN `payment_account_id` INTEGER NULL,
    ADD COLUMN `tax_type_id` INTEGER NULL;
