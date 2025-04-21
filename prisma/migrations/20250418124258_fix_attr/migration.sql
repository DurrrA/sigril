/*
  Warnings:

  - You are about to drop the column `tanggal_publish` on the `artikel` table. All the data in the column will be lost.
  - You are about to drop the column `harga_barang` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `nama_barang` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_review` on the `review` table. All the data in the column will be lost.
  - The primary key for the `tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tid` on the `tags` table. All the data in the column will be lost.
  - Added the required column `publishAt` to the `Artikel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `komentar` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `artikel` DROP FOREIGN KEY `Artikel_id_tags_fkey`;

-- DropIndex
DROP INDEX `Artikel_id_tags_fkey` ON `artikel`;

-- AlterTable
ALTER TABLE `artikel` DROP COLUMN `tanggal_publish`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_published` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publishAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `barang` DROP COLUMN `harga_barang`,
    DROP COLUMN `nama_barang`,
    ADD COLUMN `harga` DOUBLE NOT NULL,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `tanggal_review`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL,
    ADD COLUMN `komentar` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tags` DROP PRIMARY KEY,
    DROP COLUMN `tid`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Artikel` ADD CONSTRAINT `Artikel_id_tags_fkey` FOREIGN KEY (`id_tags`) REFERENCES `Tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
