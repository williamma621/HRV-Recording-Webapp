# 🔬 HRV Recording Tool

Website tool for real-time Heart Rate Variability (HRV) recording with Transparent, Exportable data.

## ✨ Key Features
* **Zero-Install:** Runs on [This Website](https://williamma621.github.io/HRV-Recording-Webapp/) using the Web Bluetooth API.
* **Data Sovereignty:** One-click CSV export of raw RRI data and calculated features.
* **Real-time Transparent Analytics:** Live sliding-window RMSSD calculation with customizable window sizes, Adjustable delta-based artifact rejection for missed or ectopic beats.

## 📱 Hardware Compatibility
This tool is optimized for the **Polar H10** due to its high-fidelity RRI transmission. It is also compatible with:
* Polar H9
* Garmin HRM-Dual
* Wahoo TICKR
* Any BLE chest strap supporting the standard `0x180D` Heart Rate service.

## 🛠️ Tech Stack
* **Framework:** React + Vite (React-SWC)
* **Visuals:** Chart.js with Streaming Plugin
* **Logic:** Web Bluetooth GATT API

## 🚀 Getting Started
1. Open the [Live Web App](https://williamma621.github.io/HRV-Research-Software/).
2. Click **Connect** and select your Polar H10.
3. Click **Start Recording** and your live RRI/BPM/RMSSD will begin streaming.
4. Use the **Export** button to download your session data for further analysis in R, Python, etc..

---
*Created by [William Ma] as part of research on activity-based stress levels at [Mind Body Signaling Lab/University of California, Irvine].*
