# Development Mode Guide

## Device Fingerprinting in Development

For easier testing, the app now uses a **simplified device ID** in development mode instead of FingerprintJS.

### How It Works:

**Development Mode (npm run dev):**
- Uses a random session-based ID: `dev-abc123-1234567890`
- Stored in browser's `sessionStorage`
- Persists during your browser session
- Resets when you close the tab

**Production Mode:**
- Uses real FingerprintJS for device fingerprinting
- More secure and reliable

### Testing Multiple Reviews:

To test the duplicate prevention system:

1. **Same Device (should be blocked):**
   - Submit a review
   - Try to submit another review for the same teacher
   - ❌ Should show: "تۆ پێشتر ئەم مامۆستایەت هەڵسەنگاندووە"

2. **Different Device (should work):**
   - Open a new **Incognito/Private window**
   - Submit a review
   - ✅ Should succeed (different sessionStorage)

3. **Reset Your Device ID:**
   - Open browser DevTools (F12)
   - Go to Application → Session Storage
   - Delete `dev_device_id`
   - Refresh page
   - You'll get a new device ID

### Clear Session Storage:

```javascript
// Run in browser console to reset your device ID
sessionStorage.removeItem('dev_device_id')
location.reload()
```

This makes testing much easier during development! 🎉
