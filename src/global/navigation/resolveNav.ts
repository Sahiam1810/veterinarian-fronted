import type { GrantedPermissions, NavCatalogItem, NavPermissionKey } from './types'

// Si el super admin no envió lista, se usan los defaults del rol
export function resolveEffectivePermissions(
  granted: GrantedPermissions,
  roleDefaults: NavPermissionKey[],
): NavPermissionKey[] {
  if (granted == null) return roleDefaults
  return granted
}

// Filtra el catálogo según permisos efectivos (omite lo no autorizado)
export function filterNavCatalog(
  catalog: NavCatalogItem[],
  effectivePermissions: NavPermissionKey[],
): NavCatalogItem[] {
  const allowed = new Set(effectivePermissions)
  return catalog
    .filter((item) => allowed.has(item.permissionKey))
    .slice()
    .sort((a, b) => a.order - b.order)
}

// Atajo: catálogo filtrado con fallback a defaults del rol
export function resolveNavCatalog(
  catalog: NavCatalogItem[],
  roleDefaults: NavPermissionKey[],
  granted?: GrantedPermissions,
): NavCatalogItem[] {
  const effective = resolveEffectivePermissions(granted, roleDefaults)
  return filterNavCatalog(catalog, effective)
}

export function splitNavCatalog(items: NavCatalogItem[]) {
  return {
    actions: items.filter((item) => item.kind === 'action'),
    links: items.filter((item) => item.kind === 'link'),
  }
}
