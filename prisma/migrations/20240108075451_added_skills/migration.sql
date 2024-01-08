-- CreateTable
CREATE TABLE `skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skill_category_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NULL,
    `sequence_no` INTEGER NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_skill_category_id_fkey` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
