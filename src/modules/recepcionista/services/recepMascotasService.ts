import type { RecepMascotasDirectoryPayload } from '../types'

// Datos de ejemplo del directorio (mientras no exista el endpoint)
const MOCK_MASCOTAS: RecepMascotasDirectoryPayload = {
  totalCount: 45,
  pageStart: 1,
  pageEnd: 3,
  items: [
    {
      id: 'pet-luna',
      name: 'Luna',
      photoUrl: null,
      species: 'Felino',
      breed: 'Siamés',
      ageLabel: '3 años',
      sexLabel: 'Hembra',
      ownerName: 'Carlos Mendoza',
      lastVisitLabel: '12 Oct 2023',
      estado: 'Activo',
    },
    {
      id: 'pet-max',
      name: 'Max',
      photoUrl: null,
      species: 'Canino',
      breed: 'Golden Retriever',
      ageLabel: '5 años',
      sexLabel: 'Macho',
      ownerName: 'Ana Torres',
      lastVisitLabel: '05 Sep 2023',
      estado: 'Activo',
    },
    {
      id: 'pet-rocky',
      name: 'Rocky',
      photoUrl: null,
      species: 'Canino',
      breed: 'Labrador',
      ageLabel: '8 años',
      sexLabel: 'Macho',
      ownerName: 'Sofía Vargas',
      lastVisitLabel: '20 Ago 2023',
      estado: 'Inactivo',
    },
  ],
  detailsById: {
    'pet-luna': {
      id: 'pet-luna',
      name: 'Luna',
      photoUrl: null,
      species: 'Felino',
      breed: 'Siamés',
      ageLabel: '3 años',
      sexLabel: 'Hembra',
      ownerName: 'Carlos Mendoza',
      lastVisitLabel: '12 Oct 2023',
      estado: 'Activo',
      patientCode: 'PAC-2023-089',
      weightLabel: '4.2 kg',
      microchip: '9810200000089',
      ownerPhone: '+57 300 111 2233',
      allergyAlert: null,
    },
    'pet-max': {
      id: 'pet-max',
      name: 'Max',
      photoUrl: null,
      species: 'Canino',
      breed: 'Golden Retriever',
      ageLabel: '5 años',
      sexLabel: 'Macho',
      ownerName: 'Ana Torres',
      lastVisitLabel: '05 Sep 2023',
      estado: 'Activo',
      patientCode: 'PAC-2023-012',
      weightLabel: '28.5 kg',
      microchip: '9810200000123',
      ownerPhone: '+57 310 555 0199',
      allergyAlert: null,
    },
    'pet-rocky': {
      id: 'pet-rocky',
      name: 'Rocky',
      photoUrl: null,
      species: 'Canino',
      breed: 'Labrador',
      ageLabel: '8 años',
      sexLabel: 'Macho',
      ownerName: 'Sofía Vargas',
      lastVisitLabel: '20 Ago 2023',
      estado: 'Inactivo',
      patientCode: 'PAC-2023-044',
      weightLabel: '32.0 kg',
      microchip: '9810200000444',
      ownerPhone: '+57 320 888 4411',
      allergyAlert: 'Alergia a la penicilina reportada en última visita.',
    },
  },
}

// Obtiene el directorio de mascotas; sustituir por fetch al API .NET
export async function fetchRecepMascotasDirectory(): Promise<RecepMascotasDirectoryPayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recep/mascotas`)
  // if (!res.ok) throw new Error('No se pudo cargar mascotas')
  // return res.json()
  return Promise.resolve(MOCK_MASCOTAS)
}
