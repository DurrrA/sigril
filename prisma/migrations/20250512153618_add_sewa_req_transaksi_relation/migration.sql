/*
  Warnings:

  - A unique constraint covering the columns `[id_transaksi]` on the table `sewa_req` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `sewa_req` ADD COLUMN `id_transaksi` INTEGER NULL;

-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `payment_method` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `sewa_req_id_transaksi_key` ON `sewa_req`(`id_transaksi`);

-- CreateIndex
CREATE INDEX `sewa_req_id_transaksi_idx` ON `sewa_req`(`id_transaksi`);

-- AddForeignKey
ALTER TABLE `sewa_req` ADD CONSTRAINT `sewa_req_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
