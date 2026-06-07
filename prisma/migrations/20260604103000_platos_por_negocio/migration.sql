ALTER TABLE `plato`
    ADD COLUMN `idNegocio` INTEGER NULL;

CREATE
TEMPORARY TABLE `tmp_plato_uso_negocio` AS
SELECT DISTINCT mp.`idPlato`, m.`idNegocio`
FROM `menu_plato` mp
         INNER JOIN `menu` m ON m.`idMenu` = mp.`idMenu`
UNION
SELECT DISTINCT cp.`idPlato`, c.`idNegocio`
FROM `comanda_plato` cp
         INNER JOIN `comanda` c ON c.`idComanda` = cp.`idComanda`;

CREATE
TEMPORARY TABLE `tmp_plato_dueno` AS
SELECT `idPlato`, MIN(`idNegocio`) AS `idNegocio`
FROM `tmp_plato_uso_negocio`
GROUP BY `idPlato`;

UPDATE `plato` p
    INNER JOIN `tmp_plato_dueno` d
ON d.`idPlato` = p.`idPlato`
    SET p.`idNegocio` = d.`idNegocio`;

UPDATE `plato`
SET `idNegocio` = COALESCE(
        (SELECT MIN(n.`idNegocio`) FROM `negocio` n WHERE n.`idNegocio` <> 999),
        (SELECT MIN(n.`idNegocio`) FROM `negocio` n)
                  )
WHERE `idNegocio` IS NULL;

INSERT INTO `plato` (`nombre`,
                     `precioIndividual`,
                     `ingredientes`,
                     `alergenos`,
                     `tipoPlato`,
                     `idNegocio`)
SELECT p.`nombre`,
       p.`precioIndividual`,
       p.`ingredientes`,
       p.`alergenos`,
       p.`tipoPlato`,
       u.`idNegocio`
FROM `tmp_plato_uso_negocio` u
         INNER JOIN `tmp_plato_dueno` d ON d.`idPlato` = u.`idPlato`
         INNER JOIN `plato` p ON p.`idPlato` = u.`idPlato`
WHERE u.`idNegocio` <> d.`idNegocio`;

UPDATE `menu_plato` mp
    INNER JOIN `menu` m
ON m.`idMenu` = mp.`idMenu`
    INNER JOIN `plato` original ON original.`idPlato` = mp.`idPlato`
    INNER JOIN `plato` copia ON
    copia.`idNegocio` = m.`idNegocio`
    AND copia.`tipoPlato` = original.`tipoPlato`
    AND copia.`nombre` = original.`nombre`
    AND copia.`precioIndividual` <=> original.`precioIndividual`
    AND copia.`ingredientes` <=> original.`ingredientes`
    AND copia.`alergenos` <=> original.`alergenos`
    SET mp.`idPlato` = copia.`idPlato`
WHERE original.`idNegocio` <> m.`idNegocio`;

UPDATE `comanda_plato` cp
    INNER JOIN `comanda` c
ON c.`idComanda` = cp.`idComanda`
    INNER JOIN `plato` original ON original.`idPlato` = cp.`idPlato`
    INNER JOIN `plato` copia ON
    copia.`idNegocio` = c.`idNegocio`
    AND copia.`tipoPlato` = original.`tipoPlato`
    AND copia.`nombre` = original.`nombre`
    AND copia.`precioIndividual` <=> original.`precioIndividual`
    AND copia.`ingredientes` <=> original.`ingredientes`
    AND copia.`alergenos` <=> original.`alergenos`
    SET cp.`idPlato` = copia.`idPlato`
WHERE original.`idNegocio` <> c.`idNegocio`;

ALTER TABLE `plato` MODIFY `idNegocio` INTEGER NOT NULL;
CREATE INDEX `fk_plato_negocio` ON `plato` (`idNegocio`);
ALTER TABLE `plato`
    ADD CONSTRAINT `fk_plato_negocio` FOREIGN KEY (`idNegocio`) REFERENCES `negocio` (`idNegocio`) ON DELETE CASCADE ON UPDATE CASCADE;
