export type { RealtimeNotificationPayload } from './realtimeNotificationTypes.ts'
export {
  mapRealtimeNotificationPayload,
  prependNotificationById,
  isRealtimeNotificationUnread,
} from './mapRealtimeNotification.ts'
export { useNotificationsRealtime } from './useNotificationsRealtime.ts'
export type { UseNotificationsRealtimeOptions } from './useNotificationsRealtime.ts'

export type {
  ChatEscalationCreatedPayload,
  ChatMessageReceivedPayload,
  ChatEscalationResolvedPayload,
} from './realtimeChatTypes.ts'
export {
  mapRealtimeChatEscalationCreated,
  mapRealtimeChatMessageReceived,
  mapRealtimeChatEscalationResolved,
} from './realtimeChatTypes.ts'

export {
  notificationsHubManager,
  SIGNALR_EVENTS,
  NOTIFICATIONS_HUB_URL,
} from './notificationsHubManager.ts'
export type {
  NotificationCallback,
  ChatEscalationCreatedCallback,
  ChatMessageReceivedCallback,
  ChatEscalationResolvedCallback,
  ChatEscalationsListeners,
} from './notificationsHubManager.ts'

export { useChatEscalationsRealtime } from './useChatEscalationsRealtime.ts'
export type { UseChatEscalationsRealtimeOptions } from './useChatEscalationsRealtime.ts'
