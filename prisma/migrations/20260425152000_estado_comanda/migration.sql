ALTER TABLE `comanda`
  ADD COLUMN `estado` VARCHAR(20) NOT NULL DEFAULT 'abierta';

UPDATE `comanda` c
SET c.`estado` = 'cerrada'
WHERE EXISTS (
  SELECT 1
  FROM `comanda_plato` cp
  INNER JOIN `plato` p ON p.`idPlato` = cp.`idPlato`
  WHERE cp.`idComanda` = c.`idComanda`
    AND p.`tipoPlato` = 'postre'
);
