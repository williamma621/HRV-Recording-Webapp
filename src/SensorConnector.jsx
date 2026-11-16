import React, { useEffect, useEffectEvent, useState, useRef } from 'react';
import "./SensorConnector.css"

const SensorConnector = ({isRecording, passData}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const notificationQueueRef = useRef(Promise.resolve());

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

  const handleHeartRateData = useEffectEvent((event) => {
    if (!isRecording) return;

    const value = event.target.value;
    const flags = value.getUint8(0);
    const bpm = value.getUint8(1);

    const hasRR = flags & 0x10;

    if (hasRR) {
      for (let i = 2; i < value.byteLength; i += 2) {
        const rriRaw = value.getUint16(i, true);
        const rriMs = (rriRaw / 1024) * 1000;

        passData({
          bpm: bpm,
          rri: rriMs,
        });

      }
    }

  });

  useEffect(() => {
    if (!characteristic || !isRecording) return;

    const char = characteristic;
    let active = true;

    const listener = (event) => {
      if (active) {
        handleHeartRateData(event);
      }
    };

    // Serialize Bluetooth operations across pause/resume transitions.
    const enqueue = (operation) => {
      notificationQueueRef.current = notificationQueueRef.current
        .then(operation)
        .catch((error) => {
          console.error('Bluetooth notification error:', error);
        });
    };

    char.addEventListener('characteristicvaluechanged', listener);

    enqueue(async () => {
      if (active) {
        await char.startNotifications();
      }
    });

    return () => {
      active = false;
      // Cleanup retains the exact listener registered by this effect.
      char.removeEventListener('characteristicvaluechanged', listener);
      enqueue(() => char.stopNotifications());
    };
  }, [characteristic, isRecording]);


  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>{isConnected ? "✅ Connected" : "❌ Disconnected"}</h2>
      <button onClick={connectDevice}>Connect to Heart Rate Censors</button>
    </div>
  );
};

export default SensorConnector;
