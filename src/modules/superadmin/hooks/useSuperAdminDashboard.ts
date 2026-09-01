import { useState } from 'react'
import type { Appointment, DashboardStats } from '../types'

const INITIAL_STATS: DashboardStats = {
  totalAppointments: 24,
  attendedAppointments: 12,
  attendedPercentage: 50,
  cancelledAppointments: 3,
  activeProfessionals: 5,
  formattedDate: 'Jueves, 24 de Octubre',
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:00 AM',
    petName: 'Luna',
    petType: 'Perro',
    service: 'Consulta General',
    professional: 'Dr. Ramírez',
    status: 'Agendado',
  },
  {
    id: 'apt-2',
    time: '09:30 AM',
    petName: 'Simba',
    petType: 'Gato',
    service: 'Vacunación',
    professional: 'Dra. Silva',
    status: 'Agendado',
  },
  {
    id: 'apt-3',
    time: '10:15 AM',
    petName: 'Thor',
    petType: 'Perro',
    service: 'Revisión Cirugía',
    professional: 'Dr. Ramírez',
    status: 'En sala',
  },
  {
    id: 'apt-4',
    time: '11:00 AM',
    petName: 'Milo',
    petType: 'Gato',
    service: 'Peluquería',
    professional: 'Ana (Estilista)',
    status: 'Agendado',
  },
]

const ROUTE_NAMES: Record<string, string> = {
  inicio: 'Inicio',
  usuarios: 'Usuarios',
  mascotas: 'Mascotas',
  servicios: 'Servicios',
  veterinarios: 'Veterinarios',
  agenda: 'Agenda',
  reportes: 'Reportes',
  perfil: 'Perfil de Usuario',
}

export function useSuperAdminDashboard() {
  const [stats] = useState<DashboardStats>(INITIAL_STATS)
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 3000)
  }

  const handleNavigate = (routeId: string) => {
    setActiveRoute(routeId)
    if (routeId === 'logout') {
      showToast('Cerrando sesión...')
    } else {
      showToast(`Navegando a: ${ROUTE_NAMES[routeId] || routeId}`)
    }
  }

  const handleCreateUser = () => {
    showToast('Abrir modal: Crear nuevo usuario clínico')
  }

  const handleRegisterOwner = () => {
    showToast('Abrir formulario: Registrar nuevo dueño')
  }

  const handleRegisterPet = () => {
    showToast('Abrir formulario: Registrar nueva mascota')
  }

  const handleScheduleAppointment = () => {
    showToast('Abrir calendario: Agendar nueva cita')
  }

  const handleViewAllAppointments = () => {
    showToast('Navegando a la lista completa de citas...')
  }

  const handleSelectAppointment = (appointment: Appointment) => {
    showToast(`Cita seleccionada: ${appointment.petName} (${appointment.time})`)
  }

  return {
    stats,
    appointments,
    setAppointments,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeRoute,
    handleNavigate,
    activeNotification,
    handleCreateUser,
    handleRegisterOwner,
    handleRegisterPet,
    handleScheduleAppointment,
    handleViewAllAppointments,
    handleSelectAppointment,
  }
}
