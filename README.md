# 🐾 Huellitas — Sistema Integral de Gestión Veterinaria (Frontend)

[![React 19](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7.1.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4.1.12-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SignalR](https://img.shields.io/badge/SignalR-10.0.11-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core/signalr/)
[![pnpm](https://img.shields.io/badge/pnpm-11.24.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Aplicación de Página Única (**SPA**) modular, moderna, accesible y de alto rendimiento diseñada para la gestión clínica, operativa y administrativa de clínicas veterinarias. Cuenta con una arquitectura *permission-first*, sincronización en tiempo real vía WebSockets/SignalR y una interfaz orientada al bienestar y la productividad del equipo médico y de atención.

---

## 📑 Tabla de Contenido

- [1. Arquitectura General](#1-arquitectura-general)
- [2. Módulos y Funcionalidades](#2-módulos-y-funcionalidades)
  - [2.1 SuperAdministrador / Administrador](#21-superadministrador--administrador)
  - [2.2 Veterinario (Flujo Clínico)](#22-veterinario-flujo-clínico)
  - [2.3 Recepción y Asesoría](#23-recepción-y-asesoría)
  - [2.4 Hospitalización y Cuidados](#24-hospitalización-y-cuidados)
  - [2.5 Auxiliar Veterinario](#25-auxiliar-veterinario)
  - [2.6 Portal Público / Políticas](#26-portal-público--políticas)
- [3. Experiencia de Usuario, Header y Navegación](#3-experiencia-de-usuario-header-y-navegación)
- [4. Estructura del Repositorio](#4-estructura-del-repositorio)
- [5. Autenticación y Control de Acceso](#5-autenticación-y-control-de-acceso)
- [6. Sistema de Diseño y Tokens](#6-sistema-de-diseño-y-tokens)
- [7. Scripts y Pruebas](#7-scripts-y-pruebas)
- [8. Variables de Entorno y Despliegue](#8-variables-de-entorno-y-despliegue)

---

## 1. Arquitectura General

### 1.1 Stack Tecnológico
- **Core:** [React 19](https://react.dev/) (`^19.1.1`) con [TypeScript](https://www.typescriptlang.org/) (`~5.9.2`) en modo estricto.
- **Bundler & Build Tool:** [Vite 7](https://vite.dev/) (`^7.1.3`) con soporte de HMR instantáneo y empaquetado optimizado.
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite` + `tailwindcss` `^4.1.12`), variables CSS dinámicas y microanimaciones fluidas.
- **Tiempo Real:** `@microsoft/signalr` para notificaciones push en vivo y chat bidireccional con escalamiento de clientes.
- **Pruebas:** Test Runner nativo de Node.js (`node --test --experimental-strip-types`) sin sobrecarga de frameworks externos pesados.

### 1.2 Principios de Diseño de Software
1. **Modularidad por Dominio:** Cada área de negocio (Veterinario, Recepción, Hospitalización, etc.) se encuentra autocontenida en `src/modules/` con sus propios hooks, tipos, componentes, servicios y vistas.
2. **Permission-First Security:** La interfaz y los elementos de acción (botones crear, editar, eliminar y ver) se resuelven dinámicamente según la matriz de permisos otorgada por el backend (`GET /api/auth/permissions`).
3. **Resiliencia HTTP:** Cliente centralizado (`apiClient.ts`) con intercepción y rotación automática de Refresh Token, normalización de errores (`ApiError`) y prevención de Mojibake.

---

## 2. Módulos y Funcionalidades

### 2.1 SuperAdministrador / Administrador (`src/modules/superadmin`)
- **Dashboard Ejecutivo:** Tarjetas de KPIs del día (citas programadas, atendidas, canceladas, personal activo) y próximas citas en espera.
- **Gestión de Usuarios y Permisos (`UserSuperAdmin`):**
  - Alta, edición, activación/suspensión de cuentas de usuario.
  - Matriz de permisos granular por módulo (Crear, Editar, Eliminar, Ver) a nivel de rol o excepciones por usuario.
- **Catálogos Maestros:**
  - **Mascotas (`MascotasSuperAdmin`):** Directorio central con vinculación a tutores, búsqueda, filtrado por especie y ficha técnica.
  - **Especies y Razas (`EspeciesRazasSuperAdmin`):** Gestión taxonómica de especies (canina, felina, exótica) y sus razas correspondientes.
  - **Servicios (`ServiciosSuperAdmin`):** Catálogo de procedimientos médicos, costos, duraciones y categorías.
  - **Profesionales (`ProfesionalesSuperAdmin`):** Directorio médico, especialidades, asignación de cuentas y configuración de horarios de atención.
  - **Diagnósticos (`DiagnosticosSuperAdmin`):** Catálogo clínico estándar utilizado en la historia clínica.
  - **Medicamentos e Insumos (`MedicamentosSuperAdmin`, `InsumosSuperAdmin`):** Inventario clínico, unidades de medida, stock y precios.
- **Agenda Maestra (`AgendaSuperAdmin`):** Visualización global en cuadrícula semanal o diaria de todas las citas, con control de registro de pagos y validación de llegada.
- **Órdenes Médicas Pendientes (`OrdenesMedicasPendientesPanel`):** Seguimiento y despacho de prescripciones de medicamentos y procedimientos clínicos.
- **Reportes Financieros y Operativos (`ReportesSuperAdmin`):** Estadísticas de facturación, servicios más solicitados y rendimiento clínico.
- **Perfil Administrativo (`PerfilSuperAdmin`):** Actualización de datos, cambio de contraseña y carga de foto de perfil con drawer interactivo.

---

### 2.2 Veterinario (Flujo Clínico) (`src/modules/veterinario`)
- **Punto de Inicio Clínico (`PuntoInicio`):** Shell médico optimizado con accesos directos y estado de la consulta activa.
- **Agenda Médica:** Vista de citas asignadas al profesional con filtros de estado (*Agendada*, *En Consulta*, *Atendida*, *Cancelada*, *No Asistió*).
- **Historia Clínica Electrónica (`HistoriaClinicaModal`):**
  - Registro de anamnesis, motivo de consulta, examen físico general y hallazgos.
  - Diagnóstico presuntivo/definitivo vinculado al catálogo maestro.
  - Registro cronológico y visualización de consultas anteriores.
- **Expedición de Órdenes Médicas Independientes:**
  - **Órdenes de Medicamentos:** Dosificación, posología, vía de administración, duración y observaciones.
  - **Órdenes de Procedimientos:** Instrucciones médicas, tipo de examen o intervención y preparación requerida.
  - Modal de impresión y generación de volante médico (`OrdenMedicaPrintModal`).
- **Resultados Clínicos (`ResultadosClinicosPage`):** Consulta centralizada de exámenes de laboratorio y estudios complementarios.
- **Pacientes y Fichas:** Explorador de mascotas atendidas con historial de atenciones y datos del tutor.

---

### 2.3 Recepción y Asesoría (`src/modules/recepcionista`)
- **Agenda del Día (`RecepAgendaDelDia`):** Control del flujo diario de pacientes en sala de espera, registro de pagos previos y confirmación de llegada.
- **Agendamiento Rápido (`RecepAgendamientoRapidoModal`):**
  - Creación ágil de citas validando en tiempo real la disponibilidad y turnos hábiles del profesional seleccionado.
- **Gestión de Dueños/Tutores (`RecepDuenosView` & `RecepDuenosTable`):**
  - Tabla interactiva de tutores con búsqueda instantánea y filtros.
  - **Paginación Dinámica Avanzada:** Cálculo inteligente de límites, numeración con elipsis adaptativa, sombreado de página activa y microanimaciones pop-up.
- **Ficha de Mascotas:** Registro rápido de pacientes y vinculación con tutores nuevos o existentes.
- **Bandeja de Asesor / Escalamientos (`EscalacionesPage`):**
  - Recepción de conversaciones escaladas por el bot de Telegram a atención humana.
  - Sincronización en tiempo real vía SignalR con alertas visuales de mensajes entrantes.
  - Modal de chat interactivo y resolución/cierre de casos (`RecepResolverEscalacionModal`).

---

### 2.4 Hospitalización y Cuidados (`src/modules/hospitalizacion`)
- **Gestión de Admisiones (`HospitalizacionListaView` & `AdmitirMascotaModal`):**
  - Ingreso de mascotas a internación, asignación de box/jaula, motivo y veterinario responsable.
- **Detalle y Monitor Clínico (`HospitalizacionDetalleView`):**
  - Panel de notas de evolución médica (`HospitalizacionNotasPanel`) con registro de signos vitales periódicos y observaciones de guardia.
  - Historial de tratamientos y administración de insumos/fármacos (`HospitalizacionHistorialPanel`).
- **Liquidación y Facturación (`HospitalizacionPendientesPagoView` & `HospitalizationInvoiceModal`):**
  - Consolidado de costos por días de estancia, servicios aplicados e insumos utilizados para la emisión del alta médica y factura.

---

### 2.5 Auxiliar Veterinario (`src/modules/auxiliar`)
- **Triaje Pre-Consulta:** Captura de constantes fisiológicas (peso, temperatura corporal, frecuencia cardíaca, frecuencia respiratoria).
- **Cola de Pacientes en Espera:** Monitoreo y preparación del paciente antes del ingreso al consultorio médico.

---

### 2.6 Portal Público / Políticas (`src/modules/public`)
- **Política de Tratamiento de Datos Personales (`PoliticaTratamientoDatosPage`):**
  - Vista pública accesible desde el Login o ruta directa `/politica-tratamiento-datos`.
  - Encabezado institucional fijo (`sticky`), tabla de contenido interactiva con detección de sección visible mediante `IntersectionObserver`.
  - Secciones desplegables en acordeón, buscador integrado de términos clave y botones para impresión o guardado directo en PDF.

---

## 3. Experiencia de Usuario, Header y Navegación

### 3.1 Header Unificado (`SuperAdminHeader`)
El encabezado superior común provee control total y acceso rápido:
- **Botón Hamburguesa / X Animado:** Transición simétrica SVG para colapsar o expandir la barra lateral.
- **Identidad de Marca:** Logotipo institucional `Huellitas` con efectos sutiles de hover.
- **Campana de Notificaciones:** Indicador numérico de mensajes no leídos, actualización vía SignalR y panel desplegable con opción de marcar como leídas.
- **Menú de Usuario Desplegable:**
  - Al presionar el avatar, nombre y rol en la esquina superior derecha, se abre un menú flotante con efecto *pop-up*.
  - Opciones integradas: **"Mi Perfil"** y **"Cerrar Sesión"** (en tono terracota).
  - Cierre automático al seleccionar una acción o hacer clic en cualquier área exterior.

### 3.2 Barras Laterales Minimalistas (`Sidebar`)
- Se eliminaron los botones redundantes de perfil y cierre de sesión de la parte inferior de la sidebar en todos los roles, dejando un menú lateral limpio y enfocado exclusivamente en las rutas operativas permitidas.
- Variantes adaptables: `illustrated` con textura temática botánica o `plain` para interfaces compactas.

### 3.3 Microinteracciones & Ambient Lighting
- Envoltura `ViewPopup` que añade transiciones suaves de entrada (`fade-in` + `scale-up`) en tablas, modales y cambios de vista.
- Texturas de fondo sutiles (`HeaderBackgroundTexture`, `SidebarBackgroundTexture`, `DashboardBackgroundDecoration`) que aportan calidez estética sin interferir con la legibilidad.

---

## 4. Estructura del Repositorio

```
src/
├── App.tsx                     # Enrutador dinámico por roles y permisos
├── main.tsx                    # Punto de entrada de React 19
├── index.css                   # Directivas Tailwind CSS v4, fuentes y variables globales
├── assets/                     # Recursos visuales globales (logos, texturas)
├── config/                     # Variables de entorno y configuración (env.ts)
├── services/
│   └── apiClient.ts            # Cliente fetch centralizado con interceptores JWT
├── global/                     # Recursos transversales compartidos
│   ├── components/             # Sidebar, Header, Modales, Toast, BrandLogo, Iconos SVG
│   ├── navigation/             # Catálogos de rutas y resolución de permisos por rol
│   ├── notifications/          # Conexión SignalR y notificaciones en tiempo real
│   └── utils/                  # Utilidades comunes (fechas, monedas, strings)
└── modules/                    # Módulos desacoplados por dominio
    ├── auth/                   # Login, sesión, JWT y permisos
    ├── superadmin/             # Panel administrativo y catálogos maestros
    ├── veterinario/            # Flujo clínico, agenda médica y recetas
    ├── recepcionista/          # Flujo de recepción, agenda diaria y tutores
    ├── hospitalizacion/        # Internación, notas médicas y liquidación
    ├── auxiliar/               # Triaje pre-consulta y signos vitales
    └── public/                 # Páginas informativas públicas (Política de Datos)
```

---

## 5. Autenticación y Control de Acceso

1. **Flujo JWT:** Al iniciar sesión (`POST /api/auth/login`), se almacena el `accessToken` y `refreshToken`. El cliente HTTP renueva automáticamente el token expirado ante respuestas `401 Unauthorized`.
2. **Sincronización Multiventana:** Al abrir múltiples pestañas, el listener del evento `storage` detecta cambios de sesión y actualiza el estado de autenticación en todas las ventanas activas.
3. **Control por Módulos:** La función `useAdminShellAccess` evalúa permisos para:
   - `usuarios`, `mascotas`, `duenos`, `especiesRazas`, `servicios`, `profesionales`, `diagnosticos`, `agenda`, `reportes`, `medicamentos`, `procedimientos`, `insumos`, `hospitalizacion`, `ordenesMedicas`.

---

## 6. Sistema de Diseño y Tokens

La paleta cromática de **Huellitas** combina tonos naturales, cálidos y profesionales:

| Token | Hex / Valor | Uso Principal |
|---|---|---|
| **`brand`** | `#2C3E35` | Verde bosque profundo para headers, textos principales y acentos de navegación. |
| **`bone`** | `#FAF7F2` | Fondo neutro cálido para el contenedor principal de la aplicación. |
| **`sand`** | `#E8DFD1` | Superficies secundarias, tarjetas y contenedores de datos. |
| **`terracotta`** | `#D96B43` | Botones de acción primaria, badges de alerta y acción de cerrar sesión. |
| **`sage`** | `#7A8B7B` | Verde salvia para textos secundarios, estados sutiles y bordes. |
| **`ochre`** | `#E09F3E` | Indicadores de advertencia y estados pendientes. |
| **`mint-soft`** | `#EAF2ED` | Fondos de elementos activos e ítems seleccionados. |

---

## 7. Scripts y Pruebas

Los comandos principales para desarrollo, validación y testing son:

```bash
# Instalar dependencias del proyecto
pnpm install

# Iniciar el entorno de desarrollo local (Vite en http://localhost:5174)
pnpm dev

# Validar tipos TypeScript estrictamente
pnpm lint

# Compilar el proyecto para producción
pnpm build

# Previsualizar el bundle de producción generado
pnpm preview

# Ejecutar la suite completa de pruebas unitarias
pnpm test

# Ejecutar pruebas por módulo específico
pnpm test:auth          # Pruebas de autenticación, JWT y sesión
pnpm test:superadmin    # Pruebas de permisos y utilidades SuperAdmin
pnpm test:recep         # Pruebas de recepción, dueños y paginación
pnpm test:vet           # Pruebas de flujo veterinario y expedición de órdenes
pnpm test:nav           # Pruebas de resolución de permisos y catálogos de navegación
pnpm test:notifications # Pruebas de hubs SignalR y notificaciones en tiempo real
```

---

## 8. Variables de Entorno y Despliegue

### 8.1 Configuración Local (`.env`)
Copia `.env.example` o define en `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5233
```

> **Nota:** La URL del backend se resuelve dinámicamente mediante `src/config/env.ts` con validación en tiempo de ejecución.

### 8.2 Despliegue con Docker
Para entornos de producción contenerizados, el build de Vite consume la variable `VITE_API_URL` como argumento de construcción (`build-arg`):

```dockerfile
docker build --build-arg VITE_API_URL=https://api.tuclinica.com -t huellitas-frontend .
```

---

<div align="center">
  <small>Desarrollado para el equipo de <b>Huellitas Veterinaria</b> • Sistema de Gestión y Atención Médica</small>
</div>