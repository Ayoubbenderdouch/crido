const STORAGE_KEY = 'crido_vendor_settings_v1'

export const NOTIF_TYPES = ['newRequest', 'payoutSent', 'financingCompleted'] as const
export const NOTIF_CHANNELS = ['sms', 'email', 'push'] as const

export type NotificationType = (typeof NOTIF_TYPES)[number]
export type NotificationChannel = (typeof NOTIF_CHANNELS)[number]

export type VendorSettings = {
  notifications: Record<NotificationType, Record<NotificationChannel, boolean>>
  defaultBranchId: number
}

function defaultNotifications(): VendorSettings['notifications'] {
  return {
    newRequest: { sms: true, email: false, push: true },
    payoutSent: { sms: true, email: false, push: true },
    financingCompleted: { sms: true, email: false, push: true },
  }
}

export function defaultVendorSettings(defaultBranchId = 1): VendorSettings {
  return {
    notifications: defaultNotifications(),
    defaultBranchId,
  }
}

export function loadVendorSettings(fallbackBranchId = 1): VendorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultVendorSettings(fallbackBranchId)
    const parsed = JSON.parse(raw) as Partial<VendorSettings>
    const base = defaultVendorSettings(fallbackBranchId)
    return {
      defaultBranchId: parsed.defaultBranchId ?? base.defaultBranchId,
      notifications: {
        ...base.notifications,
        ...parsed.notifications,
        newRequest: { ...base.notifications.newRequest, ...parsed.notifications?.newRequest },
        payoutSent: { ...base.notifications.payoutSent, ...parsed.notifications?.payoutSent },
        financingCompleted: {
          ...base.notifications.financingCompleted,
          ...parsed.notifications?.financingCompleted,
        },
      },
    }
  } catch {
    return defaultVendorSettings(fallbackBranchId)
  }
}

export function saveVendorSettings(settings: VendorSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
