-- CreateTable
CREATE TABLE `comanda` (
    `idComanda` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(0) NOT NULL,
    `numMesa` INTEGER NOT NULL,
    `numComensales` INTEGER NOT NULL,
    `empresa` BOOLEAN NULL DEFAULT false,
    `idPersona` INTEGER NOT NULL,
    `idNegocio` INTEGER NOT NULL,

    INDEX `idNegocio`(`idNegocio`),
    INDEX `idPersona`(`idPersona`),
    PRIMARY KEY (`idComanda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comanda_plato` (
    `idComanda` INTEGER NOT NULL,
    `idPlato` INTEGER NOT NULL,

    INDEX `idPlato`(`idPlato`),
    PRIMARY KEY (`idComanda`, `idPlato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `idMenu` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `precioMedio` DECIMAL(10, 2) NOT NULL,
    `precioTerraza` DECIMAL(10, 2) NOT NULL,
    `datosAdicionales` TEXT NULL,
    `idPersona` INTEGER NOT NULL,
    `idNegocio` INTEGER NOT NULL,

    INDEX `fk_menu_persona`(`idPersona`),
    UNIQUE INDEX `idNegocio`(`idNegocio`, `fecha`),
    PRIMARY KEY (`idMenu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_plato` (
    `idMenu` INTEGER NOT NULL,
    `idPlato` INTEGER NOT NULL,

    INDEX `idPlato`(`idPlato`),
    PRIMARY KEY (`idMenu`, `idPlato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `negocio` (
    `idNegocio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `direccion` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `estado` VARCHAR(50) NULL DEFAULT 'activo',
    `fechaAlta` DATE NULL,
    `CIF_NIF` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`idNegocio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persona` (
    `idPersona` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(150) NULL,
    `telefono` VARCHAR(20) NULL,
    `pin` CHAR(4) NOT NULL,
    `rol` ENUM('admin', 'camarero', 'cocinero', 'gerente') NULL DEFAULT 'camarero',
    `fechaAlta` DATE NULL,
    `fechaBaja` DATE NULL,
    `comentarios` TEXT NULL,
    `idNegocio` INTEGER NOT NULL,

    INDEX `fk_persona_negocio`(`idNegocio`),
    PRIMARY KEY (`idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plato` (
    `idPlato` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `precioIndividual` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `ingredientes` TEXT NULL,
    `alergenos` TEXT NULL,
    `tipoPlato` ENUM('primero', 'segundo', 'postre', 'racion') NOT NULL,

    PRIMARY KEY (`idPlato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comanda` ADD CONSTRAINT `comanda_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona`(`idPersona`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comanda` ADD CONSTRAINT `comanda_ibfk_2` FOREIGN KEY (`idNegocio`) REFERENCES `negocio`(`idNegocio`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comanda_plato` ADD CONSTRAINT `comanda_plato_ibfk_1` FOREIGN KEY (`idComanda`) REFERENCES `comanda`(`idComanda`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comanda_plato` ADD CONSTRAINT `comanda_plato_ibfk_2` FOREIGN KEY (`idPlato`) REFERENCES `plato`(`idPlato`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `fk_menu_negocio` FOREIGN KEY (`idNegocio`) REFERENCES `negocio`(`idNegocio`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `fk_menu_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona`(`idPersona`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu_plato` ADD CONSTRAINT `menu_plato_ibfk_1` FOREIGN KEY (`idMenu`) REFERENCES `menu`(`idMenu`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu_plato` ADD CONSTRAINT `menu_plato_ibfk_2` FOREIGN KEY (`idPlato`) REFERENCES `plato`(`idPlato`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `persona` ADD CONSTRAINT `fk_persona_negocio` FOREIGN KEY (`idNegocio`) REFERENCES `negocio`(`idNegocio`) ON DELETE CASCADE ON UPDATE CASCADE;
