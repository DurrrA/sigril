/*
  Warnings:

  - Added the required column `deskripsi` to the `barang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `barang` ADD COLUMN `deskripsi` VARCHAR(191) NOT NULL;
