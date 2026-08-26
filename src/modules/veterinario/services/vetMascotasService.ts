import type { MascotasDirectoryPayload } from '../types'

// Datos de ejemplo del directorio (mientras no exista el endpoint)
const MOCK_MASCOTAS: MascotasDirectoryPayload = {
  totalCount: 45,
  pageStart: 1,
  pageEnd: 3,
  speciesOptions: ['Canino', 'Felino', 'Ave', 'Otro'],
  items: [
    {
      id: 'pet-max',
      name: 'Max',
      photoUrl: null,
      species: 'Canino',
      breed: 'Golden Retriever',
      ageLabel: '3 años',
      sexLabel: 'Macho (C)',
      ownerName: 'Carlos Mendoza',
      lastVisitLabel: '12 Oct 2023',
    },
    {
      id: 'pet-luna',
      name: 'Luna',
      photoUrl: null,
      species: 'Felino',
      breed: 'Mestizo',
      ageLabel: '1.5 años',
      sexLabel: 'Hembra (E)',
      ownerName: 'Ana Ríos',
      lastVisitLabel: '24 Oct 2023',
    },
    {
      id: 'pet-rocky',
      name: 'Rocky',
      photoUrl: null,
      species: 'Canino',
      breed: 'Bulldog Francés',
      ageLabel: '5 años',
      sexLabel: 'Macho (C)',
      ownerName: 'Sofía Vargas',
      lastVisitLabel: '05 Sep 2023',
    },
  ],
  detailsById: {
    'pet-max': {
      id: 'pet-max',
      name: 'Max',
      photoUrl: null,
      species: 'Canino',
      breed: 'Golden Retriever',
      ageLabel: '3 años',
      sexLabel: 'Macho (C)',
      ownerName: 'Carlos Mendoza',
      lastVisitLabel: '12 Oct 2023',
      patientCode: 'PAC-2023-012',
      status: 'Agendado',
      weightLabel: '28.5 kg',
      microchip: '9810200000123',
      ownerPhone: '+57 300 111 2233',
      allergyAlert: null,
    },
    'pet-luna': {
      id: 'pet-luna',
      name: 'Luna',
      photoUrl: null,
      species: 'Felino',
      breed: 'Mestizo',
      ageLabel: '1.5 años',
      sexLabel: 'Hembra (E)',
      ownerName: 'Ana Ríos',
      lastVisitLabel: '24 Oct 2023',
      patientCode: 'PAC-2023-089',
      status: 'Atendido',
      weightLabel: '4.2 kg',
      microchip: '9810200000000',
      ownerPhone: '+57 310 555 0199',
      allergyAlert: 'Alergia a la penicilina reportada en última visita.',
    },
    'pet-rocky': {
      id: 'pet-rocky',
      name: 'Rocky',
      photoUrl: null,
      species: 'Canino',
      breed: 'Bulldog Francés',
      ageLabel: '5 años',
      sexLabel: 'Macho (C)',
      ownerName: 'Sofía Vargas',
      lastVisitLabel: '05 Sep 2023',
      patientCode: 'PAC-2023-044',
      status: 'En espera',
      weightLabel: '12.1 kg',
      microchip: '9810200000444',
      ownerPhone: '+57 320 888 4411',
      allergyAlert: null,
    },
  },
}

// Obtiene el directorio de mascotas; sustituir por fetch al API .NET
export async function fetchVetMascotasDirectory(): Promise<MascotasDirectoryPayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vet/mascotas`)
  // if (!res.ok) throw new Error('No se pudo cargar mascotas')
  // return res.json()
  return Promise.resolve(MOCK_MASCOTAS)
}
