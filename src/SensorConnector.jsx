import React, { useEffect, useState, useRef } from 'react';
import "./SensorConnector.css"

const SensorConnector = ({isRecording, passData}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const lastRriRef = useRef(null);

  const connectDevice = async () => {
    try {
      // 1. Request device with Heart Rate Service
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'] // Good for research monitoring
      });

      // 2. Connect to GATT Server
      const server = await device.gatt.connect();
      
      // 3. Get the Heart Rate Service
      const service = await server.getPrimaryService('heart_rate');
      
      // 4. Get the Characteristic
      const char = await service.getCharacteristic('heart_rate_measurement');
      setCharacteristic(char);
      setIsConnected(true);
    } catch (error) {
      console.error("Bluetooth Error:", error);
    }
  };

  useEffect(() => {
    if (characteristic) {
      if (isRecording) { startNotifications();}
      else { stopNotifications();}
    }
  }, [isRecording, characteristic])

  const startNotifications = async() => {
    try {
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleHeartRateData);
        console.log('Started recording heart rate');
    } catch (error) {
        console.error('Error starting notifications:', error);
    }
  }

  const stopNotifications = async () => {
    try {
        await characteristic.stopNotifications();
        characteristic.removeEventListener('characteristicvaluechanged', handleHeartRateData);
        console.log('Stopped recording heart rate');
    } catch (error) {
        console.error('Error stopping notifications:', error);
    }
  };

  const handleHeartRateData = (event) => {
    const value = event.target.value;
    const flags = value.getUint8(0);
    const bpm = value.getUint8(1);

    const hasRR = flags & 0x10;

    if (hasRR) {
      for (let i = 2; i < value.byteLength; i += 2) {
        const rriRaw = value.getUint16(i, true);
        const rriMs = (rriRaw / 1024) * 1000;

        if (lastRriRef.current === rriMs) continue;
        lastRriRef.current = rriMs;

        passData({
          bpm: bpm,
          rri: rriMs,
        });

      }
    }

  };

  useEffect(() => {
    return () => {
      if (characteristic) { stopNotifications(); }
    };
  }, [characteristic]);


  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>{isConnected ? "✅ Connected" : "❌ Disconnected"}</h2>
      <button onClick={connectDevice}>Connect to Heart Rate Censors</button>
    </div>
  );
};

export default SensorConnector;