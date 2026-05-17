# Energy Coach Scheduler — Chrome Extension Setup

## Building the Extension

### 1. Build the extension popup
```bash
npm run build:extension
# Builds to dist-extension/
```

### 2. Load unpacked extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist-extension/` folder

### 5. Connect to main app
The extension popup displays tasks from **Chrome Sync Storage**.

To sync tasks between the web app and extension:
- **Same device:** Tasks auto-sync via Chrome sync storage
- **Cross-device:** Enable Firebase integration (see ../FIREBASE_SETUP.md)

### File Structure
```
extension/
├── manifest.json       # Extension configuration (Manifest v3)
├── popup.html          # Extension popup UI template
├── popup.tsx           # React component for popup
├── background.js       # Service worker for ext lifecycle
└── images/             # Icons (add custom PNG files here)
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### Extension Features
- ✅ View today's schedule in browser popup (380×500px)
- ✅ Click tasks to toggle state (pending → in_progress → done)
- ✅ Progress bar showing completion percentage
- ✅ Real-time sync with main app via Chrome storage
- ✅ Link to open full app

### Permissions
- `storage` — Read/write schedule data to Chrome Sync Storage
- `scripting` — (Optional) Inject scripts if needed
- `<all_urls>` — (Optional) Access any website for context

### Troubleshooting

**Tasks not syncing?**
- Check Chrome Sync is enabled (Settings → Sync and Google services)
- Reload extension: `chrome://extensions/` → Refresh button

**Icon not showing?**
- Add 16×16, 48×48, 128×128 PNG files to `extension/images/`
- Rebuild with `npm run build:extension`

**Storage quota exceeded?**
- Chrome Sync Storage has ~100KB limit
- Use Firefox/Brave if limit is a concern, or implement Firebase sync

### Publishing to Chrome Web Store
When ready to publish:
1. Create PNG icons (all sizes)
2. Create extension description and screenshots
3. Go to Chrome Web Store Developer Dashboard
4. Upload dist-extension/ as zip
5. Submit for review (2-7 days typically)
