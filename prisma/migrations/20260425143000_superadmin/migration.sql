ALTER TABLE `persona`
  MODIFY `rol` ENUM('superadmin', 'admin', 'camarero') NOT NULL DEFAULT 'camarero';
