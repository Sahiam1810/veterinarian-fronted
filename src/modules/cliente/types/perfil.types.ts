export interface ClienteAccountStatus {
  statusLabel: string
  balanceLabel: string
  balanceAmount: string
  lastProcessedLabel: string
}

export interface ClienteProfilePayload {
  userId: number
  clientId: number
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  documentId: string
  address: string
  avatarUrl: string | null
  registeredAtLabel: string
  passwordUpdatedLabel: string
  accountStatus: ClienteAccountStatus
}
