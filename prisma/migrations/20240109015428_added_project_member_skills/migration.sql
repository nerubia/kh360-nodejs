-- CreateTable
CREATE TABLE `project_member_skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_member_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_member_skills` ADD CONSTRAINT `project_member_skills_project_member_id_fkey` FOREIGN KEY (`project_member_id`) REFERENCES `project_members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member_skills` ADD CONSTRAINT `project_member_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
