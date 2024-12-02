/*
  Warnings:

  - You are about to alter the column `category` on the `preferreddrink` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `preferreddrink` MODIFY `category` VARCHAR(191) NULL;
