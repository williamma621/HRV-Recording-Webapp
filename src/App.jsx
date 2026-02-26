import { useState } from 'react'
import { useRef } from 'react'
import SensorConnector from './SensorConnector'
import LiveChart from './LiveChart'
import "./App.css"
import "./header.css"
import { computeRMSSD, exportCSV, parseImportedCSV } from './helper_functions/dataHelpers';
import GettingStarted from './GettingStarted'
import Resources from './Resources'

function App() {
  const initHeartDataRef = {'export':[{'beat':0, 'bpm':NaN, 'rri':NaN, 'time': 0, 'rmssd':NaN}],
      'bpm': [{'x': 0, 'y': 'NaN'}],
      'rri': [{'x':0, 'y': 'NaN'}],
      'rmssd':[{'x':0, 'y': 'NaN'}] 
    }

  const heartDataRef = useRef(initHeartDataRef);
  const sensorTime = useRef(0)
  const [,setTick] = useState(0.0);
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState({'showRRI': false, 'showBPM': false, 'showRMSSD': false, 'min_rrs': 3, 'max_rrs': 7, 'rr_diff_cap': 160})
  const [isExpanded, setIsExpanded] = useState([true, true, true, true])
  const fileInputRef = useRef(null);
  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(0);
  const [colorValue, setColorValue] = useState('#e0db41'); // Default color
  const [name, setName] = useState("interval1"); // Default color
  const [selectedValue, setSelectedValue] = useState("");
  const [currentPage, setCurrentPage] = useState('recorder');


  const handleSensorData = (sensorData) => {
    sensorTime.current += sensorData.rri / 1000;

    sensorData.time = sensorTime.current
    sensorData.beat = heartDataRef.current.export.length
    sensorData.rmssd = computeRMSSD(heartDataRef.current.export, settings['min_rrs'], settings['max_rrs'], settings['rr_diff_cap'])
    heartDataRef.current.export.push(sensorData);

    heartDataRef.current.bpm.push({'x': sensorData.time, 'y': sensorData.bpm})
    heartDataRef.current.rri.push({'x': sensorData.time, 'y': sensorData.rri})
    heartDataRef.current.rmssd.push({'x': sensorData.time, 'y': sensorData.rmssd})

    setTick(tick => tick+1);
  }
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const { metadata, data } = parseImportedCSV(e.target.result);
      
      // Update Annotations
      intervalPlugin.current.intervals = metadata;
      
      // Update Heart Data Ref
      heartDataRef.current = {
        export: data,
        bpm: data.map(d => ({ x: d.time, y: d.bpm })),
        rri: data.map(d => ({ x: d.time, y: d.rri })),
        rmssd: data.map(d => ({ x: d.time, y: d.rmssd }))
      };

      sensorTime.current = heartDataRef.current.export.at(-1).time
      
      setTick(t => t + 1);
    };
    reader.readAsText(file);
  };


  const triggerFileSelect = () => {
    fileInputRef.current.click(); // This simulates the click on the hidden input
  };
  const clearSensorData = () => {
    if (confirm("This will clear your recorded data in this session. Are you sure you want to proceed")){
      heartDataRef.current = initHeartDataRef;
      setTick(tick => tick+1);
    }
  }




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
      // setColorValue()
      setTick(tick => tick + 1);
  };

  const removeInterval = () => {
    delete intervalPlugin.current.intervals[selectedValue]
    setTick(tick => tick+1);
  }

  if (confirm("Disclaimer: This tool is not a medical device and should not be used to diagnose or treat any medical condition")) return (
    <div className='app-container'>
        <header>
            <h1>HRV Recording Webapp</h1>
            <nav>
              <button onClick={() => setCurrentPage('recorder')}
                className={currentPage === 'recorder' ? 'active' : ''}>
                Home
              </button>

              <button onClick={() => setCurrentPage('getting_started')}
                className={currentPage === 'getting_started' ? 'active' : ''}>
                User Guide
              </button>

              <button onClick={() => setCurrentPage('support')}
                className={currentPage === 'support' ? 'active' : ''}>
                About
              </button>
            </nav>
        </header>

        <div className='page-1-wrapper' style={{display: currentPage === "recorder" ? "grid": "none"}}>
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
                <input onChange={(e) => setSettings({...settings, min_rrs: e.target.value})} type="number" value={settings['min_rrs']}/>
                <br /> <label> &nbsp; Max RRIs used: </label> 
                <input onChange={(e) => setSettings({...settings, max_rrs: e.target.value})} type="number" value={settings['max_rrs']}/>
                <br /> <label> &nbsp; RRI Artifact Removal Cap (ms): </label>
                <input onChange={(e) => setSettings({...settings, rr_diff_cap: e.target.value})} type="number" value={settings['rr_diff_cap']}/>
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
              
              <button onClick={() => exportCSV(heartDataRef.current.export, intervalPlugin.current.intervals)}>Export Recording</button>
            </div>
            <hr />


            <span onClick={() => toggleCollapse(3)}> {isExpanded[3] ? "▼": "▶"}</span><b> Annotations </b> <br />
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
            <SensorConnector isRecording={isRecording} passData={handleSensorData} sensorTime={sensorTime} />
            <b> Sensor Time: {sensorTime.current.toFixed(2)} </b>

            {['rri', 'bpm', 'rmssd'].map(type => (
              <LiveChart key={type} field={type} Data={heartDataRef.current[type]} show={settings[`show${type.toUpperCase()}`]} intervalPlugin={intervalPlugin.current} />
            ))}
          </main>   
        </div>
      
        <div style={{display: currentPage === "getting_started" ? "block": "none"}}>
            <GettingStarted></GettingStarted>
        </div>

        <div style={{display: currentPage === "support" ? "block": "none"}}>
            <Resources></Resources>
        </div>

      </div>
  )

}

export default App