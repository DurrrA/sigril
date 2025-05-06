/*
  Warnings:

  - Added the required column `end_date` to the `keranjang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rental_days` to the `keranjang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `keranjang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alasan` to the `penalti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_sewa` to the `penalti` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `penalti` DROP FOREIGN KEY `Penalti_id_barang_fkey`;

-- DropForeignKey
ALTER TABLE `penalti` DROP FOREIGN KEY `Penalti_id_user_fkey`;

-- AlterTable
ALTER TABLE `keranjang` ADD COLUMN `end_date` DATETIME(3) NOT NULL,
    ADD COLUMN `rental_days` INTEGER NOT NULL,
    ADD COLUMN `start_date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `penalti` ADD COLUMN `alasan` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_sewa` INTEGER NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE `sewa_req` ADD COLUMN `has_been_inspected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `payment_status` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
    ADD COLUMN `penalties_applied` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `total_amount` DOUBLE NULL;

-- CreateIndex
CREATE INDEX `penalti_id_sewa_idx` ON `penalti`(`id_sewa`);

-- AddForeignKey
ALTER TABLE `penalti` ADD CONSTRAINT `penalti_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penalti` ADD CONSTRAINT `penalti_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penalti` ADD CONSTRAINT `penalti_id_sewa_fkey` FOREIGN KEY (`id_sewa`) REFERENCES `sewa_req`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `penalti` RENAME INDEX `Penalti_id_barang_fkey` TO `penalti_id_barang_idx`;

-- RenameIndex
ALTER TABLE `penalti` RENAME INDEX `Penalti_id_user_fkey` TO `penalti_id_user_idx`;
