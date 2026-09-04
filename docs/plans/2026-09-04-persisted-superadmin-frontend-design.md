# Diseño: SuperAdmin persistido en el frontend

## Problema

El backend dejó de emitir el claim heredado `super_admin=true`. El SuperAdmin ahora es una identidad normal persistida en Oracle y se reconoce exclusivamente por el claim `role_id` canónico `99999999-9999-9999-9999-999999999999`. El frontend todavía calcula `isPlatformSuperAdmin` desde el claim eliminado, por lo que restringe módulos y permisos aunque `/api/auth/me` devuelva el rol `SuperAdmin`.

También permanecen textos y comportamientos del modelo anterior: el perfil afirma que nombre, correo y contraseña vienen del `.env`, y bloquea el cambio de contraseña aunque el backend ya permite el autoservicio autenticado.

## Diseño aprobado

- Centralizar la identidad del rol en una utilidad pura que compare `roleId` con el identificador canónico del backend.
- Mantener `isPlatformSuperAdmin` como nombre interno compatible para evitar un refactor amplio, pero redefinirlo como “cuenta persistida con el rol canónico SuperAdmin”.
- Resolver el indicador al iniciar sesión y al recuperar una sesión guardada, de modo que una sesión reciente con `roleId` correcto se repare sin depender del antiguo claim.
- Mantener el nombre del rol entregado por `/api/auth/me` para presentación y usar `superadmin` como rol de navegación.
- Conservar la protección de nombre y correo del SuperAdmin en el panel, pero explicar que proviene de una regla de seguridad del backend, no del `.env`.
- Permitir que el SuperAdmin cambie su propia contraseña mediante `/api/auth/me/password`.
- Cubrir la identidad canónica, roles ordinarios y valores ausentes mediante una prueba pequeña con el runner nativo de Node.

## Flujo

1. El backend emite el JWT con `role_id` y devuelve el perfil persistido en `/api/auth/me`.
2. El frontend extrae `role_id` y llama `isPersistedSuperAdminRole(roleId)`.
3. Una coincidencia activa la navegación completa y la administración de permisos.
4. `getStoredUser()` normaliza sesiones guardadas usando la misma función.
5. La API continúa siendo la autoridad final; las comprobaciones del frontend solo controlan presentación y navegación.

## Fuera de alcance

- Cambiar el diseño visual del panel.
- Modificar el contrato JWT o las políticas del backend.
- Permitir cambiar el rol, nombre o correo del SuperAdmin desde operaciones administrativas protegidas.
