import asyncio
from typing import List, Optional, Dict
from bleak import BleakClient, BleakScanner
from bleak.backends.device import BLEDevice
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel # Used for structured data exchange
import asyncio
import multiprocessing
import os
import sys
import webbrowser
import threading
import time

HR_CHAR = "00002a37-0000-1000-8000-00805f9b34fb"
def handle_hr(sender, data):
    flags = data[0]
    if flags & 0x10:
        # RR-Intervals start at byte 2, each is 2 bytes (1/1024 s resolution)
        for i in range(2, len(data), 2):
            # The value is in 1/1024 seconds, convert to seconds
            rr_msec = int.from_bytes(data[i:i+2], "little")
            rr_sec = rr_msec / 1024.0

            if server.is_recording and not server.is_paused:
                server.rr_record.append(rr_sec)
                beat = len(server.rr_record) + 1
                server.total_time += rr_sec
                def safe_put(item):
                    if not server.rr_queue.full():
                        server.rr_queue.put_nowait(item)

                server.loop.call_soon_threadsafe(
                    safe_put,
                    (beat, rr_sec, server.total_time))


class DeviceInfo(BaseModel):
    """Model for a discovered BLE device."""
    address: str
    name: str

class ServerState:
    """Manages the application's global state."""
    def __init__(self):
        self.ble_client: Optional[BleakClient] = None
        self.is_recording: bool = False
        self.is_paused: bool = False
        self.rr_record: List[float] = []
        self.total_time: float = 0
        self.rr_queue = None
server = ServerState()


app = FastAPI()

def get_base_path():
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller temporary folder
        return sys._MEIPASS
    return os.path.abspath(".")

base_path = get_base_path()
# Construct the absolute path to your static folder
static_dir = os.path.join(base_path, "src", "static")

# Mount the static HTML file
app.mount("/src/static", StaticFiles(directory=static_dir), name="static")
@app.get("/", response_class=HTMLResponse)
async def get_index():
    index_path = os.path.join(static_dir, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()

@app.on_event("startup")
async def startup():
    server.loop = asyncio.get_running_loop()
    server.rr_queue = asyncio.Queue(maxsize=1000)
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:8000")
    
    threading.Thread(target=open_browser, daemon=True).start()


server = ServerState()
@app.get("/api/devices", response_model=List[DeviceInfo])
async def search_devices():
    print("Starting BLE scan...")
    devices: List[BLEDevice] = await BleakScanner.discover(timeout=3.0)
    print(f"Scan complete. Found {len(devices)} devices.")
    
    # Filter and map to the Pydantic model
    available_devices = [ DeviceInfo(address=d.address, name=d.name or "Unknown Device") for d in devices ]
    return available_devices

@app.post("/api/connect/{address:path}")
async def connect_device(address:str):
    server.ble_client =  BleakClient(address)
    await server.ble_client.connect()
    return {"status": "connecting", "address": address}

@app.post("/api/disconnect")
async def disconnect_device():
    await server.ble_client.disconnect()
    return {"status": "disconnected"}

@app.post("/api/record/start")
async def start_recording():
    server.rr_record.clear()
    server.total_time = 0
    server.is_recording = True
    server.is_paused = False

    await server.ble_client.start_notify(HR_CHAR, handle_hr)
    return {"status": "recording started"}

@app.post("/api/record/pause-resume")
async def pause_resume_recording():
    server.is_paused = not server.is_paused # Toggle pause state
    return {"status": "paused" if server.is_paused else "resumed"}

@app.post("/api/record/end")
async def end_recording():
    server.is_recording = False
    server.is_paused = False
    await server.ble_client.stop_notify(HR_CHAR)
    return {"status": "recording ended"}



@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            beat, rr, time = await server.rr_queue.get()
            await ws.send_json({
                'beat': beat,
                'rr': rr, 
                'time': time,
                # 'rmssd':rmssd
            })
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    multiprocessing.freeze_support()
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_config=None)