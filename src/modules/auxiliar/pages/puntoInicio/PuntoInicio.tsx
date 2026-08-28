import { useState } from 'react'
import { AdminHeader } from '@/modules/administrador'
import { AuxSidebar, ViewPopup } from '../../components'
import { InicioAuxPage } from '../inicioAux'

interface PuntoInicioProps {
  userName?: string
  userRole?: string
  onLogout?: () => void
}

// Shell del Auxiliar: AdminHeader + AuxSidebar + Inicio / Módulos
export function PuntoInicio({
  userName = 'Laura Gómez',
  userRole = 'Auxiliar',
  onLogout,
}: PuntoInicioProps = {}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('inicio')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      onLogout?.()
      return
    }
    setActiveRoute(routeId)
    closeSidebar()
  }

  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
    }, 3500)
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden overflow-x-hidden flex flex-col bg-bone">
      {/* Header Superior con Hamburger Toggle y Perfil */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        unreadNotificationsCount={3}
        userName={userName}
        userRole={userRole}
      />

      {/* Cuerpo principal: Sidebar lateral colapsable + Contenido */}
      <div className="flex flex-1 h-[calc(100vh-57px)] overflow-hidden overflow-x-hidden relative min-w-0">
        <AuxSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />

        <main className="flex-1 h-full min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-7 flex flex-col gap-4 sm:gap-5 max-w-[1400px] w-full mx-auto">
          {activeRoute === 'inicio' && (
            <ViewPopup animationKey="inicio" className="w-full">
              <InicioAuxPage
                userName={userName.split(' ')[0] || 'Laura'}
                onNotice={showToast}
              />
            </ViewPopup>
          )}

          {activeRoute !== 'inicio' && (
            <ViewPopup animationKey={activeRoute} className="w-full">
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 bg-white rounded-3xl border border-border-tan shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-terracotta-soft text-terracotta flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-brand capitalize">
                  Módulo de {activeRoute}
                </h2>
                <p className="text-sm text-sage mt-1 max-w-sm">
                  Esta sección está en desarrollo. Puedes regresar al punto de inicio para gestionar las citas y preparación de pacientes.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveRoute('inicio')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            </ViewPopup>
          )}
        </main>
      </div>

      {/* Toast Notificación flotante */}
      {activeNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
          <div className="view-popup bg-brand text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ochre animate-pulse shrink-0" />
            <span className="truncate">{activeNotification}</span>
          </div>
        </div>
      )}
    </div>
  )
}
