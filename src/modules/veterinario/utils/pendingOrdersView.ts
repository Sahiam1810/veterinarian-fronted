// Genérico sobre TMed/TProc a propósito: así este archivo no necesita importar
// PendingMedicationOrder/PendingProcedureOrder de ordenesMedicasService.ts (ese archivo
// trae vetApiFetch -> @/modules/auth, cuyo barrel arrastra páginas .tsx, y este archivo
// también lo usan los tests bajo tsconfig.node.json, que no tiene jsx configurado).
// El componente instancia los genéricos con los tipos reales del servicio.
interface MinimalPendingOrder {
  id: string
  petName: string
  ownerName: string
  appointmentId: string
  isInHouse: boolean
  status: string
  createdAt: string
}

export interface UnifiedPendingOrder<
  TMed extends MinimalPendingOrder = MinimalPendingOrder,
  TProc extends MinimalPendingOrder = MinimalPendingOrder,
> {
  id: string
  type: 'MEDICAMENTO' | 'PROCEDIMIENTO'
  petName: string
  ownerName: string
  appointmentId: string
  isInHouse: boolean
  status: string
  createdAt: string
  rawMedicationOrder?: TMed
  rawProcedureOrder?: TProc
}

export type PendingOrderFilterType = 'TODOS' | 'MEDICAMENTO' | 'PROCEDIMIENTO'

// Junta medicamentos y procedimientos pendientes en una sola lista, más reciente primero.
export function buildUnifiedPendingOrders<
  TMed extends MinimalPendingOrder,
  TProc extends MinimalPendingOrder,
>(medicationOrders: TMed[], procedureOrders: TProc[]): UnifiedPendingOrder<TMed, TProc>[] {
  const unified: UnifiedPendingOrder<TMed, TProc>[] = [
    ...medicationOrders.map(
      (m): UnifiedPendingOrder<TMed, TProc> => ({
        id: m.id,
        type: 'MEDICAMENTO',
        petName: m.petName || 'Mascota no registrada',
        ownerName: m.ownerName || 'Cliente no registrado',
        appointmentId: m.appointmentId,
        isInHouse: m.isInHouse,
        status: m.status,
        createdAt: m.createdAt,
        rawMedicationOrder: m,
      }),
    ),
    ...procedureOrders.map(
      (p): UnifiedPendingOrder<TMed, TProc> => ({
        id: p.id,
        type: 'PROCEDIMIENTO',
        petName: p.petName || 'Mascota no registrada',
        ownerName: p.ownerName || 'Cliente no registrado',
        appointmentId: p.appointmentId,
        isInHouse: p.isInHouse,
        status: p.status,
        createdAt: p.createdAt,
        rawProcedureOrder: p,
      }),
    ),
  ]

  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Filtra por tipo (MEDICAMENTO/PROCEDIMIENTO/TODOS) y por texto libre sobre mascota, dueño o id.
export function filterPendingOrders<TMed extends MinimalPendingOrder, TProc extends MinimalPendingOrder>(
  orders: UnifiedPendingOrder<TMed, TProc>[],
  filterType: PendingOrderFilterType,
  searchQuery: string,
): UnifiedPendingOrder<TMed, TProc>[] {
  return orders.filter((order) => {
    if (filterType !== 'TODOS' && order.type !== filterType) return false
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      order.petName.toLowerCase().includes(query) ||
      order.ownerName.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query)
    )
  })
}
