const { contextBridge } = require('electron')

/**
 * Preload script for security
 * Provides safe IPC bridges from renderer to main process
 */

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electron', {
  appVersion: process.env.APP_VERSION || '1.0.0',
})
