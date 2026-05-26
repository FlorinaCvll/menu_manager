-- Datos de prueba completos para Menu Manager
-- Base de datos: MySQL/MariaDB
--
-- PINES USADOS:
-- Superadmin Plataforma: 9999
-- Admin La Casa Pepe:   1234
-- Camarera Ana:         1111
-- Camarero Luis:        2222
-- Admin Ropino:         3333
-- Camarera Marta:       4444
-- Solicitud El Rollo:   5555
-- Solicitud Bar Centro: 6666
--
-- Nota: la tabla persona guarda el PIN como hash bcrypt, no en claro.

START TRANSACTION;

INSERT INTO negocio
(idNegocio, nombre, direccion, telefono, estado, fechaAlta, CIF_NIF, documentoPropiedadUrl)
VALUES (999, 'MenuManager Plataforma', 'Panel interno', '000000000', 'activo', '2026-05-23', 'MENUMANAGER', NULL),
       (1001, 'La Casa Pepe', 'Calle Mayor 12, Avila', '920111222', 'activo', '2026-05-23', 'B12345678',
        '/uploads/solicitudes-alta/la-casa-pepe.png'),
       (1002, 'Ropino', 'Avenida Portugal 8, Salamanca', '923333444', 'activo', '2026-05-23', 'B87654321',
        '/uploads/solicitudes-alta/ropino.png') ON DUPLICATE KEY
UPDATE
    nombre =
VALUES (nombre), direccion =
VALUES (direccion), telefono =
VALUES (telefono), estado =
VALUES (estado), fechaAlta =
VALUES (fechaAlta), CIF_NIF =
VALUES (CIF_NIF), documentoPropiedadUrl =
VALUES (documentoPropiedadUrl);

INSERT INTO persona
(idPersona, nombre, apellidos, telefono, pin, rol, fechaAlta, fechaBaja, comentarios, idNegocio)
VALUES (999, 'Superadmin', 'MenuManager', '000000000', '$2b$10$mz/MeKESaHvalO8dnB8ZY.qDO8YNtvbimtqHtkferBcRVxtYNTFHy',
        'superadmin', '2026-05-23', NULL, 'Administrador de plataforma', 999),
       (1001, 'Pepe', 'Garcia Martin', '600111222', '$2b$10$1Fruz3Zrx0AZ7GD5B.iE9.9S6n6FrZ4YA3Bc.55KT8zPmqt/n/.EO',
        'admin', '2026-05-23', NULL, 'Administrador de La Casa Pepe', 1001),
       (1002, 'Ana', 'Lopez Ruiz', '611222333', '$2b$10$24WIZOsgi4VaFXZCGPIIFenYonLEuTseXdiJj3mqz19WBEOiacuZW',
        'camarero', '2026-05-23', NULL, 'Camarera turno de manana', 1001),
       (1003, 'Luis', 'Sanchez Perez', '622333444', '$2b$10$ZN3kx/pjj1StXsqR7jesfOAEYkgfUJs5pxzXXQE8b/GSnU2m0ByXW',
        'camarero', '2026-05-23', NULL, 'Camarero turno de tarde', 1001),
       (1004, 'Clara', 'Ropino Diaz', '633444555', '$2b$10$Dg5Lj84Fv2lDdDYG0CsiRelowihZqY1pLMsnsBjlLKJS.DTVbCBjG',
        'admin', '2026-05-23', NULL, 'Administradora de Ropino', 1002),
       (1005, 'Marta', 'Nieto Cano', '644555666', '$2b$10$9X4OoStV1IE3m/HHZtghU.nxiUVCFyHV08iXQFyWhpWmwqvARganW',
        'camarero', '2026-05-23', NULL, 'Camarera de Ropino', 1002) ON DUPLICATE KEY
UPDATE
    nombre =
VALUES (nombre), apellidos =
VALUES (apellidos), telefono =
VALUES (telefono), pin =
VALUES (pin), rol =
VALUES (rol), fechaAlta =
VALUES (fechaAlta), fechaBaja =
VALUES (fechaBaja), comentarios =
VALUES (comentarios), idNegocio =
VALUES (idNegocio);

