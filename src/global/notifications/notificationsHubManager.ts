import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr'
import { ensureSignalRAccessToken } from './ensureSignalRAccessToken.ts'
import { reconnectNotificationsAfterClose } from './notificationsRealtimeReconnect.ts'
import { mapRealtimeNotificationPayload } from './mapRealtimeNotification.ts'
import type { RealtimeNotificationPayload } from './realtimeNotificationTypes.ts'
import {
  mapRealtimeChatEscalationCreated,
  mapRealtimeChatMessageReceived,
  mapRealtimeChatEscalationResolved,
  type ChatEscalationCreatedPayload,
  type ChatMessageReceivedPayload,
  type ChatEscalationResolvedPayload,
} from './realtimeChatTypes.ts'

const API_BASE_URL =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://api.huellitas.chatcampuslands.com'

export const NOTIFICATIONS_HUB_URL = `${API_BASE_URL}/hubs/notifications`

// Eventos de SignalR
export const SIGNALR_EVENTS = {
  RECEIVE_NOTIFICATION: 'ReceiveNotification',
  CHAT_ESCALATION_CREATED: 'ChatEscalationCreated',
  CHAT_MESSAGE_RECEIVED: 'ChatMessageReceived',
  CHAT_ESCALATION_RESOLVED: 'ChatEscalationResolved',
} as const

export type NotificationCallback = (payload: RealtimeNotificationPayload) => void
export type ChatEscalationCreatedCallback = (payload: ChatEscalationCreatedPayload) => void
export type ChatMessageReceivedCallback = (payload: ChatMessageReceivedPayload) => void
export type ChatEscalationResolvedCallback = (payload: ChatEscalationResolvedPayload) => void

export interface ChatEscalationsListeners {
  onEscalationCreated?: ChatEscalationCreatedCallback
  onMessageReceived?: ChatMessageReceivedCallback
  onEscalationResolved?: ChatEscalationResolvedCallback
}

class NotificationsHubManager {
  private connection: HubConnection | null = null
  private isCancelled = false
  private reconnectInFlight: Promise<void> | null = null
  private sleepTimer: ReturnType<typeof setTimeout> | null = null
  private stopDebounceTimer: ReturnType<typeof setTimeout> | null = null

  // Sets de suscriptores
  private notificationListeners = new Set<NotificationCallback>()
  private escalationCreatedListeners = new Set<ChatEscalationCreatedCallback>()
  private messageReceivedListeners = new Set<ChatMessageReceivedCallback>()
  private escalationResolvedListeners = new Set<ChatEscalationResolvedCallback>()

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('huellitas:session-expired', this.handleSessionExpired)

