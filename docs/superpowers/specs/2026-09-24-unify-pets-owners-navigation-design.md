# Unificar navegación de Mascotas y Dueños

## Objetivo

Eliminar la duplicación visual del menú lateral del shell de Administrador/SuperAdmin. La sección tendrá una sola entrada `Mascotas`, mientras que la pantalla conservará las pestañas internas `Mascotas` y `Dueños`.

## Diseño

- El menú lateral mostrará una única entrada con `id: mascotas`.
- La entrada será visible cuando el usuario tenga `Mascotas:View` o `Clientes:View`.
- `MascotasSuperAdmin` seguirá recibiendo permisos independientes para cada módulo.
- La pestaña `Mascotas` se mostrará únicamente con `Mascotas:View`.
- La pestaña `Dueños` se mostrará únicamente con `Clientes:View`.
- Con ambos permisos, la pestaña inicial será `Mascotas`.
- Con únicamente `Clientes:View`, la pestaña inicial será `Dueños`.
- La ruta lógica `duenos` seguirá siendo compatible como alias de la pantalla unificada, pero no tendrá una entrada lateral propia.
- Las acciones de cada pestaña continuarán usando los permisos de su propio módulo.

## Navegación y permisos

El shell necesita tratar la entrada lateral de Mascotas como una sección compuesta. La guarda de navegación y la resolución de la primera ruta permitida deben aceptar cualquiera de los dos permisos para esa entrada. Las acciones de crear, editar y eliminar no se combinan: Mascotas usa sus permisos y Dueños usa los suyos.

## Pruebas

Se cubrirán estos escenarios:

- Ambos permisos: una sola entrada lateral y ambas pestañas visibles.
- Solo `Mascotas:View`: entrada lateral y pestaña Mascotas visibles.
- Solo `Clientes:View`: entrada lateral y pestaña Dueños visibles, iniciando en Dueños.
- Sin ambos permisos: entrada lateral oculta.
- `Create`, `Edit` y `Delete` permanecen aislados por módulo.
- La ruta `duenos` no crea una segunda entrada lateral.

## Alcance

Solo frontend. No se modifican APIs, backend, permisos persistidos ni migraciones.
