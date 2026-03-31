/**
 * FCM Notification Debugging & Setup Guide
 * 
 * If notifications are NOT working, follow these steps:
 */

// ============================================
// FRONTEND CHECKLIST
// ============================================

/*
1. Check if Service Worker is registered
   - Ctrl+Shift+I → Application → Service Workers
   - Should see: firebase-messaging-sw.js (Active)

2. Check Browser Requirements:
   - HTTPS or localhost (secure context required)
   - Recent version of Chrome/Firefox/Edge
   - Notifications enabled for the site

3. Check localStorage for FCM token:
   - Ctrl+Shift+I → Application → Local Storage
   - Look for: LRCL_FCM_TOKEN
   - Should have a value like: "AB...xyz123"

4. Check Browser Console for errors:
   - Ctrl+Shift+I → Console
   - Look for lines starting with:
     ✓ "Service Worker registered and ready"
     ✓ "Firebase Messaging initialized"
     ✓ "FCM Token:"
   - Check for any red errors

5. Test Notification Permission:
   - Browser should ask: "Allow notifications?"
   - Check Notification.permission:
     'granted' = OK
     'denied' = Need to reset
     'default' = Ask per page
*/

// ============================================
// BACKEND CHECKLIST
// ============================================

/*
1. Firebase Service Account JSON is MISSING ❌
   Path expected: ludo/src/config/firebase-service-account.json
   
   TO FIX:
   a) Go to: https://console.firebase.google.com/
   b) Select project: "ludo-c1bc3"
   c) Click gear icon → Project Settings
   d) Go to "Service Accounts" tab
   e) Click "Generate New Private Key"
   f) Save the JSON file
   g) Rename it to: firebase-service-account.json
   h) Place in: ludo/src/config/firebase-service-account.json
   i) Do NOT commit to git (add to .gitignore)

2. Check console logs when server starts:
   Should see: "✅ Firebase Admin SDK initialized for FCM notifications"
   If NOT, notifications won't  work
*/

// ============================================
// TEST NOTIFICATION FLOW
// ============================================

/*
1. Register a test customer
2. Wait for browser to ask for notification permission
3. Grant permission
4. Check browser console for "FCM Token: ABC..."
5. Customer's device should be saved in database:
   - Check customer_devices table
   - Fields: device_token, device_type, fcm_token, customer_id

6. Go to admin panel
7. Book a table for the customer
8. Check server console for:
   "✅ Booking notification sent to customer ... on X device(s)"

9. Check customer's browser:
   - Should receive notification popup
   - Or check: Ctrl+Shift+I → Application → Notifications
*/

export const FCM_DEBUGGING = {
  // Check frontend setup
  checkFrontendSetup: () => {
    console.log('=== FCM FRONTEND DEBUG ===');
    console.log('Service Workers:', navigator.serviceWorker ? 'Supported ✓' : 'NOT supported ✗');
    console.log('Notification API:', 'Notification' in window ? 'Supported ✓' : 'NOT supported ✗');
    console.log('Permission:', (window as any).Notification?.permission || 'Not requesting');
    console.log('FCM Token:', localStorage.getItem('LRCL_FCM_TOKEN') || 'NOT found');
    console.log('Device Token:', localStorage.getItem('LRCL_DEVICE_TOKEN') || 'NOT found');
  },

  // Check if conditions are met
  checkNotificationRequirements: () => {
    const checks = {
      'Secure Context (HTTPS/localhost)': window.isSecureContext,
      'Service Worker Support': 'serviceWorker' in navigator,
      'Notification API': 'Notification' in window,
      'User Permission Granted': (window as any).Notification?.permission === 'granted',
    };

    console.log('=== NOTIFICATION REQUIREMENTS ===');
    Object.entries(checks).forEach(([name, status]) => {
      console.log(`${name}: ${status ? '✓' : '✗'}`);
    });

    const allMet = Object.values(checks).every(v => v === true);
    console.log(`\n${allMet ? '✅ ALL REQUIREMENTS MET' : '❌ SOME REQUIREMENTS NOT MET'}`);
  }
};

// Call these in browser console to debug
// FCM_DEBUGGING.checkFrontendSetup()
// FCM_DEBUGGING.checkNotificationRequirements()
