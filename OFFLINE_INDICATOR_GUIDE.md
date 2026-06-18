# Offline Indicator Component Guide

## Overview

The `OfflineIndicator` component is a lightweight, non-intrusive UI element that displays the current offline/sync status at the top of every page in the application. It is automatically rendered in the root layout and requires zero additional setup.

## Component Location

- **File:** `/src/components/OfflineIndicator.tsx`
- **Added to:** `/src/app/layout.tsx` (root layout)
- **Display:** Fixed at the top of the screen (`z-index: 50`)

## Visual States

### 1. **Hidden** (Online + No Sync Queue)
- **When:** Device is online AND sync queue is empty
- **Visual:** Nothing displayed
- **Behavior:** Component returns `null` — no DOM rendering

### 2. **Offline Banner** (Offline)
- **When:** Device is offline (no internet connection)
- **Visual:** Red banner at the top with message: "Offline — changes will sync when connected"
- **Styling:**
  - Background: `bg-red-50` (light red)
  - Border: `border-b border-red-200` (subtle red bottom border)
  - Icon: Red pulsing dot (2×2px)
  - Text: Red bold text (`text-red-700`, `font-medium`)

### 3. **Syncing State** (Online + Sync in Progress)
- **When:** Device is online AND sync queue has pending operations
- **Visual:** Blue banner at the top with message: "Syncing..."
- **Styling:**
  - Background: `bg-blue-50` (light blue)
  - Border: `border-b border-blue-200` (subtle blue bottom border)
  - Icon: Blue pulsing dot with animation
  - Text: Blue bold text (`text-blue-700`, `font-medium`)
- **Auto-dismiss:** Indicator automatically hides 1 second after sync completes

## How It Works

### Event Listeners
1. **Online/Offline Events:**
   - Listens to `window.online` event → sets component online
   - Listens to `window.offline` event → sets component offline

2. **Sync Completion Message:**
   - Listens for `window.postMessage` events with `type: 'SYNC_COMPLETE'`
   - Emitted by `/src/lib/offline/sync.ts` `processSyncQueue()` function
   - Used to update UI when sync is complete

### Sync Queue Checking
- Calls `getSyncQueue()` from `/src/lib/offline/db.ts` to check pending operations
- Runs on:
  - Initial component mount
  - When device comes online
  - Every 2 seconds while online (polling interval)
  - When sync completion message is received

### State Management
- **isOnline:** Boolean tracking online/offline status from `navigator.onLine`
- **syncInProgress:** Boolean based on sync queue length
- **state:** Derived state that combines `isOnline` and `syncInProgress` to determine display mode

## Styling & Responsiveness

### Tailwind Classes Used
- **Container:** `fixed top-0 left-0 right-0 z-50` — positioned fixed at top, full width
- **Transitions:** `transition-all duration-300` — smooth appearance/disappearance
- **Flexbox:** `flex items-center justify-center gap-2` — centers icon and text horizontally
- **Indicator Dot:** `h-2 w-2 rounded-full` — circular indicator
- **Animation:** `animate-pulse` (blue state only) — pulsing effect for visual feedback

### Responsive Design
- Works on all screen sizes (mobile, tablet, desktop)
- Maintains padding (`px-4 py-3`) for comfortable spacing
- Centered layout adapts naturally to viewport width

## Integration with Offline Sync System

### Connected Components
1. **`/src/lib/offline/sync.ts`**
   - `processSyncQueue()` emits `SYNC_COMPLETE` message when finished
   - Component listens for this message to update UI

2. **`/src/lib/offline/db.ts`**
   - `getSyncQueue()` function returns pending operations
   - Component calls this to determine if sync is needed

3. **`/src/components/service-worker-registration.tsx`**
   - Initializes sync handler when user comes online
   - Works alongside OfflineIndicator to trigger actual sync operations

### Data Flow
```
User goes offline
    ↓
OfflineIndicator shows "Offline" banner
    ↓
User goes online
    ↓
OfflineIndicator detects online + sync queue, shows "Syncing..."
    ↓
processSyncQueue() executes and sends SYNC_COMPLETE message
    ↓
OfflineIndicator receives message, waits 1s, hides
```

## Browser Compatibility

### Supported Features
- `window.addEventListener('online')` - All modern browsers ✓
- `window.addEventListener('offline')` - All modern browsers ✓
- `window.postMessage()` - All browsers ✓
- `navigator.onLine` - All browsers ✓
- IndexedDB (for sync queue) - Chrome, Firefox, Safari, Edge ✓

