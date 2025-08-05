// electron.js
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      // Ensure proper theme handling
      backgroundThrottling: false
    }
  });

  // For development - use Vite's default port
  win.loadURL('http://localhost:5173');

  // For production (when bundled)
  // win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
