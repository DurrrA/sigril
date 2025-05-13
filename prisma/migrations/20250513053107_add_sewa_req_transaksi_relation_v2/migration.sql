-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `id_sewa_req` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Transaksi_id_sewa_req_fkey` ON `transaksi`(`id_sewa_req`);