      // Exponer helper en consola de depuración/pruebas
      const win = window as unknown as {
        __simulateRealtimeChatEvent?: (eventName: string, payload: unknown) => boolean
        __simulateRealtimeNotification?: (payload: unknown) => boolean
      }
      win.__simulateRealtimeChatEvent = this.simulateRealtimeEvent.bind(this)
      win.__simulateRealtimeNotification = this.simulateNotification.bind(this)
    }
  }

  private handleSessionExpired = () => {
    this.isCancelled = true
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer)
      this.sleepTimer = null
    }
    if (this.stopDebounceTimer) {
      clearTimeout(this.stopDebounceTimer)
      this.stopDebounceTimer = null
    }
    void this.stopQuietly(this.connection)
    this.connection = null
  }

  private sleep = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => {
      this.sleepTimer = setTimeout(() => {
        this.sleepTimer = null
        resolve()
      }, ms)
    })
  }

  private async stopQuietly(conn: HubConnection | null) {
    if (!conn) return
    try {
      if (conn.state !== HubConnectionState.Disconnected) {
        await conn.stop()
      }
    } catch {
      // Silencioso
    }
  }

  private async startConnection() {
    if (!this.connection) return
    if (this.connection.state !== HubConnectionState.Disconnected) return
    await this.connection.start()
  }

  private scheduleReconnectAfterClose() {
    if (this.isCancelled || this.reconnectInFlight) return
    this.reconnectInFlight = reconnectNotificationsAfterClose({
      isCancelled: () => this.isCancelled,
      ensureToken: ensureSignalRAccessToken,
      startConnection: () => this.startConnection(),
      sleep: this.sleep,
    }).finally(() => {
      this.reconnectInFlight = null
    })
    void this.reconnectInFlight
  }

  private getTotalSubscribersCount(): number {
    return (
      this.notificationListeners.size +
      this.escalationCreatedListeners.size +
      this.messageReceivedListeners.size +
      this.escalationResolvedListeners.size
    )
  }

  private async ensureConnected() {
    if (this.stopDebounceTimer) {
      clearTimeout(this.stopDebounceTimer)
      this.stopDebounceTimer = null
    }

    this.isCancelled = false

    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return
    }

    const token = await ensureSignalRAccessToken()
    if (!token || this.isCancelled) return

    if (!this.connection) {
      const next = new HubConnectionBuilder()
        .withUrl(NOTIFICATIONS_HUB_URL, {
          accessTokenFactory: async () => (await ensureSignalRAccessToken()) ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build()

      // 1. Notificación general
      next.on(SIGNALR_EVENTS.RECEIVE_NOTIFICATION, (payload: unknown) => {
        this.dispatchNotification(payload)
      })

      // 2. ChatEscalationCreated
      next.on(SIGNALR_EVENTS.CHAT_ESCALATION_CREATED, (payload: unknown) => {
        this.dispatchEscalationCreated(payload)
      })

      // 3. ChatMessageReceived
      next.on(SIGNALR_EVENTS.CHAT_MESSAGE_RECEIVED, (payload: unknown) => {
        this.dispatchMessageReceived(payload)
      })

      // 4. ChatEscalationResolved
      next.on(SIGNALR_EVENTS.CHAT_ESCALATION_RESOLVED, (payload: unknown) => {
        this.dispatchEscalationResolved(payload)
      })

      next.onclose(() => {
        if (this.isCancelled) return
        this.scheduleReconnectAfterClose()
      })

      this.connection = next
    }

    try {
      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start()
        if (this.isCancelled) {
          await this.stopQuietly(this.connection)
        }
      }
    } catch {
      // Degradación segura: polling/REST sigue funcionando; reintento con backoff
      this.scheduleReconnectAfterClose()
    }
  }

  private scheduleStopIfNoSubscribers() {
    if (this.getTotalSubscribersCount() > 0) return
    if (this.stopDebounceTimer) clearTimeout(this.stopDebounceTimer)

    // Debounce de 5 segundos antes de apagar el socket al cambiar de página
    this.stopDebounceTimer = setTimeout(() => {
      this.stopDebounceTimer = null
      if (this.getTotalSubscribersCount() === 0 && this.connection) {
        void this.stopQuietly(this.connection)
      }
    }, 5000)
  }

  // Despachadores de eventos
  private dispatchNotification(payload: unknown) {
    const mapped = mapRealtimeNotificationPayload(payload)
    if (mapped) {
      this.notificationListeners.forEach((cb) => cb(mapped))
    }
  }

  private dispatchEscalationCreated(payload: unknown) {
    const mapped = mapRealtimeChatEscalationCreated(payload)
    if (mapped) {
      this.escalationCreatedListeners.forEach((cb) => cb(mapped))
    }
  }

  private dispatchMessageReceived(payload: unknown) {
    const mapped = mapRealtimeChatMessageReceived(payload)
    if (mapped) {
      this.messageReceivedListeners.forEach((cb) => cb(mapped))
    }
  }

  private dispatchEscalationResolved(payload: unknown) {
    const mapped = mapRealtimeChatEscalationResolved(payload)
    if (mapped) {
      this.escalationResolvedListeners.forEach((cb) => cb(mapped))
    }
  }

  // Suscripción a notificaciones generales
  public subscribeToNotification(cb: NotificationCallback): () => void {
    this.notificationListeners.add(cb)
    void this.ensureConnected()

    return () => {
      this.notificationListeners.delete(cb)
      this.scheduleStopIfNoSubscribers()
    }
  }

  // Suscripción a eventos de chat y escalamiento
  public subscribeToChatEscalations(listeners: ChatEscalationsListeners): () => void {
    if (listeners.onEscalationCreated) {
      this.escalationCreatedListeners.add(listeners.onEscalationCreated)
    }
    if (listeners.onMessageReceived) {
      this.messageReceivedListeners.add(listeners.onMessageReceived)
    }
    if (listeners.onEscalationResolved) {
      this.escalationResolvedListeners.add(listeners.onEscalationResolved)
    }

    void this.ensureConnected()

    return () => {
      if (listeners.onEscalationCreated) {
        this.escalationCreatedListeners.delete(listeners.onEscalationCreated)
      }
      if (listeners.onMessageReceived) {
        this.messageReceivedListeners.delete(listeners.onMessageReceived)
      }
      if (listeners.onEscalationResolved) {
        this.escalationResolvedListeners.delete(listeners.onEscalationResolved)
      }
      this.scheduleStopIfNoSubscribers()
    }
  }

  // Helpers de simulación local para testing / manual QA
  public simulateNotification(payload: unknown): boolean {
    this.dispatchNotification(payload)
    return true
  }

  public simulateEscalationCreated(payload: unknown): boolean {
    this.dispatchEscalationCreated(payload)
    return true
  }

  public simulateMessageReceived(payload: unknown): boolean {
    this.dispatchMessageReceived(payload)
    return true
  }

  public simulateEscalationResolved(payload: unknown): boolean {
    this.dispatchEscalationResolved(payload)
    return true
  }

  public simulateRealtimeEvent(eventName: string, payload: unknown): boolean {
    switch (eventName) {
      case SIGNALR_EVENTS.RECEIVE_NOTIFICATION:
      case 'ReceiveNotification':
        return this.simulateNotification(payload)
      case SIGNALR_EVENTS.CHAT_ESCALATION_CREATED:
      case 'ChatEscalationCreated':
        return this.simulateEscalationCreated(payload)
      case SIGNALR_EVENTS.CHAT_MESSAGE_RECEIVED:
      case 'ChatMessageReceived':
        return this.simulateMessageReceived(payload)
      case SIGNALR_EVENTS.CHAT_ESCALATION_RESOLVED:
      case 'ChatEscalationResolved':
        return this.simulateEscalationResolved(payload)
      default:
        return false
    }
  }

  public getConnectionState(): HubConnectionState {
    return this.connection ? this.connection.state : HubConnectionState.Disconnected
  }
}

// Instancia singleton para compartir la única conexión SignalR en toda la app
export const notificationsHubManager = new NotificationsHubManager()
