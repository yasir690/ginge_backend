/*
  Warnings:

  - You are about to alter the column `category` on the `recommendeddrink` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `drinkrecord` MODIFY `category` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `recommendeddrink` MODIFY `category` VARCHAR(191) NULL;
