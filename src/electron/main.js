// main.js
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let pythonProcess = null;

function createWindow() {
  // Start FastAPI server
  startPythonBackend();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load the FastAPI frontend (give it a moment to start)
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:8000');
  }, 10000); // Wait 3 seconds for FastAPI to start

  // Optional: Open DevTools
  // mainWindow.webContents.openDevTools();
}


function startPythonBackend() {
  // During development, use 'python', in production use the path to the .exe
  const scriptPath = path.join(process.resourcesPath, 'backend', 'app.exe');

  pythonProcess = spawn(scriptPath);
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();
});

app.on('will-quit', () => {
  pythonProcess.kill(); // Important: Don't leave "zombie" processes!
});


// function startFastAPI() {
//   // Adjust this path to your Python script
//   const pythonScriptPath = 'src/backend/app.py';
  
//   // On Windows
//   pythonProcess = spawn('python', [pythonScriptPath], {
//     stdio: 'pipe'  // Capture output
//   });

//   // Log Python output
//   pythonProcess.stdout.on('data', (data) => {
//     console.log(`FastAPI: ${data}`);
//   });

//   pythonProcess.stderr.on('data', (data) => {
//     console.error(`FastAPI Error: ${data}`);
//   });

//   pythonProcess.on('close', (code) => {
//     console.log(`FastAPI process exited with code ${code}`);
//   });
// }

// app.whenReady().then(createWindow);

// // Handle window closing
// app.on('window-all-closed', () => {
//   // Kill Python process when app closes
//   if (pythonProcess) {
//     pythonProcess.kill();
//   }
  
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

// // Ensure Python process is killed on quit
// app.on('will-quit', () => {
//   if (pythonProcess) {
//     pythonProcess.kill();
//   }
// });
