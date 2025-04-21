-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `full_name` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'credentials',
    ADD COLUMN `provider_id` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `no_telp` VARCHAR(191) NULL,
    MODIFY `alamat` VARCHAR(191) NULL;
