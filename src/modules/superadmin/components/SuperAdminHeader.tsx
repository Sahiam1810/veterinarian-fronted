import { useState } from 'react'
import { BrandLogo } from '@/global/components'
import { BellPlusIcon, UserAvatarIcon, CheckIcon } from './DashboardIcons'
import type { NotificacionSuperAdmin } from '../types'

export interface SuperAdminHeaderProps {
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  notifications?: NotificacionSuperAdmin[]
  isLoadingNotifications?: boolean
  notificationsError?: string | null
  onMarkNotificationRead?: (id: string) => void
  onMarkAllNotificationsRead?: () => void
  onReloadNotifications?: () => void
  userName?: string
  userRole?: string
  onProfileClick?: () => void
}

export function SuperAdminHeader({
  isSidebarOpen = false,
  onToggleSidebar,
  notifications = [],
  isLoadingNotifications = false,
  notificationsError = null,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onReloadNotifications,
  userName = 'SuperAdmin Veterinario',
  userRole = 'SuperAdministrador',
  onProfileClick,
}: SuperAdminHeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <header className="sticky top-0 z-50 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-bone border-b border-border-tan transition-all duration-200">
      {/* Left side: Animated Hamburger / Close X Toggle & Logo */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1.5 text-brand hover:text-brand-hover hover:bg-border-tan/50 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 flex items-center justify-center w-10 h-10"
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
          aria-expanded={isSidebarOpen}
        >
          {/* Symmetrical Animated Hamburger to X transformation */}
          <div className="w-6 h-6 relative flex items-center justify-center pointer-events-none">
            <span
              className={`absolute h-[2px] w-5 bg-brand rounded-full transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-brand rounded-full transition-all duration-200 ease-in-out ${
                isSidebarOpen ? 'opacity-0 scale-x-0' : 'opacity-100 translate-y-0'
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-brand rounded-full transition-all duration-300 ease-in-out ${
                isSidebarOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>

        <div className="flex items-center">
          <BrandLogo
            mark="wordmark"
            variant="transparent"
            alt="Huellitas Veterinaria"
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer transition hover:opacity-95"
          />
        </div>
      </div>

      {/* Right side: Notifications & Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notifications Button + Panel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen((curr) => !curr)
              if (!isNotifOpen) onReloadNotifications?.()
            }}
            className="relative p-2 text-brand hover:text-brand-hover hover:bg-border-tan/50 rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 group"
            aria-label="Notificaciones"
            aria-expanded={isNotifOpen}
            title="Notificaciones"
          >
            <BellPlusIcon className="w-6 h-6 transition-transform group-hover:scale-105" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default border-0 bg-transparent"
                aria-label="Cerrar notificaciones"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[90vw] bg-white rounded-2xl shadow-lg border border-border-tan overflow-hidden modal-content-animate">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-tan">
                  <h3 className="text-sm font-bold text-charcoal">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkAllNotificationsRead?.()}
                      className="flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      Marcar todas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {isLoadingNotifications && (
                    <p className="text-xs text-sage font-medium text-center py-6">Cargando...</p>
                  )}

                  {!isLoadingNotifications && notificationsError && (
                    <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                      <p className="text-xs text-terracotta font-medium">{notificationsError}</p>
                      <button
                        type="button"
                        onClick={() => onReloadNotifications?.()}
                        className="text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {!isLoadingNotifications && !notificationsError && notifications.length === 0 && (
                    <p className="text-xs text-sage font-medium text-center py-6">
                      No tienes notificaciones.
                    </p>
                  )}

                  {!isLoadingNotifications &&
                    !notificationsError &&
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => onMarkNotificationRead?.(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-border-tan/60 last:border-b-0 transition cursor-pointer hover:bg-bone ${
                          n.isRead ? '' : 'bg-mint-soft/40'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-terracotta shrink-0" />
                          )}
                          <div className={`min-w-0 ${n.isRead ? 'pl-4' : ''}`}>
                            <p className="text-xs font-semibold text-charcoal leading-snug">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-sage font-medium mt-1">{n.dateLabel}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <button
          type="button"
          onClick={onProfileClick}
          className="flex items-center gap-2 p-1.5 text-brand hover:text-brand-hover hover:bg-border-tan/50 rounded-full sm:rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 group"
          aria-label={`Perfil de ${userName}`}
          title={`${userName} (${userRole})`}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-border-tan/60 text-brand flex items-center justify-center border border-brand/15 group-hover:border-brand/40 transition">
            <UserAvatarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-charcoal leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-sage font-medium leading-tight">
              {userRole}
            </span>
          </div>
        </button>
      </div>

    </header>
  )
}
