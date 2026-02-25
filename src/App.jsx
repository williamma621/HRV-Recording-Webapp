import { useState } from 'react'
import { useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SensorConnector from './SensorConnector'
import LiveChart from './LiveChart'
import Papa from 'papaparse';
import "./App.css"

function App() {
  const heartDataRef = useRef([{'beat':0, 'bpm':NaN, 'rri':NaN, 'time': 0, 'rmssd':NaN}]);
  const [,setTick] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState({'showRRI': false, 'showBPM': false, 'showRMSSD': false, 'min_rrs': 5, 'max_rrs': 5, 'rr_diff_cap': 160})
  const [isExpanded, setIsExpanded] = useState([true, true, true, true])
  const fileInputRef = useRef(null);
  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(0);
  const [colorValue, setColorValue] = useState('#e0db41'); // Default color
  const [name, setName] = useState("interval1"); // Default color
  const [selectedValue, setSelectedValue] = useState("");


  const triggerFileSelect = () => {
    fileInputRef.current.click(); // This simulates the click on the hidden input
  };

  const handleSensorData = (sensorData) => {
    sensorData.time = heartDataRef.current[heartDataRef.current.length-1].time + sensorData.rri
    sensorData.beat = heartDataRef.current.length
    sensorData.rmssd = computeRMSSD(heartDataRef.current, 5, 5)
    heartDataRef.current.push(sensorData);

    setTick(tick => tick+1);
  }

  const clearSensorData = () => {
    if (confirm("This will clear your recorded data in this session. Are you sure you want to proceed")){
      heartDataRef.current = [{'beat':0, 'bpm':NaN, 'rri':NaN, 'time': 0, 'rmssd':NaN}];
      setTick(tick => tick+1);
    }
  }
  const computeRMSSD = (data, min_rrs, max_rrs, rr_diff_cap) => {
      // data: array of RR intervals (ms)
      // returns RMSSD or -1 if insufficient data

      const n = data.length;

      // Not enough RR intervals
      if (n < min_rrs + 1) {
          return NaN;
      }

      // Select last (max_rrs) RR intervals to use
      const usedData = n > max_rrs ? data.slice(n - max_rrs) : data.slice(1);

      let sumSqDiff = 0;
      let count = 0;

      for (let i = 1; i < usedData.length; i++) {
          const diff = usedData[i]['rri'] - usedData[i - 1]['rri'];
          // Delta-based RR rejection
          if (Math.abs(diff) > rr_diff_cap) {
              continue;
          }
          sumSqDiff += diff * diff;
          count++;
      }

      if (count == 0) { return NaN; }
      return Math.sqrt(sumSqDiff / count);
  }

  const exportToCSVWithMetadata = (userMetadata) => {
    const heartData = heartDataRef.current;
    
    if (heartData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Convert metadata to YAML format
    const metadataYaml = `#---\n${Object.entries(userMetadata)
      .map(([key, value]) => `#${key}: ${JSON.stringify(value)}`)
      .join('\n')}\n#---\n`;
    
    // Convert heart data to CSV
    const dataCsv = Papa.unparse(heartData, {
      quotes: true, // Quote all fields to handle special characters
      delimiter: ",", // Explicitly set delimiter
      newline: "\n", // Consistent line endings
      header: true // Include headers
    });
    
    // Combine metadata and data
    const fullContent = metadataYaml + dataCsv;
    
    // Create and trigger download
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heart_data_${userMetadata.session_id || 'export'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSVWithMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      
      // Parse YAML metadata header
      let metadata = {};
      let dataStartLine = 0;
      
      if (lines[0].startsWith('#---')) {
        let i = 1;
        while (i < lines.length && !lines[i].startsWith('#---')) {
          const line = lines[i];
          if (line.startsWith('#')) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
              const key = line.substring(1, colonIndex).trim();
              const value = line.substring(colonIndex + 1).trim();
              metadata[key] = value;
            }
          }
          i++;
        }
        dataStartLine = i + 1; // Skip the closing #---
      }
      
      // Parse the CSV data portion
      const csvContent = lines.slice(dataStartLine).join('\n');
      const parseResult = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true, // Automatically convert numbers
        skipEmptyLines: true
      });
      
      if (parseResult.errors.length > 0) {
        reject(parseResult.errors);
      } else {
        resolve({
          metadata: metadata,
          data: parseResult.data
        });
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await importFromCSVWithMetadata(file);
      console.log('Metadata:', result.metadata);
      console.log('Data:', result.data);
      
      // If you want to append to your existing ref
      for (const key in result.metadata){
        const value = JSON.parse(result.metadata[key])
        intervalPlugin.current.intervals[key] = value;
      }
      console.log(intervalPlugin.current.intervals)
      heartDataRef.current = []
      result.data.forEach(item => {
        heartDataRef.current.push(item);
      });
      setTick(tick => tick + 1);
      
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const toggleCollapse = (index) => {
    const newIsExpanded = isExpanded.map((e, i) => {
      if (i === index){return !e; } return e;
    })
    setIsExpanded(newIsExpanded)
  }
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const intervalPlugin = useRef({
  id: 'intervalBackground',
  intervals: {},
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const xScale = scales.x;
    const yScale = scales.y;

    Object.values(this.intervals).forEach(({ start, end, color }) => {
      const xStart = xScale.getPixelForValue(start);
      const xEnd = xScale.getPixelForValue(end);

      ctx.save();
      ctx.fillStyle = color;
      ctx.fillRect(
        xStart,
        chartArea.top,
        xEnd - xStart,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    });
  }
  });

  const addInterval = () => {
      intervalPlugin.current.intervals[name] = { 
        start: parseInt(startValue), // Make sure these are numbers, not strings
        end: parseInt(endValue), 
        color: hexToRgba(colorValue, 0.15)
      };
      setColorValue()
      setTick(tick => tick + 1);
  };

  const removeInterval = () => {
    delete intervalPlugin.current.intervals[selectedValue]
    setTick(tick => tick+1);
  }

  return (
    <div className='app-container'>
    <header>
        <div className="logos">
          <img src={viteLogo} className="logo" />
          <img src={reactLogo} className="logo" />
        </div>
        <h1>HRV Recording Webapp</h1>
      </header>

      <aside className="settings-panel">

        <span onClick={() => toggleCollapse(0)}> {isExpanded[0] ? "▼": "▶"}</span><b> Show Graph</b> <br />
        <div className='control-group' style={{display: isExpanded[0] ? "block": "none"}}>
            <input onChange={(e) => setSettings({...settings, showRRI: e.target.checked})} type="checkbox"/>
            <label> &nbsp; RRI </label> <br />
            <input onChange={(e) => setSettings({...settings, showBPM: e.target.checked})} type="checkbox"/>
            <label> &nbsp; BPM </label> <br />
            <input onChange={(e) => setSettings({...settings, showRMSSD: e.target.checked})} type="checkbox"/>
            <label> &nbsp; RMSSD (Sliding Window) </label> <br />
        </div>
        <hr />

        <span onClick={() => toggleCollapse(1)}> {isExpanded[1] ? "▼": "▶"}</span><b> RMSSD Calculation </b> <br />
        <div className='control-group' style={{display: isExpanded[1] ? "block": "none"}}>
            <label> &nbsp; Min RRIs used: </label> 
            <input onChange={(e) => setSettings({...settings, min_rrs: e.target.value})} type="number" value="5"/>
             <br /> <label> &nbsp; Max RRIs used: </label> 
            <input onChange={(e) => setSettings({...settings, max_rrs: e.target.value})} type="number" value="5"/>
             <br /> <label> &nbsp; RRI Artifact Removal Cap (ms): </label>
            <input onChange={(e) => setSettings({...settings, rr_diff_cap: e.target.value})} type="number" value="160"/>
        </div>
        <hr />

        <span onClick={() => toggleCollapse(2)}> {isExpanded[2] ? "▼": "▶"}</span><b> Recording Controls </b> <br />
        <div className='control-group' style={{display: isExpanded[2] ? "block": "none"}}>

          <button className="btn-record" onClick={() => setIsRecording(!isRecording)}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button> <br />
          <button onClick={clearSensorData}>Clear Recording</button> <br />
          
          <button onClick={triggerFileSelect}>Import Recording</button>
          {/* The actual input is hidden with CSS */}
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
          
          <button onClick={() => exportToCSVWithMetadata(intervalPlugin.current.intervals)}>Export Recording</button>
        </div>
        <hr />


        <span onClick={() => toggleCollapse(3)}> {isExpanded[3] ? "▼": "▶"}</span><b> Intervals </b> <br />
        <div className='control-group' style={{display: isExpanded[3] ? "block": "none"}}>
          <button onClick={addInterval}> Add Interval </button> <br />

          <label> Start Time: </label>
          <input type="number" step="0.1" value={startValue} onChange={(e) => setStartValue(e.target.value)} /> <br/>

          <label> End Time: </label>
          <input type="number" step="0.1" value={endValue} onChange={(e) => setEndValue(e.target.value)} /> <br/>

          <label> Interval Color: </label>
          <input type="color" value={colorValue} onChange={(e) => setColorValue(e.target.value)} /> <br/>

          <label> Interval Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} /> <br/>

          
          <hr />
          
          <button onClick={() => removeInterval("Interval1")}> Remove Interval </button>
          <select onChange={(e) =>setSelectedValue(e.target.value)}>
                  <option value="">-- Select an interval --</option>
                  {Object.keys(intervalPlugin.current.intervals).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
          </select>
        </div>

      </aside>

      <main className='dashboard'>
        <SensorConnector isRecording={isRecording} passData={handleSensorData}></SensorConnector>
        <LiveChart field='rri' heartDataRef={heartDataRef} show={settings.showRRI} intervalPlugin={intervalPlugin.current}></LiveChart>
        <LiveChart field='bpm' heartDataRef={heartDataRef} show={settings.showBPM} intervalPlugin={intervalPlugin.current}></LiveChart>
        <LiveChart field='rmssd' heartDataRef={heartDataRef} show={settings.showRMSSD} intervalPlugin={intervalPlugin.current}></LiveChart>
      </main>
    </div>
  )

}

export default App