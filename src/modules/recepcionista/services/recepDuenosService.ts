import type { RecepDuenosDirectoryPayload } from '../types'

// Datos de ejemplo del directorio de dueños
const MOCK_DUENOS: RecepDuenosDirectoryPayload = {
  totalCount: 45,
  pageStart: 1,
  pageEnd: 3,
  items: [
    {
      id: 'own-maria',
      code: '001',
      fullName: 'María Rodríguez',
      documentId: '12345678-9',
      phone: '+56 9 8765 4321',
      email: 'maria.r@email.com',
      petsCount: 2,
      estado: 'Activo',
    },
    {
      id: 'own-carlos',
      code: '002',
      fullName: 'Carlos Mendoza',
      documentId: '98765432-1',
      phone: '+56 9 1234 5678',
      email: 'c.mendoza@mail.cl',
      petsCount: 1,
      estado: 'Activo',
    },
    {
      id: 'own-ana',
      code: '003',
      fullName: 'Ana Sofía Pérez',
      documentId: '11223344-5',
      phone: '+56 9 5555 1212',
      email: 'ana.sofia@outlook.com',
      petsCount: 0,
      estado: 'Inactivo',
    },
  ],
  detailsById: {
    'own-maria': {
      id: 'own-maria',
      code: '001',
      fullName: 'María Rodríguez',
      documentId: '12345678-9',
      phone: '+56 9 8765 4321',
      email: 'maria.r@email.com',
      petsCount: 2,
      estado: 'Activo',
      address: 'Av. Providencia 1234',
      city: 'Santiago',
      registrationDateLabel: '12 Mar 2023',
      pets: [
        {
          id: 'pet-luna',
          name: 'Luna',
          species: 'Canino',
          breed: 'Golden Retriever',
        },
        {
          id: 'pet-michi',
          name: 'Michi',
          species: 'Felino',
          breed: 'Siamés',
        },
      ],
    },
    'own-carlos': {
      id: 'own-carlos',
      code: '002',
      fullName: 'Carlos Mendoza',
      documentId: '98765432-1',
      phone: '+56 9 1234 5678',
      email: 'c.mendoza@mail.cl',
      petsCount: 1,
      estado: 'Activo',
      address: 'Calle Los Leones 88',
      city: 'Providencia',
      registrationDateLabel: '04 Jun 2022',
      pets: [
        {
          id: 'pet-max',
          name: 'Max',
          species: 'Canino',
          breed: 'Labrador',
        },
      ],
    },
    'own-ana': {
      id: 'own-ana',
      code: '003',
      fullName: 'Ana Sofía Pérez',
      documentId: '11223344-5',
      phone: '+56 9 5555 1212',
      email: 'ana.sofia@outlook.com',
      petsCount: 0,
      estado: 'Inactivo',
      address: 'Pasaje El Roble 45',
      city: 'Ñuñoa',
      registrationDateLabel: '20 Ene 2021',
      pets: [],
    },
  },
}

// Obtiene el directorio de dueños; sustituir por fetch al API .NET
export async function fetchRecepDuenosDirectory(): Promise<RecepDuenosDirectoryPayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recep/duenos`)
  // if (!res.ok) throw new Error('No se pudo cargar dueños')
  // return res.json()
  return Promise.resolve(MOCK_DUENOS)
}
