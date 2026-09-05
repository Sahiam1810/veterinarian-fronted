# Plan de implementación: renovación JWT y permisos

1. Añadir pruebas focalizadas para rotación, deduplicación y fallo de refresh.
2. Exponer una operación de renovación de sesión en `authService` que preserve el tipo de almacenamiento y actualice la identidad desde el JWT.
3. Hacer que `apiClient` renueve y reintente una sola vez ante `401`.
4. Reutilizar el mismo cliente en el adaptador HTTP veterinario.
5. Actualizar `useAuth` cuando la sesión sea renovada.
6. Ejecutar únicamente pruebas focalizadas y compilación TypeScript/Vite.
