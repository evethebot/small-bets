import { useCallback } from 'react'
import type { MessageType, ExtensionResponse } from '@/lib/types'

/**
 * Hook for sending messages to the background service worker.
 */
export function useSendMessage() {
  const send = useCallback(async <T = unknown>(
    type: MessageType,
    payload?: unknown,
  ): Promise<ExtensionResponse<T>> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type, payload }, (response: ExtensionResponse<T>) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message })
        } else {
          resolve(response ?? { success: false, error: 'No response' })
        }
      })
    })
  }, [])

  return send
}
