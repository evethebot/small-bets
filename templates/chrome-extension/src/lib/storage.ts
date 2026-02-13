// ============================================================
// {{PRODUCT_NAME}} — Chrome Storage Wrapper
// ============================================================
//
// Type-safe wrapper around chrome.storage (sync + local).
//
// Usage:
//   import { storage } from '@/lib/storage'
//   await storage.get<Settings>('settings')
//   await storage.set('settings', { locale: 'en' })
//   storage.onChange('settings', (newVal, oldVal) => { ... })
//
// Conventions:
//   • sync  → small user preferences (< 100 KB total)
//   • local → large data, auth tokens, caches (< 10 MB total)
//
// ============================================================

import type { StorageArea } from './types'

// --------------------------------------------------
// Core helpers
// --------------------------------------------------

async function get<T>(key: string, area: StorageArea = 'sync'): Promise<T | undefined> {
  const result = await chrome.storage[area].get(key)
  return result[key] as T | undefined
}

async function set<T>(key: string, value: T, area: StorageArea = 'sync'): Promise<void> {
  await chrome.storage[area].set({ [key]: value })
}

async function remove(key: string, area: StorageArea = 'sync'): Promise<void> {
  await chrome.storage[area].remove(key)
}

async function getAll(area: StorageArea = 'sync'): Promise<Record<string, unknown>> {
  return chrome.storage[area].get(null)
}

async function clear(area: StorageArea = 'sync'): Promise<void> {
  await chrome.storage[area].clear()
}

// --------------------------------------------------
// Batch operations
// --------------------------------------------------

async function getBatch<T extends Record<string, unknown>>(
  keys: string[],
  area: StorageArea = 'sync',
): Promise<Partial<T>> {
  return chrome.storage[area].get(keys) as Promise<Partial<T>>
}

async function setBatch(
  items: Record<string, unknown>,
  area: StorageArea = 'sync',
): Promise<void> {
  await chrome.storage[area].set(items)
}

// --------------------------------------------------
// Change listeners
// --------------------------------------------------

type ChangeCallback<T> = (newValue: T | undefined, oldValue: T | undefined) => void

function onChange<T>(
  key: string,
  callback: ChangeCallback<T>,
  area: StorageArea = 'sync',
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== area || !changes[key]) return
    callback(changes[key].newValue as T | undefined, changes[key].oldValue as T | undefined)
  }
  chrome.storage.onChanged.addListener(listener)
  // Return unsubscribe function
  return () => chrome.storage.onChanged.removeListener(listener)
}

function onAnyChange(
  callback: (changes: Record<string, chrome.storage.StorageChange>, area: string) => void,
): () => void {
  chrome.storage.onChanged.addListener(callback)
  return () => chrome.storage.onChanged.removeListener(callback)
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export const storage = {
  get,
  set,
  remove,
  getAll,
  clear,
  getBatch,
  setBatch,
  onChange,
  onAnyChange,
} as const
