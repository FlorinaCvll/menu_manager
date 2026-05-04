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

### Paso 6: Importar la Base de Datos

En lugar de ejecutar migraciones y seed con Prisma, importa el archivo de base de datos proporcionado (.sql).

1. Verifica que la base de datos `menumanager` esté creada en Laragon (como en la sección de configuración).
2. Abre HeidiSQL desde Laragon.
3. Conecta a la base de datos `menumanager`.
4. Ve a "Archivo" > "Ejecutar archivo SQL" y selecciona el archivo .sql proporcionado.
5. Ejecuta el archivo para importar todas las tablas y datos iniciales.

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

## Requisitos

Para instalar y ejecutar MenuManager, necesitas cumplir con los siguientes requisitos:

1. **Sistema Operativo**: Windows, macOS o Linux.
2. **Node.js**: Version 14 o superior. [Descargar Node.js](https://nodejs.org/).
3. **Base de Datos**: MySQL o MariaDB.
    - Si usas **MySQL**, asegúrate de tener el cliente de línea de comandos instalado.
    - Si usas **MariaDB**, asegúrate de tener el cliente de línea de comandos instalado.
4. **Stripe**: Cuenta de prueba en [Stripe](https://stripe.com/es) para el procesamiento de pagos.
5. **Navegador**: Chrome, Firefox, Safari o Edge para acceder a la aplicación web.

### 2. Base de Datos: Laragon (con MariaDB/MySQL)

- Laragon es un entorno de desarrollo local para Windows que incluye Apache, MySQL/MariaDB y PHP.
- Descárgalo desde [laragon.org](https://laragon.org/download/).
- Instala Laragon ejecutando el instalador (.exe).
- Inicia Laragon: Abre la aplicación y haz clic en "Start All" para iniciar los servicios (Apache, MySQL, etc.).
- Laragon incluye HeidiSQL para gestionar la base de datos.
- Crea la base de datos `menumanager`:
    - Abre HeidiSQL desde el menú de Laragon (botón derecho > HeidiSQL).
    - Conecta con usuario `root` y contraseña vacía (por defecto).
    - Ejecuta: `CREATE DATABASE menumanager;`
- La base de datos estará disponible en `localhost:3306` (puerto por defecto de MySQL en Laragon).
- Si prefieres instalar MySQL/MariaDB por separado (sin Laragon), instala MySQL
  desde [mysql.com](https://dev.mysql.com/downloads/mysql/) o MariaDB
  desde [mariadb.org](https://mariadb.org/download/), y crea la base de datos manualmente.

### 3. Editor de Código: WebStorm

- WebStorm es un IDE potente para desarrollo web, con soporte nativo para TypeScript, React y Next.js.
- Descárgalo desde [jetbrains.com/webstorm](https://www.jetbrains.com/webstorm/download/).
- Instala WebStorm ejecutando el instalador.
- Activa con una licencia (gratuita para estudiantes o prueba de 30 días).

### 4. Git

- Instala Git desde [git-scm.com](https://git-scm.com/downloads) si no lo tienes.

### 5. Cuenta de Stripe (para pagos)

- Crea una cuenta en [Stripe](https://stripe.com) en modo test.
- Obtén tu clave secreta de prueba (comienza con `sk_test_`).
- Para webhooks (opcional en desarrollo), configura un endpoint en Stripe Dashboard.

## Configuración de la Base de Datos en Laragon

1. Después de instalar e iniciar Laragon, verifica que MySQL esté corriendo (debería aparecer verde en la interfaz de
   Laragon).
2. Abre HeidiSQL: En la interfaz de Laragon, haz clic derecho en el área de notificaciones > "HeidiSQL".
3. En HeidiSQL:
    - Sesión nueva: Host: `localhost`, Usuario: `root`, Contraseña: (vacía), Puerto: `3306`.
    - Haz clic en "Abrir" para conectar.
4. Una vez conectado, en el panel izquierdo, haz clic derecho en el espacio vacío > "Crear nueva" > "Base de datos".
5. Nombre: `menumanager`, Charset: `utf8mb4`, Collate: `utf8mb4_general_ci`.
6. Haz clic en "OK" para crear la base de datos.
7. La base de datos estará lista para usar con Prisma.

## Pasos de Instalación

### Paso 1: Clonar el Repositorio

1. Abre Command Prompt o PowerShell.
2. Navega a la carpeta donde quieres clonar el proyecto, por ejemplo:
   ```
   cd C:\Users\Usuario\Documents
   ```
3. Clona el repositorio:
   ```
   git clone https://github.com/usuario/menu_manager.git
   ```
   (Reemplaza con la URL real del repositorio si es privado).
4. Entra en la carpeta del proyecto:
   ```
   cd menu_manager
   ```

### Paso 2: Abrir el Proyecto en WebStorm

1. Abre WebStorm.
2. Ve a "File" > "Open" y selecciona la carpeta `menu_manager` que clonaste.
3. WebStorm detectará automáticamente el proyecto Next.js y configurará TypeScript, ESLint, etc.
4. Espera a que WebStorm indexe el proyecto (puede tomar unos minutos la primera vez).
5. En la barra lateral, verás la estructura de archivos. El punto de entrada es `app/layout.tsx`.

### Paso 3: Instalar Dependencias

El proyecto utiliza Bun para la gestión de dependencias (hay un archivo `bun.lock`).

1. En WebStorm, abre la terminal integrada (View > Tool Windows > Terminal).
2. Instala las dependencias:
   ```
   bun install
   ```
   Esto instalará todas las librerías listadas en `package.json`, incluyendo Next.js, Prisma, Stripe SDK, etc.

### Paso 4: Configurar Variables de Entorno

1. En WebStorm, abre el archivo `.env` (en la raíz del proyecto).
2. Configura las variables necesarias. Copia el contenido y ajusta según tu configuración:

   ```env
   # URL de conexión a la base de datos (formato MySQL)
   DATABASE_URL="mysql://root:@localhost:3306/menumanager"

   # Variables separadas para el seed (opcional, pero usado en seed.ts)
   DATABASE_HOST="localhost"
   DATABASE_USER="root"
   DATABASE_PASSWORD=""  # Deja vacío si no tienes contraseña
   DATABASE_NAME="menumanager"

   # Configuración de pagos
   PAYMENT_PROVIDER="stripe"
   STRIPE_SECRET_KEY="sk_test_51TQ2kOGSVXF16KnKVhKnBbd8QvzXid5TbaPnLmy1U25Kohsjee0TvoXWl9YpPSTho9Z5OXng4y9JjWwgKW76YMk800WlKdiMMl"
   STRIPE_AMOUNT_CENTS="9900"  # Monto en céntimos (99.00 EUR)

   # Opcional: Para webhooks en producción
   STRIPE_WEBHOOK_SECRET="whsec_webhook_secret"
   STRIPE_PRICE_ID="price_price_id"  # Si usas un precio predefinido en Stripe
   ```

    - **DATABASE_URL**: Verifica que coincida con tu instalación de MySQL en Laragon. El puerto 3306 es estándar.
    - **STRIPE_SECRET_KEY**: Obtén una clave de prueba desde tu dashboard de Stripe. No uses la clave de ejemplo en
      producción.
    - Si no configuras `STRIPE_WEBHOOK_SECRET`, los webhooks no funcionarán, pero para desarrollo local no es crítico.

### Paso 5: Generar el Cliente de Prisma

Prisma genera un cliente TypeScript basado en el esquema de la base de datos.

1. En la terminal de WebStorm, ejecuta:
   ```
   bunx prisma generate
   ```
   Esto crea el cliente en `generated/prisma/`.

### Paso 6: Importar la Base de Datos

En lugar de ejecutar migraciones y seed con Prisma, importa el archivo de base de datos proporcionado (.sql).

1. Verifica que la base de datos `menumanager` esté creada en Laragon (como en la sección de configuración).
2. Abre HeidiSQL desde Laragon.
3. Conecta a la base de datos `menumanager`.
4. Ve a "Archivo" > "Ejecutar archivo SQL" y selecciona el archivo .sql proporcionado.
5. Ejecuta el archivo para importar todas las tablas y datos iniciales.

### Paso 7: Verificar la Instalación

1. Construye el proyecto para verificar que no hay errores:
   ```
   bun run build
   ```
2. Si hay errores, revisa los logs y corrige (por ejemplo, dependencias faltantes).

### Paso 8: Ejecutar el Servidor de Desarrollo

1. En la terminal de WebStorm, inicia el servidor:
   ```
   bun run dev
   ```
    - El servidor correrá en `http://localhost:3000` por defecto.
    - Abre tu navegador y ve a `http://localhost:3000`.

## Uso Básico de la Aplicación

- **Landing y Alta**: Ve a `/` para el formulario de compra/alta de restaurante.
- **Login**: Usa `/login` con las credenciales de prueba.
- **Paneles**:
    - Superadmin: `/superadmin/altas` (revisa solicitudes).
    - Admin: `/admin` (gestiona usuarios, platos, menús).
    - Camarero: `/camarero` (consulta menú, crea comandas).
- **Pagos**: Usa la tarjeta de prueba de Stripe: `4242 4242 4242 4242`, fecha `12/34`, CVC `123`.

## Solución de Problemas Comunes

- **Error de conexión a DB**: Verifica que Laragon esté iniciado y que `DATABASE_URL` sea correcta. Usa HeidiSQL para
  probar la conexión.
- **Errores de Prisma**: Verifica que `bunx prisma generate` se haya ejecutado después de cambios en `schema.prisma`.
- **Errores de Stripe**: Obtén una nueva clave secreta de Stripe si la actual es inválida.
- **Puertos ocupados**: Si el puerto 3000 está en uso, cambia en `next.config.ts` o usa `--port 3001`.
- **Dependencias**: Si `bun install` falla, borra `node_modules` y `bun.lock` y vuelve a instalar.
- **Windows específico**: Usa PowerShell para comandos largos. Verifica que Bun esté en el PATH.

## Configuración para Producción

- Cambia `NODE_ENV` a "production".
- Configura `STRIPE_WEBHOOK_SECRET` para webhooks reales.
- Usa una base de datos externa (no localhost).
- Configura variables de entorno en el servidor (ej. Vercel, Railway).
- Para despliegue: `bun run build` y `bun run start`.

## Estructura del Proyecto

- `app/`: Páginas de Next.js (App Router).
- `api/`: Endpoints de API.
- `components/`: Componentes React.
- `lib/`: Utilidades (Prisma, Stripe, auth).
- `prisma/`: Esquema, migraciones, seed.
- `public/`: Archivos estáticos y uploads.

Este manual cubre una instalación completa con Laragon, WebStorm e importación de base de datos. Si encuentras errores,
proporciona los logs para asistencia adicional.