INSERT INTO plato
    (idPlato, nombre, precioIndividual, ingredientes, alergenos, tipoPlato)
VALUES (1001, 'Ensalada mixta', 8.50, 'Lechuga, tomate, cebolla, atun, huevo y aceitunas', 'Huevo, pescado', 'primero'),
       (1002, 'Lentejas estofadas', 9.00, 'Lentejas, chorizo, patata, zanahoria y pimenton', 'Puede contener sulfitos',
        'primero'),
       (1003, 'Gazpacho andaluz', 6.50, 'Tomate, pepino, pimiento, ajo, pan, aceite y vinagre', 'Gluten', 'primero'),
       (1004, 'Pollo asado', 12.50, 'Pollo, patata panadera, ajo, limon y especias', 'Sin alergenos principales',
        'segundo'),
       (1005, 'Merluza a la romana', 13.50, 'Merluza, harina, huevo y limon', 'Pescado, gluten, huevo', 'segundo'),
       (1006, 'Carrillera al vino tinto', 14.90, 'Carrillera de cerdo, vino tinto, verduras y patata', 'Sulfitos',
        'segundo'),
       (1007, 'Tarta de queso', 4.50, 'Queso crema, nata, huevo, azucar y galleta', 'Lacteos, huevo, gluten', 'postre'),
       (1008, 'Flan casero', 4.00, 'Leche, huevo, azucar y caramelo', 'Lacteos, huevo', 'postre'),
       (1009, 'Arroz con leche', 4.20, 'Leche, arroz, canela, limon y azucar', 'Lacteos', 'postre'),
       (1010, 'Croquetas de jamon', 7.50, 'Bechamel, jamon, pan rallado y huevo', 'Gluten, lacteos, huevo', 'racion'),
       (1011, 'Patatas bravas', 6.00, 'Patata, salsa brava y alioli', 'Huevo', 'racion'),
       (1012, 'Calamares fritos', 9.50, 'Calamar, harina y limon', 'Moluscos, gluten', 'racion') ON DUPLICATE KEY
UPDATE
    nombre =
VALUES (nombre), precioIndividual =
VALUES (precioIndividual), ingredientes =
VALUES (ingredientes), alergenos =
VALUES (alergenos), tipoPlato =
VALUES (tipoPlato);

INSERT INTO menu
(idMenu, fecha, precio, precioMedio, precioTerraza, datosAdicionales, idPersona, idNegocio)
VALUES (1001, '2026-05-23', 15.00, 10.00, 17.00, 'Menu del dia de La Casa Pepe. Incluye pan, bebida y postre.', 1001,
        1001),
       (1002, '2026-05-24', 16.00, 11.00, 18.00, 'Menu especial de domingo.', 1001, 1001),
       (1003, '2026-05-23', 14.50, 9.50, 16.50, 'Menu del dia de Ropino. Incluye bebida.', 1004, 1002) ON DUPLICATE KEY
UPDATE
    fecha =
VALUES (fecha), precio =
VALUES (precio), precioMedio =
VALUES (precioMedio), precioTerraza =
VALUES (precioTerraza), datosAdicionales =
VALUES (datosAdicionales), idPersona =
VALUES (idPersona), idNegocio =
VALUES (idNegocio);

INSERT INTO menu_plato
    (idMenu, idPlato)
VALUES (1001, 1001),
       (1001, 1002),
       (1001, 1004),
       (1001, 1005),
       (1001, 1007),
       (1001, 1008),
       (1002, 1003),
       (1002, 1006),
       (1002, 1009),
       (1002, 1010),
       (1003, 1001),
       (1003, 1004),
       (1003, 1008),
       (1003, 1011),
       (1003, 1012) ON DUPLICATE KEY
UPDATE
    idMenu =
VALUES (idMenu), idPlato =
VALUES (idPlato);

