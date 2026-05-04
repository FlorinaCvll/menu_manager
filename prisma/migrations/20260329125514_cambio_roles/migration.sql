/*
  Warnings:

  - The values [cocinero,gerente] on the enum `persona_rol` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `persona` MODIFY `rol` ENUM('admin', 'camarero') NOT NULL DEFAULT 'camarero';
