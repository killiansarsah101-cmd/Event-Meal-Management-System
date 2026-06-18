'use client'

import { useEffect, useState } from 'react'
import { getSyncQueue } from '@/lib/offline/db'

type IndicatorState = 'online-idle' | 'offline' | 'syncing' | 'hidden'

/**
 * OfflineIndicator Component
 * Displays the current offline/sync status at the top of the screen
 * - Hidden when online and no sync queue
 * - Shows "Offline" banner when device is offline
 * - Shows "Syncing..." when sync operations are in progress
 */
export default function OfflineIndicator() {
  const [state, setState] = useState<IndicatorState>('hidden')
  const [isOnline, setIsOnline] = useState(true)
  const [syncInProgress, setSyncInProgress] = useState(false)

  // Check sync queue status
  const checkSyncQueue = async () => {
    try {
      const queue = await getSyncQueue()
      if (queue.length > 0) {
        setSyncInProgress(true)
      } else {
        setSyncInProgress(false)
      }
    } catch (error) {
      console.warn('[v0] Failed to check sync queue:', error)
    }
  }

  // Update indicator state based on online status and sync progress
  useEffect(() => {
    if (!isOnline) {
      setState('offline')
    } else if (syncInProgress) {
      setState('syncing')
    } else {
      setState('hidden')
    }
  }, [isOnline, syncInProgress])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[v0] Device is online')
      setIsOnline(true)
      // Check if there's a sync queue to process
      checkSyncQueue()
    }

    const handleOffline = () => {
      console.log('[v0] Device is offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Listen for sync completion messages from the sync handler
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        console.log('[v0] Sync completed, checking queue...')
        checkSyncQueue()
        // Auto-hide after a brief delay if sync is complete
        setTimeout(() => {
          setSyncInProgress(false)
        }, 1000)
      }
    }

    window.addEventListener('message', handleMessage)

    // Initial check of sync queue
    checkSyncQueue()

    // Periodically check sync queue (every 2 seconds)
    const interval = setInterval(() => {
      if (isOnline) {
        checkSyncQueue()
      }
    }, 2000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('message', handleMessage)
      clearInterval(interval)
    }
  }, [isOnline])

  // Render based on state
  if (state === 'hidden') {
    return null
  }

  const isOffline = state === 'offline'
  const isSyncing = state === 'syncing'

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOffline
          ? 'bg-red-50 border-b border-red-200'
          : isSyncing
            ? 'bg-blue-50 border-b border-blue-200'
            : 'bg-transparent'
      }`}
    >
      <div className="max-w-full px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {isOffline && (
            <>
              <div className="flex h-2 w-2 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-red-700">
                Offline — changes will sync when connected
              </p>
            </>
          )}
          {isSyncing && (
            <>
              <div className="flex animate-pulse h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm font-medium text-blue-700">Syncing...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