### Fallback Behavior
- Component gracefully handles missing IndexedDB (tries/catch)
- If sync queue check fails, component warns but doesn't break
- Works in browsers without Service Worker support

## Testing the Component

### Simulate Offline Mode (Chrome DevTools)
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. OfflineIndicator should show red "Offline" banner
5. Uncheck "Offline" → indicator should check sync queue

### Simulate Sync Operations
1. Go offline and perform actions (register participant, scan meal)
2. Offline operations are queued
3. Go online → OfflineIndicator shows "Syncing..." temporarily
4. After sync completes → indicator hides

### Check Sync Queue Directly (Console)
```javascript
// In browser console
import { getSyncQueue } from '@/lib/offline/db'

async function checkQueue() {
  const queue = await getSyncQueue()
  console.log('Sync queue:', queue)
  console.log('Pending items:', queue.length)
}

checkQueue()
```

## Performance Considerations

### Polling Interval
- Sync queue checked every 2 seconds while online
- This is a light operation (IndexedDB query on local device)
- No performance impact observed in testing

### Memory Usage
- Component holds minimal state (3 boolean/string values)
- Listeners cleaned up properly in useEffect cleanup
- No memory leaks detected

### Interaction Disabled
- Banner is **display-only** — no click handlers or interactive elements
- User can interact with page content normally
- Banner appears above all content (z-index: 50)

## Customization

### Styling Changes
Edit `/src/components/OfflineIndicator.tsx` to customize colors, fonts, or positioning:

```tsx
// Change offline banner color from red to orange
isOffline ? 'bg-orange-50 border-b border-orange-200' : '...'

// Change to bottom position instead of top
fixed bottom-0 left-0 right-0 z-50

// Increase banner height for more prominent display
py-4  // instead of py-3
```

### Message Text
```tsx
// Change message text
"Offline — changes will sync when connected"
// to
"No internet connection. Your changes will upload once you reconnect."
```

### Animation Speed
```tsx
// Slow down transitions from 300ms to 500ms
transition-all duration-500

// Change polling interval from 2 seconds to 5 seconds
const interval = setInterval(() => {
  if (isOnline) checkSyncQueue()
}, 5000)  // was 2000
```

## Troubleshooting

### Component Not Appearing
- Check that `<OfflineIndicator />` is in `/src/app/layout.tsx` body
- Verify component file exists at `/src/components/OfflineIndicator.tsx`
- Check browser console for any import errors

### "Offline" Banner Stays After Coming Online
- Browser's `navigator.onLine` may be delayed updating
- Wait 2-3 seconds for next polling cycle
- Manually refresh page if stuck (press F5)

### "Syncing..." Banner Never Disappears
- Check browser console for sync errors
- Verify sync operations complete successfully
- Check that `processSyncQueue()` emits `SYNC_COMPLETE` message
- Manually clear sync queue: `db.delete('sync_queue')` in DevTools

### IndexedDB Not Available
- Component gracefully handles this with try/catch
- Banner won't show sync state, but will still show offline state
- Sync queue operations will fail → check console for errors

## Security

### XSS Protection
- Component doesn't render user input
- All text is hardcoded strings
- No DOM manipulation risks

### Offline Data Safety
- Offline operations stored in IndexedDB (browser storage)
- Not accessible to other websites (same-origin policy)
- Synced to server after connection restored
- No sensitive data displayed in UI

## Future Enhancements

Potential improvements not in current implementation:

1. **Detailed Sync Progress**
   - Show "Syncing 3/7 items..." with progress bar
   - Requires broadcasting progress during sync

2. **Retry Logic UI**
   - Show "Sync failed" with "Retry now" button
   - Implement retry handler in component

3. **Dismissible Offline Banner**
   - Allow user to close banner manually
   - Remember preference in localStorage

4. **Sound/Vibration Notifications**
   - Beep when coming online
   - Vibrate on mobile when sync complete

5. **Analytics Integration**
   - Track offline usage patterns
   - Monitor sync success rates

## Related Files

- **Offline Sync Logic:** `/src/lib/offline/sync.ts`
- **Offline Database:** `/src/lib/offline/db.ts`
- **Service Worker:** `/public/sw.js`
- **Service Worker Registration:** `/src/components/service-worker-registration.tsx`
- **Root Layout:** `/src/app/layout.tsx`

---

**Component Status:** ✓ Production Ready

This component is fully tested and ready for deployment. It requires no configuration and automatically integrates with the offline sync system.
