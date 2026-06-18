# OfflineIndicator Component - Quick Reference

## What It Does
Displays connection status and sync progress at the top of every page.

## Visual States
```
┌─────────────────────────────────────────────────────┐
│ 🔴 Offline — changes will sync when connected      │  ← Offline (Red)
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔵 Syncing...                                       │  ← Syncing (Blue)
└─────────────────────────────────────────────────────┘

(Nothing shown when online + no sync queue)             ← Hidden
```

## Component Location
`/src/components/OfflineIndicator.tsx`

## Files Modified
- `/src/app/layout.tsx` - Added import and component render
- `/src/lib/offline/sync.ts` - Added SYNC_COMPLETE message emit

## How to Use
**Nothing to do!** It's automatically added to the root layout and works on every page.

## Testing Offline Mode
1. Chrome DevTools → Network → Check "Offline"
2. Red banner appears
3. Uncheck "Offline" → Check sync queue
4. If sync queue has items → Blue banner shows
5. After sync → Banner hides

## Customization Examples

### Change Colors
Edit `/src/components/OfflineIndicator.tsx`:
```tsx
// Line 108-109
isOffline
  ? 'bg-orange-50 border-b border-orange-200'  // Change red to orange
  : isSyncing
    ? 'bg-green-50 border-b border-green-200'  // Change blue to green
```

### Change Messages
```tsx
// Line 117
"Custom offline message here"

// Line 123
"Custom syncing message here"
```

### Change Polling Interval
```tsx
// Line 65 (default 2000ms)
const interval = setInterval(() => {
  if (isOnline) checkSyncQueue()
}, 5000)  // Change to 5 seconds
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Banner not showing | Check layout.tsx has `<OfflineIndicator />` |
| Banner stuck offline | Wait 3s or refresh page |
| Banner stuck syncing | Check console for sync errors |
| IndexedDB errors | Browser's storage may be full |

## Browser Support
✓ Chrome/Edge 90+ | ✓ Firefox 88+ | ✓ Safari 14+ | ✓ Mobile browsers

## Documentation
- **Full Guide:** `/OFFLINE_INDICATOR_GUIDE.md`
- **Implementation:** `/OFFLINE_INDICATOR_IMPLEMENTATION.md`
- **Offline Sync:** `/OFFLINE_SYNC_GUIDE.md`

## Key Features
- ✅ Automatic (no setup needed)
- ✅ Responsive (works on all devices)
- ✅ Lightweight (minimal performance impact)
- ✅ Non-intrusive (display-only, no clicks)
- ✅ Production-ready (fully tested)

---

**Status:** Ready to use in production
