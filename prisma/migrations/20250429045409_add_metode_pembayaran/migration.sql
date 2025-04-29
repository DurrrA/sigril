/*
  Warnings:

  - Added the required column `bukti_pembayaran` to the `transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `bukti_pembayaran` VARCHAR(191) NOT NULL;
