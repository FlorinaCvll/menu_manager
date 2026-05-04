ALTER TABLE `negocio`
  ADD COLUMN `documentoPropiedadUrl` VARCHAR(255) NULL;

CREATE TABLE `solicitud_alta` (
    `idSolicitudAlta` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreRestaurante` VARCHAR(100) NOT NULL,
    `CIF_NIF` VARCHAR(20) NOT NULL,
    `personaContacto` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `direccion` VARCHAR(255) NOT NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `numeroLocales` VARCHAR(10) NOT NULL,
    `comentarios` TEXT NULL,
    `documentoPropiedadUrl` VARCHAR(255) NOT NULL,
    `adminPinHash` CHAR(100) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente_pago',
    `stripeCheckoutSessionId` VARCHAR(255) NULL,
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `fechaSolicitud` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fechaPago` DATETIME(0) NULL,
    `fechaRevision` DATETIME(0) NULL,
    `motivoRechazo` TEXT NULL,
    `idNegocioCreado` INTEGER NULL,
    `idPersonaAdminCreada` INTEGER NULL,

    UNIQUE INDEX `solicitud_alta_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    PRIMARY KEY (`idSolicitudAlta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
