// Admin — Key/value settings editor.
//
// Backend returns:
//   { data: { key: value, ... }, meta: { key: {description, updated_at} } }

import { apiClient } from '../apiClient'

export type SettingValue = number | string | boolean | number[] | string[]

export type SettingsResponse = {
  data: Record<string, SettingValue>
  meta: Record<string, { description?: string; updated_at?: string }>
}

export async function listSettings(): Promise<SettingsResponse> {
  const { data } = await apiClient.get<SettingsResponse>('/admin/settings')
  return data
}

export async function updateSetting(
  key: string,
  value: SettingValue,
): Promise<void> {
  await apiClient.patch(`/admin/settings/${key}`, { value })
}
