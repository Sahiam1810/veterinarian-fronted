import type { HistoriaClinicaPayload } from '../types'

// Historias de ejemplo por mascota (mientras no exista el endpoint)
const MOCK_BY_PET: Record<string, HistoriaClinicaPayload> = {
  'pet-max': {
    petId: 'pet-max',
    displayName: "Maximus 'Max'",
    patientCode: 'PAC-2023-8942',
    sexLabel: '♂ Macho',
    breed: 'Golden Retriever',
    ageLabel: '4 Años, 2 Meses',
    weightLabel: '32.5 kg',
    ownerName: 'Carlos Mendoza',
    ownerPhone: '+56 9 8765 4321',
    photoUrl: null,
    consultas: [
      {
        id: 'c1',
        dateLabel: '12 Oct 2023',
        typeLabel: 'Control General',
        veterinarian: 'Dr. Ruiz',
        motivo:
          'Chequeo anual de rutina. Dueño reporta leve cojera pata trasera derecha después de paseos largos.',
        diagnostico:
          'Salud general excelente. Leve inflamación articular compatible con inicio de osteoartritis leve.',
        tratamientoIndicaciones: [
          'Suplemento condroprotector (Cosequin) 1 comp/día por 30 días.',
          'Reducir intensidad de paseos; preferir caminatas cortas y frecuentes.',
          'Control en 30 días si la cojera persiste.',
        ],
      },
      {
        id: 'c2',
        dateLabel: '05 Mar 2023',
        typeLabel: 'Vacunación',
        motivo: 'Actualización calendario de vacunación anual.',
        tratamientoIndicaciones: [
          'Aplicación vacuna Óctuple y Antirrábica. Sin reacciones adversas inmediatas.',
        ],
      },
    ],
    vacunas: [
      { id: 'v1', name: 'Óctuple', appliedLabel: '05/03/23', nextLabel: '05/03/24' },
      { id: 'v2', name: 'Antirrábica', appliedLabel: '05/03/23', nextLabel: '05/03/24' },
      { id: 'v3', name: 'KC (Bordetella)', appliedLabel: '10/11/22', nextLabel: '10/11/23' },
    ],
    signosVitales: {
      temperatura: '38.5 °C',
      frecuenciaCardiaca: '88 lpm',
      frecuenciaRespiratoria: '24 rpm',
      mucosas: 'Rosadas',
    },
  },
  'pet-luna': {
    petId: 'pet-luna',
    displayName: 'Luna',
    patientCode: 'PAC-2023-089',
    sexLabel: '♀ Hembra',
    breed: 'Mestizo',
    ageLabel: '1.5 Años',
    weightLabel: '4.2 kg',
    ownerName: 'Ana Ríos',
    ownerPhone: '+57 310 555 0199',
    photoUrl: null,
    consultas: [
      {
        id: 'c1',
        dateLabel: '24 Oct 2023',
        typeLabel: 'Control Dental',
        veterinarian: 'Dra. Silva',
        motivo: 'Revisión dental y control post-atención.',
        diagnostico: 'Encías sanas. Sin hallazgos críticos.',
        tratamientoIndicaciones: [
          'Continuar cepillado 3 veces por semana.',
          'Control en 6 meses.',
        ],
      },
      {
        id: 'c2',
        dateLabel: '10 Jun 2023',
        typeLabel: 'Vacunación',
        motivo: 'Esquema de vacunación anual.',
        tratamientoIndicaciones: ['Aplicación triple felina. Sin reacciones.'],
      },
    ],
    vacunas: [
      { id: 'v1', name: 'Triple Felina', appliedLabel: '10/06/23', nextLabel: '10/06/24' },
      { id: 'v2', name: 'Antirrábica', appliedLabel: '10/06/23', nextLabel: '10/06/24' },
      { id: 'v3', name: 'Leucemia Felina', appliedLabel: '12/01/23', nextLabel: '12/01/24' },
    ],
    signosVitales: {
      temperatura: '38.2 °C',
      frecuenciaCardiaca: '140 lpm',
      frecuenciaRespiratoria: '30 rpm',
      mucosas: 'Rosadas',
    },
  },
  'pet-rocky': {
    petId: 'pet-rocky',
    displayName: 'Rocky',
    patientCode: 'PAC-2023-044',
    sexLabel: '♂ Macho',
    breed: 'Bulldog Francés',
    ageLabel: '5 Años',
    weightLabel: '12.1 kg',
    ownerName: 'Sofía Vargas',
    ownerPhone: '+57 320 888 4411',
    photoUrl: null,
    consultas: [
      {
        id: 'c1',
        dateLabel: '05 Sep 2023',
        typeLabel: 'Consulta General',
        veterinarian: 'Dr. Ruiz',
        motivo: 'Dificultad respiratoria leve tras ejercicio.',
        diagnostico: 'Síndrome braquicéfalo leve. Condición estable.',
        tratamientoIndicaciones: [
          'Evitar ejercicio intenso en calor.',
          'Control de peso estricto.',
        ],
      },
      {
        id: 'c2',
        dateLabel: '20 Ene 2023',
        typeLabel: 'Vacunación',
        motivo: 'Actualización de vacunas.',
        tratamientoIndicaciones: ['Óctuple y antirrábica aplicadas.'],
      },
    ],
    vacunas: [
      { id: 'v1', name: 'Óctuple', appliedLabel: '20/01/23', nextLabel: '20/01/24' },
      { id: 'v2', name: 'Antirrábica', appliedLabel: '20/01/23', nextLabel: '20/01/24' },
      { id: 'v3', name: 'KC (Bordetella)', appliedLabel: '15/08/22', nextLabel: '15/08/23' },
    ],
    signosVitales: {
      temperatura: '38.7 °C',
      frecuenciaCardiaca: '100 lpm',
      frecuenciaRespiratoria: '28 rpm',
      mucosas: 'Rosadas',
    },
  },
}

// Obtiene historia clínica por mascota; sustituir por fetch al API .NET
export async function fetchHistoriaClinica(
  petId: string,
): Promise<HistoriaClinicaPayload | null> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vet/mascotas/${petId}/historia`)
  // if (!res.ok) throw new Error('No se pudo cargar la historia')
  // return res.json()
  return Promise.resolve(MOCK_BY_PET[petId] ?? null)
}
