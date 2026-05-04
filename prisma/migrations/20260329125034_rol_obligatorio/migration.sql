/*
  Warnings:

  - Made the column `rol` on table `persona` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `persona` MODIFY `rol` ENUM('admin', 'camarero', 'cocinero', 'gerente') NOT NULL DEFAULT 'camarero';
