/*
  Warnings:

  - Made the column `full_name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `full_name` VARCHAR(191) NOT NULL;
