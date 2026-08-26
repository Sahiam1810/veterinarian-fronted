// Navegación global por rol: catálogo, defaults y filtrado por permisos
export type {
  NavPermissionKey,
  NavIconKey,
  NavCatalogItem,
  GrantedPermissions,
} from './types'

export {
  VET_NAV_CATALOG,
  VET_DEFAULT_PERMISSIONS,
} from './roles/veterinario'

export {
  resolveEffectivePermissions,
  filterNavCatalog,
  resolveNavCatalog,
  splitNavCatalog,
} from './resolveNav'

export {
  renderNavIcon,
  toSidebarNavItems,
  toSidebarPrimaryAction,
  splitNavByPlacement,
} from './buildSidebarNav'
