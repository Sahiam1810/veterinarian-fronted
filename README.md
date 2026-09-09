# Documentación Técnica del Frontend — Sistema de Gestión Veterinaria (Huellitas)

Frontend modular y escalable construido como una Aplicación de Página Única (SPA) orientada a roles y permisos granulares para la gestión integral de una clínica veterinaria.

---

## 1. Arquitectura General del Proyecto

### 1.1 Visión General
El frontend gestiona los flujos clínicos, administrativos, operativos y de recepción a través de una interfaz moderna, reactiva, accesible y optimizada. La aplicación se conecta a una API REST en ASP.NET Core con autenticación JWT, rotación transparente de tokens y control de acceso basado en permisos por módulo y acción.

### 1.2 Stack Tecnológico
- **Framework & Librería Principal:** [React 19](https://react.dev/) (`^19.1.1`) con [TypeScript](https://www.typescriptlang.org/) (`~5.9.2`).
- **Herramienta de Construcción:** [Vite 7](https://vite.dev/) (`^7.1.3`) con soporte de HMR y compilación ultrarrápida.
- **Estilos & Diseño:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite` + `tailwindcss` `^4.1.12`), CSS Vanilla modular, variables de diseño y paleta cromática corporativa.
- **Iconografía:** Iconos SVG personalizados, estilizados y parametrizables centralizados en `@/global/components`.
- **Gestión de Estado & Red:** Custom Hooks de React, Context API (`useAuth`), cliente HTTP centralizado (`apiClient`) con interceptores de refresh token, manejo de errores tipados (`ApiError`) y soporte contra errores de codificación (Mojibake).
- **Testing:** Node.js Test Runner nativo con `--experimental-strip-types` para ejecución de pruebas unitarias ultrarrápidas sin dependencias externas pesadas.
- **Gestor de Paquetes:** `pnpm` (v11+).

---

## 2. Estructura del Proyecto

```
src/
├── App.tsx                     # Enrutador dinámico por roles y permisos
├── main.tsx                    # Punto de entrada de la aplicación React
├── index.css                   # Tokens de diseño Tailwind CSS y directivas globales
├── config/                     # Configuración de variables de entorno y constantes
├── services/
│   └── apiClient.ts            # Cliente HTTP fetch con interceptor JWT y rotación de tokens
├── global/                     # Recursos transversales compartidos
│   ├── components/             # BrandLogo, PageToast, Icons, Modales genéricos
│   ├── navigation/             # Definiciones de permisos y resolución de menús
│   ├── styles/                 # Estilos y animaciones reutilizables
│   └── types/                  # Tipos globales de la aplicación
└── modules/                    # Módulos encapsulados por dominio y rol
    ├── auth/                   # Autenticación, sesión, JWT y consulta de permisos
    ├── superadmin/             # Panel maestro / Administrador (Usuarios, Catálogos, Reportes)
    ├── veterinario/            # Flujo clínico (Agenda médica, Pacientes, Historia Clínica)
    ├── recepcionista/          # Flujo de recepción (Agenda diaria, Citas, Dueños, Mascotas)
    ├── auxiliar/               # Flujo operativo (Triaje, Signos vitales, Cola de atención)
    └── cliente/                # Componentes y modelos base de clientes/tutores
```

Cada módulo dentro de `src/modules/` sigue una estructura cohesiva e independiente:
```
module_name/
├── assets/                     # Imágenes, ilustraciones y recursos locales
├── components/                 # Componentes de UI específicos del módulo
├── hooks/                      # Custom hooks para lógica de negocio y estado
├── pages/                      # Vistas y pantallas principales
├── services/                   # Llamadas a endpoints de la API REST
├── styles/                     # Estilos complementarios
├── types/                      # Interfaces y tipos TypeScript del módulo
└── utils/                      # Funciones auxiliares y transformadores de datos
```

---

## 3. Sistema de Enrutamiento y Control de Acceso (`App.tsx`)

El componente raíz `App.tsx` evalúa el estado del usuario autenticado devuelto por `useAuth()` y renderiza el shell correspondiente:

1. **Sin Sesión Activa:** Renderiza `LoginPage`.
2. **Rol Cliente (`cliente`):** El panel web está reservado para el personal de la clínica. Si un cliente intenta iniciar sesión, se destruye la sesión y se le informa que su canal de atención es Telegram / Chatbot.
3. **Rol Veterinario (`veterinario`):** Renderiza `VetPuntoInicio` con acceso a agenda médica, expedientes clínicos de pacientes, consultas y perfil profesional. Las acciones de modificación están sujetas a sus permisos vigentes.
4. **Rol Recepcionista (`recepcionista`):** Renderiza `RecepPuntoInicio` para la gestión rápida de citas del día, registro de tutores/dueños y vinculación de mascotas.
5. **Rol Auxiliar (`auxiliar`):** Renderiza `AuxApp` con pestañas operativas de triaje, toma de signos vitales (temperatura, peso, pulso), preparación pre-consulta y cola de pacientes.
6. **SuperAdmin, Admin y Roles Configurables (`custom`):** Renderiza `SuperAdminApp`. Este shell consulta en tiempo real `GET /api/auth/permissions` mediante `useAdminShellAccess` y genera el menú lateral y las rutas permitidas dinámicamente a través de `buildViewMap`, adaptándose a cualquier rol nuevo creado en el sistema (ej. *Practicante*, *Auditor*, etc.).

---

## 4. Módulos del Sistema

### 4.1 Módulo de Autenticación (`src/modules/auth`)
- **Vistas:** `LoginPage` con formulario de acceso, validación en tiempo real, selector de cuentas de prueba para desarrollo y manejo de estados de carga y error.
- **Servicios:**
  - `authService.ts`: Comunicación con `POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/refresh`.
  - `myPermissionsService.ts`: Consulta a `GET /api/auth/permissions` para obtener los permisos vigentes del usuario autenticado.
- **Hooks:** `useAuth` para proveer el usuario actual, métodos `login`, `logout` y escucha de eventos de expiración/refresco de token.
- **Seguridad:** Identificación de SuperAdmin canónico (`99999999-9999-9999-9999-999999999999`), resolución de identidades de rol y sanitización de almacenamiento.

### 4.2 Módulo SuperAdministrador / Administrador (`src/modules/superadmin`)
- **Vistas y Páginas:**
  - `DashboardSuperAdmin`: Resumen ejecutivo de KPIs, distribución de citas por estado y métricas operativas.
  - `UserSuperAdmin`: Gestión completa de usuarios (creación, edición, activación/bloqueo) y matriz de asignación de permisos por módulo y acción (Crear, Editar, Eliminar, Ver) a nivel de rol o excepción de usuario.
  - `MascotasSuperAdmin`: Administración centralizada de expedientes de mascotas y vinculación con tutores.
  - `ProfesionalesSuperAdmin`: Gestión de veterinarios, especialidades, disponibilidad y ausencias.
  - `ServiciosSuperAdmin`: Catálogo de servicios médicos, tarifas y categorías.
  - `EspeciesRazasSuperAdmin`: Gestión de taxonomía de especies y razas.
  - `AgendaSuperAdmin`: Calendario maestro global de citas de la clínica.
  - `ReportesSuperAdmin`: Visualización de estadísticas operativas y financieras.
  - `PerfilSuperAdmin`: Gestión de datos del perfil y cambio de contraseña.
- **Hooks Clave:** `useAdminShellAccess`, `useUserSuperAdmin`, `useMascotasSuperAdmin`, `useNotificationsSuperAdmin`.

### 4.3 Módulo Veterinario (`src/modules/veterinario`)
- **Vistas y Componentes:**
  - `PuntoInicio`: Shell con navegación entre Inicio, Agenda, Mascotas y Perfil.
  - `VetAgendaView`: Cuadrícula semanal y diaria de consultas asignadas.
  - `HistoriaClinicaModal`: Formulario médico para registrar anamnesis, diagnóstico, examen físico, tratamientos, prescripción de recetas y exámenes de laboratorio.
  - `VetMascotasView`: Consulta de pacientes e historial clínico detallado.
- **Seguridad en UI:** Las opciones de creación, edición y eliminación de citas y pacientes se habilitan o deshabilitan dinámicamente según los permisos del profesional.

### 4.4 Módulo Recepcionista (`src/modules/recepcionista`)
- **Vistas y Componentes:**
  - `PuntoInicio`: Punto de entrada con control de pestañas: Inicio, Agenda del Día, Dueños, Mascotas y Perfil.
  - `RecepAgendaDelDia`: Monitoreo y cambio rápido de estados de cita (*Confirmada*, *En Espera*, *Cancelada*, *Finalizada*).
  - `RecepDuenosView` & `RecepDuenosTable`: Búsqueda, registro y edición de propietarios.
  - `RecepMascotasView`: Inspección y registro de pacientes.

### 4.5 Módulo Auxiliar Veterinario (`src/modules/auxiliar`)
- **Vistas y Drawers:**
  - `InicioAux`: Resumen operativo y cola de atención de pacientes.
  - `PreparacionAux`: Registro de triaje clínico pre-consulta (temperatura, peso, frecuencia cardíaca y respiratoria).
  - `PrepararCitaDrawer`: Formulario lateral para captura rápida de signos vitales.
  - `AgendaAux` & `MascotasAux`: Consulta de pacientes agendados y fichas médicas.

---

## 5. Diseño, Estilos y Convenciones UI

### 5.1 Paleta Cromática
La interfaz utiliza una paleta estética moderna y cálida definida en variables CSS y tokens de Tailwind:
- **`bone` (`#F7F5F0` / `#EFECE6`):** Fondo neutro claro y limpio.
- **`brand` (`#2C3E35`):** Verde corporativo profundo para encabezados, barras de navegación y elementos primarios.
- **`terracotta` (`#D96B43`):** Tono terracota para botones de acción principal, badges y llamadas de atención.
- **`sage` (`#7A8B7B`):** Verde salvia para textos secundarios, bordes suaves e indicadores de soporte.
- **`ochre` (`#E09F3E`):** Ocre para estados pendientes, alertas intermedias y recordatorios.
- **`sand` (`#E8DFD1`):** Tono arena para tarjetas, bordes y superficies elevadas.

### 5.2 Microinteracciones & Componentes
- Transiciones suaves (`ViewPopup`, `AnimatedHeight`) para entradas de modales, paneles deslizantes (*Drawers*) y cambio de vistas.
- Notificaciones no invasivas mediante `PageToast`.
- Diseño 100% responsivo adaptable a dispositivos móviles, tablets y pantallas de escritorio (`sm:`, `md:`, `lg:`, `xl:`).

---

## 6. Scripts Disponibles

En la raíz del proyecto `veterinarian-fronted`:

```bash
# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo Vite (http://localhost:5173)
pnpm dev

# Compilar tipos TypeScript y generar el bundle optimizado para producción
pnpm build

# Previsualizar el bundle de producción localmente
pnpm preview

# Validar tipos TypeScript estrictamente sin emitir archivos
pnpm lint

# Ejecutar la suite completa de pruebas unitarias
pnpm test

# Ejecutar pruebas por módulo específico
pnpm test:auth        # Pruebas de autenticación, sesión y roles
pnpm test:superadmin    # Pruebas del shell y utilidades de administración
pnpm test:nav           # Pruebas de resolución de permisos de navegación
```

---

## 7. Configuración de Entorno

Crear un archivo `.env` en la raíz de `veterinarian-fronted` si se requiere sobreescribir la URL de la API:

```env
VITE_API_URL=http://localhost:5233
```
