/**
 * Chrome Extension Service Worker (Background)
 * Handles extension lifecycle and storage sync
 */

const STORAGE_KEY = 'conductor_schedule_v1'
const FIRESTORE_SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Energy Coach Scheduler installed')
  // Initialize empty schedule storage
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (!result[STORAGE_KEY]) {
      const initialSchedule = {
        tasks: [],
        lastResetDate: new Date().toISOString().split('T')[0],
      }
      chrome.storage.sync.set({ [STORAGE_KEY]: initialSchedule })
    }
  })
})

// Periodic sync (optional: connect to Firebase for real-time updates)
chrome.alarms.create('sync-schedule', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync-schedule') {
    // Sync with main app's storage
    // Future: Add Firebase Firestore listener for cross-device sync
    console.log('Schedule sync triggered')
  }
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSchedule') {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      sendResponse(result[STORAGE_KEY] || null)
    })
    return true // Will respond asynchronously
  }

  if (request.action === 'updateSchedule') {
    chrome.storage.sync.set({ [STORAGE_KEY]: request.payload })
    sendResponse({ success: true })
    return true
  }
})
