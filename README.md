# MenuManager

MenuManager es una aplicacion web para la gestion diaria de restaurantes. El
proyecto centraliza el alta de negocios, la validacion documental, el pago en
modo test con Stripe, la gestion de usuarios, la creacion de menus diarios y el
registro de comandas desde una vista adaptada a PDA o movil.

El objetivo del proyecto es ofrecer un flujo completo y demostrable para un TFG:
desde la solicitud de alta del restaurante hasta la operativa diaria de sala y
administracion.

## Roles

- `superadmin`: usuario de plataforma. Revisa altas, pagos y documentos antes de activar negocios.
- `admin`: responsable de restaurante. Gestiona usuarios, platos, menus y ajustes.
- `camarero`: usuario operativo. Consulta el menu del dia y crea o edita comandas.

## Credenciales de desarrollo

Superadmin de plataforma:

```txt
ID negocio: 999
ID usuario: 999
PIN: 9999
```

Admin restaurante de prueba:

```txt
ID negocio: 1
ID usuario: 1
PIN: 1234
```

Camarero de prueba:

```txt
ID negocio: 1
ID usuario: 2
PIN: 1111
```

## Flujo de alta

1. El cliente rellena el formulario publico en `/#compra`.
2. El backend guarda los datos de la solicitud y el documento de titularidad.
3. La aplicacion crea una sesion de Stripe Checkout en modo test.
4. Stripe devuelve al usuario a `/alta/success` y se verifica el pago.
5. El superadmin revisa la solicitud en `/superadmin/altas`.
6. Si el pago y el documento son correctos, se activa el negocio.
7. El restaurante accede por `/login` con sus credenciales iniciales.

Tarjeta de prueba de Stripe:

```txt
4242 4242 4242 4242
Caducidad: 12/34
CVC: 123
```

## Rutas principales

- `/`: landing y formulario de compra/alta.
- `/login`: acceso de usuarios.
- `/superadmin/altas`: validacion de altas de plataforma.
- `/admin`: panel principal del restaurante.
- `/admin/usuarios`: gestion de usuarios del restaurante.
- `/admin/menus`: creacion del menu diario.
- `/admin/postres`: gestion de postres.
- `/admin/raciones`: gestion de raciones.
- `/admin/ajustes`: datos del negocio.
- `/camarero`: panel operativo.
- `/camarero/menuDia`: consulta del menu del dia.
- `/camarero/comandas`: creacion y cierre de comandas.

## Instalacion

```bash
npm install
```

Configura `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/menumanager"
DATABASE_HOST="localhost"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="menumanager"

PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_AMOUNT_CENTS="9900"
```

Aplica migraciones y datos iniciales:

```bash
npx prisma migrate dev
npx prisma db seed
```

Arranca desarrollo:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Modelo de datos resumido

- `negocio`: restaurante dado de alta en la plataforma.
- `persona`: usuarios de plataforma o restaurante.
- `solicitud_alta`: solicitudes previas a la activacion del negocio.
- `plato`: platos disponibles para menus, postres y raciones.
- `menu`: menu diario por negocio y fecha.
- `comanda`: pedido de mesa, con estado `abierta` o `cerrada`.
- `comanda_plato`: relacion entre comanda, plato y cantidad.

## Modelo comercial propuesto

El proyecto puede justificarse con un pago inicial de alta y soporte limitado
incluido:

- pago unico por activacion del negocio,
- validacion documental,
- configuracion inicial,
- dos solicitudes de soporte incluidas,
- soporte adicional facturable a partir de la tercera solicitud.

El precio final deberia justificarse mediante un escandallo que tenga en cuenta
costes de infraestructura, tiempo de configuracion, soporte incluido, comisiones
de pasarela y margen comercial.

## Alcance TFG

El proyecto prioriza un flujo completo, demostrable y razonable para presentar:

- registro comercial con documento,
- pago test con Stripe,
- validacion por superadmin,
- activacion de negocio,
- gestion interna del restaurante,
- operativa de camarero y comandas.

## Mejoras futuras

- Mover documentos a almacenamiento privado y servirlos solo por API protegida.
- Asociar platos a cada negocio para reforzar el modelo multi-restaurante.
- Enviar email real al aprobar un alta.
- Crear una auditoria de acciones del superadmin.
- Implementar solicitudes de soporte con escandallo y cobro a partir de la tercera.
- Anadir tests de login, alta y comandas.

Para produccion real tambien seria necesario rotar claves, activar webhooks de
Stripe permanentes y separar infraestructura de desarrollo y produccion.
