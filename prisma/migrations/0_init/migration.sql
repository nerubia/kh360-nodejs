-- CreateTable
CREATE TABLE `access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `has_expired` TINYINT NOT NULL DEFAULT 0,
    `expiry_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `access_tokens_user_id_unique`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `encrypted_password` VARCHAR(255) NOT NULL DEFAULT '',
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_sent_at` DATETIME(0) NULL,
    `remember_created_at` DATETIME(0) NULL,
    `sign_in_count` INTEGER NOT NULL DEFAULT 0,
    `current_sign_in_at` DATETIME(0) NULL,
    `last_sign_in_at` DATETIME(0) NULL,
    `current_sign_in_ip` VARCHAR(255) NULL,
    `last_sign_in_ip` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `index_admins_on_email`(`email`),
    UNIQUE INDEX `index_admins_on_reset_password_token`(`reset_password_token`),
    INDEX `index_admins_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer_id` INTEGER NULL,
    `sequence_no` INTEGER NULL,
    `name` VARCHAR(100) NULL,
    `display_name` VARCHAR(100) NULL,
    `rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_answer_options_on_answer_id`(`answer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_manifest_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `approval_manifest_id` INTEGER NULL,
    `approver_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_approval_manifest_logs_on_admin_id`(`admin_id`),
    INDEX `index_approval_manifest_logs_on_approval_manifest_id`(`approval_manifest_id`),
    INDEX `index_approval_manifest_logs_on_approver_id`(`approver_id`),
    INDEX `index_approval_manifest_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_manifests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approver_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_approval_manifests_on_approver_id`(`approver_id`),
    INDEX `index_approval_manifests_on_status`(`status`),
    INDEX `index_approval_manifests_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `approver_for` ENUM('leave', 'overtime', 'other') NOT NULL DEFAULT 'leave',
    `other_status` VARCHAR(100) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_approvers_on_approver_for`(`approver_for`),
    INDEX `index_approvers_on_status`(`status`),
    INDEX `index_approvers_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ar_internal_metadata` (
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `user_id` INTEGER NULL,
    `att_type` INTEGER NULL DEFAULT 0,
    `late_flag` VARCHAR(50) NULL DEFAULT '',
    `hours_worked` DECIMAL(14, 2) NULL DEFAULT 0.00,
    `hours_late` DECIMAL(14, 2) NULL DEFAULT 0.00,
    `hours_ut` DECIMAL(14, 2) NULL DEFAULT 0.00,
    `hours_unpaid` DECIMAL(14, 2) NULL DEFAULT 0.00,
    `review_status` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_attendances_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chairs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `occupants` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `local_name` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NULL,
    `state` VARCHAR(255) NULL,
    `local_state` VARCHAR(255) NULL,
    `zip` VARCHAR(255) NULL,
    `country` VARCHAR(255) NULL,
    `local_country` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `index_cities_on_slug`(`slug`),
    INDEX `index_cities_on_country`(`country`),
    INDEX `index_cities_on_local_country`(`local_country`),
    INDEX `index_cities_on_local_name`(`local_name`),
    INDEX `index_cities_on_local_state`(`local_state`),
    INDEX `index_cities_on_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `display_name` VARCHAR(100) NULL,
    `contact_first_name` VARCHAR(100) NULL,
    `contact_last_name` VARCHAR(100) NULL,
    `contact_no` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `address1` VARCHAR(100) NULL,
    `address2` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `country_id` INTEGER NULL,
    `postal_code` INTEGER NULL,
    `company_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `payment_term_id` INTEGER NULL,
    `remarks` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'Active',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_delinquent` BOOLEAN NULL DEFAULT false,

    INDEX `index_clients_on_company_id`(`company_id`),
    INDEX `index_clients_on_currency_id`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `shorthand` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NOT NULL,
    `city` VARCHAR(255) NULL,
    `state` VARCHAR(255) NULL,
    `country` VARCHAR(70) NULL,
    `zip` VARCHAR(255) NULL,
    `moderator_id` INTEGER NULL,
    `public_url` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `street` VARCHAR(100) NULL,
    `static_ip` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_companies_on_city`(`city`),
    INDEX `index_companies_on_country`(`country`),
    INDEX `index_companies_on_moderator_id`(`moderator_id`),
    INDEX `index_companies_on_name`(`name`),
    INDEX `index_companies_on_slug`(`slug`),
    INDEX `index_companies_on_state`(`state`),
    INDEX `index_companies_on_zip`(`zip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_ip_addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `ip_address` VARCHAR(255) NOT NULL,

    INDEX `index_company_ip_addresses_on_company_id`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `team_id` INTEGER NULL,

    INDEX `index_company_teams_on_company_id`(`company_id`),
    INDEX `index_company_teams_on_team_id`(`team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `user_level` ENUM('user', 'admin', 'root') NOT NULL DEFAULT 'user',
    `user_status` ENUM('New', 'OnBoarding', 'Active', 'Inactive', 'Exiting', 'Resigned', 'Retired', 'Terminated') NOT NULL DEFAULT 'Active',
    `uid` VARCHAR(30) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_company_status_on_company_users`(`company_id`, `user_status`),
    INDEX `index_company_users_on_company_id`(`company_id`),
    INDEX `index_company_users_on_uid`(`uid`),
    INDEX `index_company_users_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `computers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `os` VARCHAR(255) NULL,
    `processor` VARCHAR(255) NULL,
    `ram` VARCHAR(255) NULL,
    `storage` VARCHAR(255) NULL,
    `gpu` VARCHAR(255) NULL,
    `serial_number` VARCHAR(255) NULL,
    `cd_key` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contract_id` INTEGER NULL,
    `action` VARCHAR(100) NULL DEFAULT '',
    `prev_status` VARCHAR(20) NULL DEFAULT '',
    `new_status` VARCHAR(20) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `user_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_contract_logs_on_contract_id`(`contract_id`),
    INDEX `index_contract_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `company_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `contract_no` VARCHAR(20) NULL,
    `parent_contract_id` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `contract_type` VARCHAR(50) NULL DEFAULT '',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `auto_renew` BOOLEAN NULL,
    `addendum` BOOLEAN NULL DEFAULT false,
    `addendum_sequence_no` INTEGER NULL,
    `client_liaison_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `contract_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `est_monthly_rate` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `est_monthly_mm` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `total_mm` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `payment_term_id` INTEGER NULL,
    `type` VARCHAR(20) NULL DEFAULT '',
    `status` VARCHAR(20) NULL DEFAULT '',
    `is_signed` BOOLEAN NULL,
    `draft_google_link` VARCHAR(255) NULL,
    `draft_filename` VARCHAR(255) NULL,
    `contract_filename` VARCHAR(255) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `index_contracts_on_client_id`(`client_id`),
    INDEX `index_contracts_on_client_liaison_id`(`client_liaison_id`),
    INDEX `index_contracts_on_company_id`(`company_id`),
    INDEX `index_contracts_on_currency_id`(`currency_id`),
    INDEX `index_contracts_on_project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NULL,
    `capital` VARCHAR(255) NULL,
    `citizenship` VARCHAR(255) NULL,
    `currency` VARCHAR(255) NULL,
    `currency_code` VARCHAR(10) NULL,
    `currency_sub_unit` VARCHAR(255) NULL,
    `iso_3166_2` VARCHAR(2) NULL,
    `iso_3166_3` VARCHAR(3) NULL,
    `country_code` VARCHAR(3) NULL,
    `region_code` VARCHAR(3) NULL,
    `sub_region_code` VARCHAR(3) NULL,
    `eea` TINYINT NULL,
    `is_active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `code` VARCHAR(10) NULL,
    `prefix` VARCHAR(10) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_recipients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email_type` VARCHAR(255) NULL DEFAULT '',
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `status` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_administrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL DEFAULT '',
    `eval_schedule_start_date` DATE NULL,
    `eval_schedule_end_date` DATE NULL,
    `eval_period_start_date` DATE NULL,
    `eval_period_end_date` DATE NULL,
    `remarks` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_administration_id` INTEGER NULL,
    `evaluation_id` INTEGER NULL,
    `evaluation_template_id` INTEGER NULL,
    `evaluation_template_content_id` INTEGER NULL,
    `answer_option_id` INTEGER NULL,
    `rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `percentage` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `score` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_evaluation_ratings_on_answer_option_id`(`answer_option_id`),
    INDEX `index_evaluation_ratings_on_evaluation_administration_id`(`evaluation_administration_id`),
    INDEX `index_evaluation_ratings_on_evaluation_id`(`evaluation_id`),
    INDEX `index_evaluation_ratings_on_evaluation_template_content_id`(`evaluation_template_content_id`),
    INDEX `index_evaluation_ratings_on_evaluation_template_id`(`evaluation_template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_result_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_administration_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `evaluation_result_id` INTEGER NULL,
    `evaluation_template_id` INTEGER NULL,
    `score` DECIMAL(8, 4) NULL DEFAULT 0.0000,
    `weight` DECIMAL(8, 4) NULL DEFAULT 0.0000,
    `zscore` DECIMAL(8, 4) NULL DEFAULT 0.0000,
    `weighted_score` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `weighted_zscore` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `banding` VARCHAR(20) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_evaluation_result_details_on_evaluation_administration_id`(`evaluation_administration_id`),
    INDEX `index_evaluation_result_details_on_evaluation_result_id`(`evaluation_result_id`),
    INDEX `index_evaluation_result_details_on_evaluation_template_id`(`evaluation_template_id`),
    INDEX `index_evaluation_result_details_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_administration_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `score` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `zscore` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `banding` VARCHAR(20) NULL DEFAULT '',
    `submitted_date` DATE NULL,
    `employee_comments` TEXT NULL,
    `cm_comments` TEXT NULL,
    `action_plans` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_evaluation_results_on_evaluation_administration_id`(`evaluation_administration_id`),
    INDEX `index_evaluation_results_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_setups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluator_role_id` INTEGER NULL,
    `evaluee_role_id` INTEGER NULL,
    `evaluation_template_id` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_template_contents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_template_id` INTEGER NULL,
    `sequence_no` INTEGER NULL,
    `name` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_evaluation_template_contents_on_evaluation_template_id`(`evaluation_template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `display_name` VARCHAR(100) NULL DEFAULT '',
    `template_type` VARCHAR(100) NULL,
    `template_class` VARCHAR(100) NULL,
    `evaluator_role_id` INTEGER NULL,
    `evaluee_role_id` INTEGER NULL,
    `rate` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `answer_id` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_template_id` INTEGER NULL,
    `evaluation_administration_id` INTEGER NULL,
    `evaluation_result_id` INTEGER NULL,
    `evaluator_id` INTEGER NULL,
    `evaluee_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `eval_start_date` DATE NULL,
    `eval_end_date` DATE NULL,
    `percent_involvement` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `score` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `weight` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `weighted_score` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `zscore` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `weighted_zscore` DECIMAL(10, 4) NULL DEFAULT 0.0000,
    `comments` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `batch_name` VARCHAR(255) NULL DEFAULT '',
    `filename` VARCHAR(255) NULL DEFAULT '',
    `submission_method` VARCHAR(20) NULL DEFAULT 'Manual',
    `submitted_date` DATE NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_evaluations_on_evaluation_administration_id`(`evaluation_administration_id`),
    INDEX `index_evaluations_on_evaluation_result_id`(`evaluation_result_id`),
    INDEX `index_evaluations_on_evaluation_template_id`(`evaluation_template_id`),
    INDEX `index_evaluations_on_evaluator_id`(`evaluator_id`),
    INDEX `index_evaluations_on_evaluee_id`(`evaluee_id`),
    INDEX `index_evaluations_on_project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holidays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `date` DATE NULL,
    `holiday_type` VARCHAR(255) NULL,
    `recurring` TINYINT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `company_id` INTEGER NULL,
    `contract_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `invoice_no` VARCHAR(20) NULL DEFAULT '',
    `details` VARCHAR(255) NULL DEFAULT '',
    `invoice_date` DATE NULL,
    `due_date` DATE NULL,
    `payment_date` DATE NULL,
    `invoice_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `payment_amount` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `invoice_status` VARCHAR(20) NULL DEFAULT '',
    `payment_status` VARCHAR(20) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_invoices_on_client_id`(`client_id`),
    INDEX `index_invoices_on_company_id`(`company_id`),
    INDEX `index_invoices_on_contract_id`(`contract_id`),
    INDEX `index_invoices_on_currency_id`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` INTEGER NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_item_assignments_on_item_id`(`item_id`),
    INDEX `index_item_assignments_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` INTEGER NULL,
    `company_id` INTEGER NULL,
    `asset_code` VARCHAR(255) NULL,
    `inventory_id` INTEGER NULL,
    `inventory_type` VARCHAR(255) NULL,
    `inventory_category` VARCHAR(255) NULL,
    `date_purchased` DATE NULL,
    `price` DECIMAL(12, 3) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_items_on_company_id`(`company_id`),
    INDEX `index_items_on_inventory_id_and_inventory_type`(`inventory_id`, `inventory_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_breakdowns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leave_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `leave_date` DATE NULL,
    `duration` DECIMAL(3, 1) NULL DEFAULT 0.0,
    `duration_type` VARCHAR(10) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_leave_breakdowns_on_leave_id`(`leave_id`),
    INDEX `index_leave_breakdowns_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_credit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leave_credit_id` INTEGER NULL,
    `action` VARCHAR(500) NULL,
    `remarks` VARCHAR(100) NULL,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_leave_credit_logs_on_leave_credit_id`(`leave_credit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_credits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `leave_type_id` INTEGER NULL,
    `leave_period_id` INTEGER NULL,
    `carried_over` FLOAT NULL,
    `remaining` FLOAT NULL,
    `applied` FLOAT NULL,
    `scheduled` FLOAT NULL,
    `taken` FLOAT NULL,
    `add_on` FLOAT NULL,
    `default` FLOAT NULL,
    `total` FLOAT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_leave_credits_on_leave_period_id`(`leave_period_id`),
    INDEX `index_leave_credits_on_leave_type_id`(`leave_type_id`),
    INDEX `index_leave_credits_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leave_id` INTEGER NULL,
    `action` VARCHAR(20) NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_leave_logs_on_leave_id`(`leave_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `from_date` DATE NULL,
    `to_date` DATE NULL,

    INDEX `index_leave_periods_on_company_id`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NULL,
    `company_id` INTEGER NULL,

    INDEX `index_leave_types_on_company_id`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `leave_type_id` INTEGER NULL,
    `starts_at` DATETIME(0) NULL,
    `ends_at` DATETIME(0) NULL,
    `status` ENUM('default', 'pending', 'approved', 'denied', 'expired', 'taken', 'canceled') NULL DEFAULT 'default',
    `type_of_leave` ENUM('vacation', 'sick', 'emergency', 'other') NULL DEFAULT 'vacation',
    `comments` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_leaves_on_status`(`status`),
    INDEX `index_leaves_on_type`(`type_of_leave`),
    INDEX `index_leaves_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memo_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no` VARCHAR(255) NULL,
    `memo_group_id` INTEGER NULL,
    `memo_type_id` INTEGER NULL,
    `name` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,

    INDEX `index_memo_categories_on_memo_type_id`(`memo_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memo_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memo_penalties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memo_type_id` INTEGER NULL,
    `offense_count` INTEGER NULL,
    `sequence_no` INTEGER NULL,
    `penalty` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memo_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtime_breakdown_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `overtime_id` INTEGER NULL,
    `overtime_breakdown_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_overtime_breakdown_logs_on_overtime_breakdown_id`(`overtime_breakdown_id`),
    INDEX `index_overtime_breakdown_logs_on_overtime_id`(`overtime_id`),
    INDEX `index_overtime_breakdown_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtime_breakdowns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `overtime_id` INTEGER NULL,
    `total_hours` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `total_deductions` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `wd_no_prem` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `wd_no_prem_night` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `wd_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `wd_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rd_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rd_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `sh_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `sh_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `sh_on_rd_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `sh_on_rd_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rh_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rh_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rh_on_rd_regular` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `rh_on_rd_premium` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `status` ENUM('Reviewed', 'For Review', 'Pending') NULL,

    INDEX `index_overtime_breakdowns_on_overtime_id`(`overtime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtime_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `overtime_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `action` VARCHAR(50) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_overtime_logs_on_overtime_id`(`overtime_id`),
    INDEX `index_overtime_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `starts_at` DATETIME(0) NULL,
    `ends_at` DATETIME(0) NULL,
    `status` ENUM('default', 'pending', 'approved', 'denied', 'canceled') NULL DEFAULT 'default',
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `project_name` VARCHAR(150) NULL,
    `with_meal_break` BOOLEAN NULL,

    INDEX `index_leaves_on_status`(`status`),
    INDEX `index_overtimes_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_terms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NULL,
    `sequence_no` INTEGER NULL,
    `no_of_days` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payroll_batch` VARCHAR(255) NULL,
    `payroll_period` VARCHAR(255) NULL,
    `payroll_date` DATE NULL,
    `status` BOOLEAN NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payslips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `payroll_batch` VARCHAR(255) NULL,
    `payroll_period` VARCHAR(255) NULL,
    `payroll_date` DATE NULL,
    `days_vl` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `days_sl` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `days_el` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `days_ol` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `days_absent` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `hours_late` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `hours_ot` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `dec_basic` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_vl` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_sl` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_el` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_ol` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_absences` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_lates` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_ot` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_late_credits` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_other_income` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_sss` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_ph` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_hdmf` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_tax` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_others` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_sss_salary` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_sss_calamity` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_hdmf_salary` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_hdmf_calamity` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_co_salary` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_co_gadget` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `less_loan_co_others` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `dec_net_pay` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `remarks` TEXT NULL,
    `send_email` BOOLEAN NULL DEFAULT false,
    `status` VARCHAR(20) NULL,
    `filename` VARCHAR(255) NULL,
    `payslip_sent_at` DATE NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_payslips_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_infos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `git_url` VARCHAR(255) NULL,
    `git_clone_link` VARCHAR(255) NULL,
    `github` VARCHAR(255) NULL,
    `bitbucket` VARCHAR(255) NULL,
    `trello` VARCHAR(255) NULL,
    `jira` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_project_infos_on_project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `project_role_id` INTEGER NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `allocation_rate` DECIMAL(5, 2) NULL DEFAULT 100.00,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_project_members_on_project_id`(`project_id`),
    INDEX `index_project_members_on_project_role_id`(`project_role_id`),
    INDEX `index_project_members_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `short_name` VARCHAR(10) NULL,
    `description` TEXT NULL,
    `is_evaluee` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `task_id` INTEGER NULL,

    INDEX `index_project_tasks_on_project_id`(`project_id`),
    INDEX `index_project_tasks_on_task_id`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `team_id` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_project_teams_on_project_id`(`project_id`),
    INDEX `index_project_teams_on_team_id`(`team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NULL,
    `name` VARCHAR(255) NULL,
    `type` VARCHAR(100) NULL,
    `client_id` INTEGER NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_projects_on_client_id`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schema_migrations` (
    `version` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `unique_schema_migrations`(`version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `value` VARCHAR(255) NULL,
    `details` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `occupants` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `due_at` DATETIME(0) NULL,
    `hero_points` TINYINT NULL,

    INDEX `index_task_assignments_on_due_at`(`due_at`),
    INDEX `index_task_assignments_on_task_id`(`task_id`),
    INDEX `index_task_assignments_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_authors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NULL,
    `user_id` INTEGER NULL,

    INDEX `index_task_authors_on_task_id`(`task_id`),
    INDEX `index_task_authors_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `time_entry_id` INTEGER NULL,
    `hours` TINYINT NULL,
    `minutes` TINYINT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_task_logs_on_task_id`(`task_id`),
    INDEX `index_task_logs_on_time_entry_id`(`time_entry_id`),
    INDEX `index_task_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NULL,
    `priority` ENUM('critical', 'high', 'medium', 'low', 'lowest') NOT NULL DEFAULT 'medium',
    `status` ENUM('pending', 'in progress', 'completed', 're-opened', 'closed', 'deleted') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_tasks_on_priority`(`priority`),
    INDEX `index_tasks_on_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `hero_name` VARCHAR(255) NULL,
    `team_id` INTEGER NULL,
    `role` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_team_members_on_team_id`(`team_id`),
    INDEX `index_team_members_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `slug` VARCHAR(255) NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_teams_on_email`(`email`),
    INDEX `index_teams_on_name`(`name`),
    INDEX `index_teams_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `status` ENUM('default', 'pending', 'approved', 'denied') NULL DEFAULT 'default',
    `project_id` INTEGER NULL,
    `date` DATE NULL,
    `starts_at` DATETIME(0) NULL,
    `finish_at` DATETIME(0) NULL,
    `timed_in_at_ip` VARCHAR(80) NULL,
    `timed_out_at_ip` VARCHAR(80) NULL,
    `should_start_at` DATETIME(0) NULL,
    `should_finish_at` DATETIME(0) NULL,
    `late_deduct_at` DATETIME(0) NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `parent_id` INTEGER NULL,
    `review_status` VARCHAR(255) NULL DEFAULT 'Pending',
    `is_late` BOOLEAN NULL DEFAULT false,
    `count_late` BOOLEAN NULL DEFAULT false,
    `user_memo_id` INTEGER NULL,

    INDEX `index_time_entries_on_finish`(`finish_at`, `should_finish_at`),
    INDEX `index_time_entries_on_project_id`(`project_id`),
    INDEX `index_time_entries_on_review_status`(`review_status`),
    INDEX `index_time_entries_on_should_start_at`(`should_start_at`),
    INDEX `index_time_entries_on_starts_at`(`starts_at`),
    INDEX `index_time_entries_on_status`(`status`),
    INDEX `index_time_entries_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_entry_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `time_entry_id` INTEGER NULL,
    `date` DATE NULL,
    `action` VARCHAR(255) NULL DEFAULT '',
    `late_status` VARCHAR(255) NULL,
    `is_late` BOOLEAN NULL,
    `is_memo` BOOLEAN NULL,
    `late_count` INTEGER NULL,
    `memo_count` INTEGER NULL,
    `remarks` VARCHAR(255) NULL DEFAULT '',
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_time_entry_logs_on_admin_id`(`admin_id`),
    INDEX `index_time_entry_logs_on_time_entry_id`(`time_entry_id`),
    INDEX `index_time_entry_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_contact_informations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `mobile` VARCHAR(30) NULL,
    `phone` VARCHAR(30) NULL,
    `personal_email` VARCHAR(255) NULL,
    `street_address` VARCHAR(150) NULL,
    `city` VARCHAR(80) NULL,
    `state` VARCHAR(80) NULL,
    `zip` VARCHAR(20) NULL,
    `country` VARCHAR(80) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_user_contact_informations_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `id_no` VARCHAR(10) NULL,
    `user_type` VARCHAR(100) NULL DEFAULT 'probationary',
    `user_position` VARCHAR(100) NULL DEFAULT '',
    `cm_id` INTEGER NULL,
    `sss_number` VARCHAR(100) NULL DEFAULT '',
    `hdmf_number` VARCHAR(100) NULL DEFAULT '',
    `tin_number` VARCHAR(100) NULL DEFAULT '',
    `philhealth_number` VARCHAR(100) NULL DEFAULT '',
    `bank_account_no` VARCHAR(50) NULL,
    `referred_by` VARCHAR(255) NULL,
    `date_regularized` DATE NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `end_remarks` TEXT NULL,
    `update_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_user_details_on_cm_id`(`cm_id`),
    INDEX `index_user_details_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_healths` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temperature` DECIMAL(5, 2) NULL,
    `cough` BOOLEAN NULL,
    `sore_throat` BOOLEAN NULL,
    `body_pain` BOOLEAN NULL,
    `others` VARCHAR(255) NULL,
    `recorded_at` VARCHAR(3) NULL,
    `user_id` INTEGER NULL,
    `time_entry_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_late_credits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `date` DATE NULL,
    `credits_earned` INTEGER NULL DEFAULT 0,
    `credits_left` INTEGER NULL DEFAULT 0,
    `admin_id` INTEGER NULL,
    `status` VARCHAR(255) NULL DEFAULT '',
    `availment` VARCHAR(255) NULL DEFAULT '',
    `date_availed` DATE NULL,
    `time_entry_id` INTEGER NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_user_late_credits_on_time_entry_id`(`time_entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_leaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `leave_credit_id` INTEGER NULL,
    `leave_id` INTEGER NULL,

    INDEX `index_user_leaves_on_leave_credit_id`(`leave_credit_id`),
    INDEX `index_user_leaves_on_leave_id`(`leave_id`),
    INDEX `index_user_leaves_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_memos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `date` DATE NULL,
    `memo_group_id` INTEGER NULL,
    `memo_category_id` INTEGER NULL,
    `offense_count` INTEGER NULL,
    `remarks` TEXT NULL,
    `status` VARCHAR(255) NULL,
    `date_served` DATE NULL,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_user_memos_on_admin_id`(`admin_id`),
    INDEX `index_user_memos_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_user_profiles_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,
    `user_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_setting_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_user_setting_logs_on_admin_id`(`admin_id`),
    INDEX `index_user_setting_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `setting` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `index_user_settings_on_name`(`name`),
    INDEX `index_user_settings_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `encrypted_password` VARCHAR(255) NOT NULL DEFAULT '',
    `uid` VARCHAR(255) NULL,
    `provider` VARCHAR(70) NULL,
    `first_name` VARCHAR(100) NULL,
    `middle_name` VARCHAR(75) NULL,
    `last_name` VARCHAR(75) NULL,
    `gender` ENUM('male', 'female') NULL,
    `birth_date` DATE NULL,
    `nationality` VARCHAR(50) NULL,
    `picture` VARCHAR(255) NULL,
    `authentication_token` VARCHAR(255) NULL,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_sent_at` DATETIME(0) NULL,
    `remember_created_at` DATETIME(0) NULL,
    `sign_in_count` INTEGER NOT NULL DEFAULT 0,
    `current_sign_in_at` DATETIME(0) NULL,
    `last_sign_in_at` DATETIME(0) NULL,
    `current_sign_in_ip` VARCHAR(255) NULL,
    `last_sign_in_ip` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `py_company_id` INTEGER NULL,
    `is_active` BOOLEAN NULL,
    `late_offense` INTEGER NULL DEFAULT 0,
    `late_count` INTEGER NULL DEFAULT 0,
    `for_memo` BOOLEAN NULL DEFAULT false,
    `late_credits` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `index_users_on_email`(`email`),
    UNIQUE INDEX `index_users_on_reset_password_token`(`reset_password_token`),
    INDEX `index_users_on_birth_date`(`birth_date`),
    INDEX `index_users_on_first_name_and_last_name`(`first_name`, `last_name`),
    INDEX `index_users_on_for_memo`(`for_memo`),
    INDEX `index_users_on_is_active`(`is_active`),
    INDEX `index_users_on_py_company_id`(`py_company_id`),
    INDEX `index_users_on_slug`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `approval_manifests` ADD CONSTRAINT `approval_manifests_approvers` FOREIGN KEY (`approver_id`) REFERENCES `approvers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_manifests` ADD CONSTRAINT `approval_manifests_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvers` ADD CONSTRAINT `approvers_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_ip_addresses` ADD CONSTRAINT `fk_rails_00326baf5d` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `company_teams` ADD CONSTRAINT `fk_rails_3abfc86e24` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `company_teams` ADD CONSTRAINT `fk_rails_c6b06a284e` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_users` ADD CONSTRAINT `fk_rails_e859b00397` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_breakdowns` ADD CONSTRAINT `fk_rails_d29ad84900` FOREIGN KEY (`leave_id`) REFERENCES `leaves`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_breakdowns` ADD CONSTRAINT `fk_rails_fd8236f8c4` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_credits` ADD CONSTRAINT `fk_rails_0f8cd61d12` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_credits` ADD CONSTRAINT `fk_rails_9509ed8b72` FOREIGN KEY (`leave_period_id`) REFERENCES `leave_periods`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_credits` ADD CONSTRAINT `leave_credits_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_periods` ADD CONSTRAINT `fk_rails_2c13d7641d` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leave_types` ADD CONSTRAINT `fk_rails_86c375c3f7` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtimes` ADD CONSTRAINT `overtimes_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_infos` ADD CONSTRAINT `fk_rails_ddb295a93d` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `fk_rails_13deef9e52` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `project_tasks` ADD CONSTRAINT `fk_rails_88d960144f` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `project_teams` ADD CONSTRAINT `fk_rails_534c359cda` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `project_teams` ADD CONSTRAINT `fk_rails_7cc6dea147` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_assignments` ADD CONSTRAINT `fk_rails_e6ca1bc3d3` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_assignments` ADD CONSTRAINT `task_assignments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_authors` ADD CONSTRAINT `fk_rails_627bcfb05f` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_authors` ADD CONSTRAINT `task_authors` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_logs` ADD CONSTRAINT `fk_rails_1ab4291341` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `task_logs` ADD CONSTRAINT `task_logs_time_entries` FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_logs` ADD CONSTRAINT `task_logs_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_team_id` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `fk_rails_67c5d3c478` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_contact_informations` ADD CONSTRAINT `fk_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_leaves` ADD CONSTRAINT `fk_rails_1f33144e3c` FOREIGN KEY (`leave_credit_id`) REFERENCES `leave_credits`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_leaves` ADD CONSTRAINT `fk_rails_9ee613ebb1` FOREIGN KEY (`leave_id`) REFERENCES `leaves`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_leaves` ADD CONSTRAINT `user_leaves_users_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

