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
  RECEP_NAV_CATALOG,
  RECEP_DEFAULT_PERMISSIONS,
} from './roles/recepcionista'

export {
  AUX_NAV_CATALOG,
  AUX_DEFAULT_PERMISSIONS,
} from './roles/auxiliar'

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