INSERT INTO comanda
(idComanda, fecha, numMesa, numComensales, estado, empresa, idPersona, idNegocio)
VALUES (1001, '2026-05-23 13:15:00', 1, 2, 'abierta', false, 1002, 1001),
       (1002, '2026-05-23 13:40:00', 4, 4, 'abierta', false, 1003, 1001),
       (1003, '2026-05-23 14:05:00', 7, 3, 'cerrada', true, 1002, 1001),
       (1004, '2026-05-23 13:25:00', 2, 2, 'abierta', false, 1005, 1002),
       (1005, '2026-05-23 14:20:00', 5, 6, 'cerrada', true, 1005, 1002) ON DUPLICATE KEY
UPDATE
    fecha =
VALUES (fecha), numMesa =
VALUES (numMesa), numComensales =
VALUES (numComensales), estado =
VALUES (estado), empresa =
VALUES (empresa), idPersona =
VALUES (idPersona), idNegocio =
VALUES (idNegocio);

INSERT INTO comanda_plato
    (idComanda, idPlato, cantidad)
VALUES (1001, 1001, 1),
       (1001, 1004, 1),
       (1001, 1007, 2),
       (1002, 1002, 2),
       (1002, 1005, 2),
       (1002, 1011, 1),
       (1003, 1003, 3),
       (1003, 1006, 3),
       (1003, 1009, 3),
       (1004, 1011, 1),
       (1004, 1012, 1),
       (1005, 1001, 2),
       (1005, 1004, 4),
       (1005, 1008, 6) ON DUPLICATE KEY
UPDATE
    cantidad =
VALUES (cantidad);

INSERT INTO solicitud_alta
(idSolicitudAlta, nombreRestaurante, CIF_NIF, personaContacto, email, telefono, direccion, ciudad, numeroLocales,
 comentarios, documentoPropiedadUrl, adminPinHash, estado, stripeCheckoutSessionId, stripePaymentIntentId,
 fechaSolicitud, fechaPago, fechaRevision, motivoRechazo, idNegocioCreado, idPersonaAdminCreada)
VALUES (1001, 'El Rollo', 'B11223344', 'Sofia Romero', 'sofia@elrollo.example', '655111222', 'Calle San Segundo 4',
        'Avila', '1', 'Solicitud con pago confirmado y pendiente de revision final.',
        '/uploads/solicitudes-alta/el-rollo.pdf', '$2b$10$UOKnGqqy4zPiThZrSvQLOe93r1FyAOVPHbT.sBY5/GrxqrVhGAuia',
        'pago_confirmado', 'cs_test_elrollo_1001', 'pi_test_elrollo_1001', '2026-05-20 10:00:00', '2026-05-20 10:05:00',
        NULL, NULL, NULL, NULL),
       (1002, 'Bar Centro', 'B55667788', 'Mario Alonso', 'mario@barcentro.example', '655333444', 'Plaza del Mercado 1',
        'Salamanca', '2', 'Solicitud validada y negocio creado.', '/uploads/solicitudes-alta/bar-centro.pdf',
        '$2b$10$HQOuuZADDU2LkUIE9Wmy.epl4oMan3Oopaz55tU6VRx8MRZjnlM6i', 'validada', 'cs_test_barcentro_1002',
        'pi_test_barcentro_1002', '2026-05-18 09:30:00', '2026-05-18 09:34:00', '2026-05-19 12:00:00', NULL, 1002,
        1004) ON DUPLICATE KEY
UPDATE
    nombreRestaurante =
VALUES (nombreRestaurante), CIF_NIF =
VALUES (CIF_NIF), personaContacto =
VALUES (personaContacto), email =
VALUES (email), telefono =
VALUES (telefono), direccion =
VALUES (direccion), ciudad =
VALUES (ciudad), numeroLocales =
VALUES (numeroLocales), comentarios =
VALUES (comentarios), documentoPropiedadUrl =
VALUES (documentoPropiedadUrl), adminPinHash =
VALUES (adminPinHash), estado =
VALUES (estado), stripePaymentIntentId =
VALUES (stripePaymentIntentId), fechaSolicitud =
VALUES (fechaSolicitud), fechaPago =
VALUES (fechaPago), fechaRevision =
VALUES (fechaRevision), motivoRechazo =
VALUES (motivoRechazo), idNegocioCreado =
VALUES (idNegocioCreado), idPersonaAdminCreada =
VALUES (idPersonaAdminCreada);

COMMIT;
