// ============================================================
// TabFlow AI — LemonSqueezy Payment Integration
// ============================================================
//
// License key validation + activation via LemonSqueezy API.
//
// Flow:
//   1. User enters license key in Settings
//   2. Call validateLicense() → check if key is valid
//   3. Call activateLicense() → bind key to this Chrome install
//   4. Store result via storage.set('license', ...)
//   5. Periodically re-validate (via background alarm)
//
// Docs: https://docs.lemonsqueezy.com/api/license-keys
//
// ============================================================

import { storage } from './storage'
import { STORAGE_KEYS, LEMONSQUEEZY } from './constants'
import type { LicenseInfo, LicenseValidationResponse, LicenseStatus } from './types'

// --------------------------------------------------
// API calls
// --------------------------------------------------

async function apiCall(
  endpoint: string,
  body: Record<string, string>,
): Promise<LicenseValidationResponse> {
  const res = await fetch(`${LEMONSQUEEZY.API_URL}/licenses/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return { valid: false, error: `HTTP ${res.status}: ${res.statusText}` }
  }

  return res.json()
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

/** Validate a license key without activating it */
export async function validateLicense(key: string): Promise<LicenseValidationResponse> {
  return apiCall('validate', {
    license_key: key,
    instance_name: 'chrome-extension',
  })
}

/** Activate a license key and bind it to this browser instance */
export async function activateLicense(key: string): Promise<LicenseValidationResponse> {
  const instanceName = `chrome-${crypto.randomUUID().slice(0, 8)}`
  const result = await apiCall('activate', {
    license_key: key,
    instance_name: instanceName,
  })

  if (result.valid && result.instance) {
    const info: LicenseInfo = {
      key,
      status: (result.license_key?.status as LicenseStatus) ?? 'active',
      instanceId: result.instance.id,
      activatedAt: Date.now(),
      expiresAt: result.license_key?.expires_at
        ? new Date(result.license_key.expires_at).getTime()
        : undefined,
    }
    await storage.set(STORAGE_KEYS.LICENSE, info, 'local')
  }

  return result
}

/** Deactivate the current license instance */
export async function deactivateLicense(): Promise<boolean> {
  const info = await storage.get<LicenseInfo>(STORAGE_KEYS.LICENSE, 'local')
  if (!info?.instanceId) return false

  const result = await apiCall('deactivate', {
    license_key: info.key,
    instance_id: info.instanceId,
  })

  if (result.valid) {
    await storage.remove(STORAGE_KEYS.LICENSE, 'local')
  }

  return result.valid
}

/** Get current stored license info */
export async function getLicense(): Promise<LicenseInfo | undefined> {
  return storage.get<LicenseInfo>(STORAGE_KEYS.LICENSE, 'local')
}

/** Check if the user has an active license */
export async function isLicensed(): Promise<boolean> {
  const info = await getLicense()
  if (!info) return false
  if (info.status !== 'active') return false
  if (info.expiresAt && Date.now() > info.expiresAt) return false
  return true
}

/** Re-validate the stored license (call periodically from background) */
export async function recheckLicense(): Promise<boolean> {
  const info = await getLicense()
  if (!info) return false

  const result = await validateLicense(info.key)
  if (!result.valid) {
    // License revoked or expired — update local state
    await storage.set<LicenseInfo>(
      STORAGE_KEYS.LICENSE,
      { ...info, status: 'inactive' },
      'local',
    )
    return false
  }

  // Update status from server
  const newStatus = (result.license_key?.status as LicenseStatus) ?? info.status
  if (newStatus !== info.status) {
    await storage.set<LicenseInfo>(
      STORAGE_KEYS.LICENSE,
      { ...info, status: newStatus },
      'local',
    )
  }

  return newStatus === 'active'
}
