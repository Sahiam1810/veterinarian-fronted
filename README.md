# Huellitas — Frontend

Frontend web del sistema de gestión veterinaria Huellitas. Es una SPA construida con React y TypeScript que reúne los flujos administrativos, clínicos, de recepción y de apoyo operativo de la clínica.

La aplicación utiliza una arquitectura modular por dominio y un modelo de autorización `permission-first`: el backend entrega los permisos efectivos del usuario y el frontend decide qué rutas, módulos y acciones puede mostrar.

## Contenido

- [Arquitectura y stack](#arquitectura-y-stack)
- [Módulos funcionales](#módulos-funcionales)
- [Autenticación y permisos](#autenticación-y-permisos)
- [Notificaciones en tiempo real](#notificaciones-en-tiempo-real)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Diseño de interfaz](#diseño-de-interfaz)
- [Configuración local](#configuración-local)
- [Scripts](#scripts)
- [Build y despliegue](#build-y-despliegue)

## Arquitectura y stack

- **React 19** (`^19.1.1`) para la interfaz y los flujos interactivos.
- **TypeScript 5.9** (`~5.9.2`) con compilación estricta.
- **Vite 7** (`^7.1.3`) para desarrollo, HMR y empaquetado de producción.
- **Tailwind CSS 4** (`^4.1.12`) y variables CSS para el sistema visual.
- **SignalR** (`@microsoft/signalr` `^10.0.11`) para notificaciones y eventos de chat en tiempo real.
- **Node Test Runner** para las pruebas, ejecutadas con `node --test` y `--experimental-strip-types`.
- **pnpm 11.24.0** como gestor de paquetes, según `package.json`.

El frontend consume la API REST del backend mediante el cliente centralizado `src/services/apiClient.ts`. La autenticación usa JWT, renovación de tokens y manejo común de errores HTTP.

## Módulos funcionales

### Autenticación — `src/modules/auth`

Incluye el inicio y cierre de sesión, recuperación del usuario actual, almacenamiento de sesión, renovación del token y consulta de permisos mediante `GET /api/auth/permissions`.

### Superadministrador y administrador — `src/modules/superadmin`

El shell administrativo genera el menú y las rutas según los permisos efectivos del usuario. Incluye:

- Dashboard con indicadores y resumen de citas.
- Usuarios, roles y permisos por módulo y acción.
- Mascotas y dueños.
- Especies y razas.
- Servicios.
- Profesionales, especialidades, disponibilidades y ausencias.
- Diagnósticos.
- Medicamentos, procedimientos e insumos.
- Agenda global.
- Órdenes médicas pendientes.
- Reportes.
- Perfil y notificaciones.

La edición de la tarifa de hospitalización se limita en la interfaz a Administrador y Superadministrador, además de la validación correspondiente en el backend.

### Veterinario — `src/modules/veterinario`

Incluye el shell clínico, agenda del profesional, mascotas, historia clínica, resultados clínicos, órdenes médicas y perfil. Las acciones de crear, editar y eliminar se habilitan de acuerdo con los permisos recibidos.

Las órdenes médicas pueden corresponder a medicamentos o procedimientos, y cuentan con vistas de detalle e impresión cuando el flujo lo requiere.

### Recepcionista — `src/modules/recepcionista`

Incluye:

- Inicio de recepción.
- Agenda del día y seguimiento de citas.
- Registro de pagos y validación de llegada.
- Dueños y mascotas, con búsqueda, paginación y fichas.
- Agendamiento rápido.
- Bandeja de asesoría y conversaciones escaladas.
- Hospitalización, incluyendo estancias pendientes de pago y registro del pago de una liquidación.

La navegación de recepción se filtra por permisos. Los módulos que el rol no tiene habilitados no aparecen en su menú.

### Hospitalización — `src/modules/hospitalizacion`

El módulo está disponible dentro de los shells que tienen acceso al permiso correspondiente e incluye:

- Admisión de una mascota y motivo de ingreso.
- Lista principal de estancias activas sin duplicar mascotas.
- Detalle de la estancia.
- Notas y evolución del paciente.
- Órdenes médicas e insumos asociados a la estancia, cuando están disponibles por permisos.
- Alta de la mascota.
- Historial de hospitalizaciones anteriores dentro de la ficha.
- Liquidación de la estancia.
- Bandeja de pendientes de pago para recepción.
- Revisión de conceptos y registro del pago.

Dar de alta una mascota no elimina su estancia. La estancia deja de pertenecer a la lista de activas, pero permanece consultable desde el historial y desde la bandeja de pagos pendientes.

### Auxiliar veterinario — `src/modules/auxiliar`

El flujo auxiliar permite consultar la operación asignada, gestionar la cola de pacientes y registrar información de preparación y signos vitales del paciente según los permisos del rol.

### Portal público — `src/modules/public`

Contiene la página pública de Política de Tratamiento de Datos Personales, accesible desde el flujo público de la aplicación sin requerir el shell interno.

El módulo `src/modules/cliente` existe en el repositorio, pero no forma parte del shell operativo actual; el flujo de acceso de clientes se mantiene separado del panel interno.

## Autenticación y permisos

### Resolución inicial por rol

`src/App.tsx` identifica el rol del usuario autenticado y renderiza el shell correspondiente:

- Usuario no autenticado: inicio de sesión.
- Cliente: el acceso al panel web se rechaza; la atención de clientes se mantiene por Telegram o chatbot.
- Veterinario: shell clínico.
- Recepcionista: shell de recepción.
- Auxiliar: shell operativo.
- Administrador, Superadministrador y roles configurables con acceso web: shell administrativo filtrado.

### Permisos por módulo

El backend entrega permisos con las acciones `canView`, `canCreate`, `canEdit` y `canDelete`. Los servicios de navegación transforman esos permisos en claves de menú para cada rol:

- `src/modules/auth/services/myPermissionsService.ts`
- `src/modules/veterinario/services/vetNavPermissionsService.ts`
- `src/modules/recepcionista/services/recepNavPermissionsService.ts`
- `src/global/navigation/resolveNav.ts`

El frontend controla tanto la visibilidad de las rutas como la disponibilidad de botones y operaciones. Esta validación visual complementa, pero no reemplaza, la autorización del backend.

La sesión se sincroniza entre pestañas del mismo navegador mediante eventos de `storage`. Al cambiar permisos en el backend puede ser necesario cerrar sesión e iniciar sesión nuevamente para obtener un JWT actualizado.

## Notificaciones en tiempo real

La conexión SignalR se centraliza en `src/global/notifications/notificationsHubManager.ts` y se comparte entre los módulos.

Se utiliza para:

- Notificaciones generales del sistema.
- Mensajes y eventos de conversaciones escaladas.
- Actualizaciones de la bandeja de recepción.
- Reconexión automática y renovación del token de acceso cuando corresponde.

Los hooks principales son `useNotificationsRealtime` y `useChatEscalationsRealtime`.

## Estructura del proyecto

```text
src/
├── App.tsx                         # Entrada de rutas y shells por rol
├── main.tsx                        # Punto de entrada de React
├── index.css                       # Estilos globales y tokens visuales
├── assets/                         # Logos, fondos y recursos visuales
├── config/                         # Lectura y validación de variables de entorno
├── services/                       # Cliente HTTP y servicios transversales
├── global/
│   ├── components/                 # Header, sidebar, modales, toast e iconos
│   ├── navigation/                 # Catálogos y resolución de navegación
│   ├── notifications/              # SignalR y eventos en tiempo real
│   └── utils/                      # Utilidades compartidas
├── modules/
│   ├── auth/                       # Autenticación y permisos
│   ├── auxiliar/                   # Operación auxiliar
│   ├── hospitalizacion/            # Estancias, historial y liquidaciones
│   ├── public/                     # Páginas públicas
│   ├── recepcionista/              # Recepción, agenda y asesoría
│   ├── superadmin/                 # Administración y catálogos
│   └── veterinario/                # Flujo clínico
├── stores/                         # Estado compartido cuando aplica
└── styles/                         # Estilos complementarios
```

Los módulos normalmente agrupan sus `components`, `hooks`, `pages`, `services`, `types` y `utils` según sus necesidades.

## Diseño de interfaz

El sistema visual utiliza una paleta cálida y natural, con fondos claros, verde institucional, terracota, salvia, arena y ocre. Los componentes compartidos proporcionan:

- Header con identidad del usuario, rol y notificaciones.
- Sidebars adaptadas al rol y a los permisos.
- Modales, drawers, toast y estados de carga reutilizables.
- Fondos ilustrados y texturas de marca.
- Transiciones suaves para vistas y paneles.
- Diseño responsive para escritorio, tablet y pantallas pequeñas.

La navegación y las acciones deben mantenerse consistentes con los componentes globales antes de crear componentes equivalentes dentro de un módulo.

## Configuración local

Requisitos:

- Node.js compatible con el proyecto.
- pnpm 11.
- Backend de Huellitas ejecutándose o accesible desde la URL configurada.

Copia `.env.example` como `.env` y ajusta la URL de la API:

```env
VITE_API_URL=http://localhost:5233
```

`.env` no debe subirse al repositorio. La configuración se consume desde `src/config/env.ts`.

Instala las dependencias:

```bash
pnpm install
```

Inicia el servidor de desarrollo:

```bash
pnpm dev
```

Vite utiliza normalmente el puerto `5174` en desarrollo.

## Scripts

Los scripts definidos en `package.json` son:

```bash
# Validar TypeScript
pnpm lint

# Compilar TypeScript y generar el bundle de producción
pnpm build

# Iniciar desarrollo y previsualizar producción
pnpm dev
pnpm preview

# Ejecutar todas las pruebas
pnpm test

# Ejecutar grupos de pruebas
pnpm test:auth
pnpm test:superadmin
pnpm test:recep
pnpm test:nav
pnpm test:vet
pnpm test:notifications
```

Las pruebas se encuentran en `tests/` y utilizan el ejecutor nativo de Node.js.

## Build y despliegue

El `Dockerfile` realiza un build multietapa:

1. Usa Node 22 Alpine.
2. Instala dependencias con `pnpm install --frozen-lockfile`.
3. Recibe `VITE_API_URL` como argumento de build.
4. Ejecuta `pnpm run build`.
5. Sirve el contenido generado en `dist/` mediante Nginx.

Ejemplo:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.tuclinica.com \
  -t huellitas-frontend .
```

La URL pública de la API debe estar disponible para el navegador. Un nombre interno de Docker, como `http://backend:8080`, no funciona como URL de consumo desde el navegador del usuario.

Antes de desplegar se recomienda ejecutar:

```bash
pnpm lint
pnpm test
pnpm build
```

El despliegue de infraestructura y backend se documenta en el repositorio correspondiente del backend.

---

Documentación técnica del frontend de Huellitas Veterinaria.
