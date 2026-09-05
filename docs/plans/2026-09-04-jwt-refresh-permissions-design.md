# Renovación de JWT y permisos

## Objetivo

Mantener la sesión del frontend cuando expire el access token de 15 minutos y adoptar los permisos incluidos en cada JWT nuevo sin obligar al usuario a iniciar sesión otra vez.

## Diseño

- `authService` conserva la propiedad del almacenamiento y la rotación de tokens.
- Ante un `401`, `apiClient` solicita una sola renovación compartida entre peticiones concurrentes y reintenta la petición original una vez.
- El refresh token rotado sustituye inmediatamente al anterior en el mismo almacenamiento (`localStorage` o `sessionStorage`).
- El usuario almacenado actualiza `role_id`, rol, correo y tokens a partir del JWT nuevo; la UI recibe un evento de sesión renovada.
- Si no existe refresh token, la renovación falla o el reintento sigue devolviendo `401`, se limpia la sesión y se emite un único evento de expiración.
- Los endpoints de autenticación nunca intentan renovarse recursivamente.

## Seguridad y límites

- No se persiste una copia adicional de la matriz de permisos: `/api/auth/permissions` continúa siendo la representación autorizada del JWT vigente.
- Cada solicitud se reintenta como máximo una vez.
- El access token no se registra en consola ni se expone en errores.
- Cambios de permisos guardados en Oracle se reflejan al emitir el siguiente access token mediante login o refresh.
