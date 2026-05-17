const { app, BrowserWindow, Menu, Tray } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow
let tray

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  })

  // Load development or production URL
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * Create system tray with quick access menu
 */
function createTray() {
  const trayIconPath = path.join(__dirname, 'tray-icon.png')
  tray = new Tray(trayIconPath)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide()
    } else if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
}

/**
 * App event handlers
 */
app.on('ready', () => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  // On macOS, quit app when all windows closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create window when dock icon clicked
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
})

/**
 * Single-instance lock (prevent multiple app instances on Windows/Linux)
 */
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
