import React, { useState } from 'react';
import './GettingStarted.css';

const GettingStarted = () => {
  const [activeTab, setActiveTab] = useState('guide');

  return (
    <div className="docs-container">
      <div className="tab-group">
        <button 
          className={activeTab === 'guide' ? 'active' : ''} 
          onClick={() => setActiveTab('guide')}
        >
          Quick Start
        </button>
        <button 
          className={activeTab === 'tech' ? 'active' : ''} 
          onClick={() => setActiveTab('tech')}
        >
          Technical Specs
        </button>
      </div>

      <main className="docs-content">
        {activeTab === 'guide' ? (
          <section className="fade-in">
            <h2>Compatibility</h2>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Requirement / Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Best Performance</b></td>
                  <td><b>Polar H10 (Chest Strap) / Chrome / Windows 10, 11</b></td>
                </tr>
                <tr>
                  <td>Compatible Hardware</td>
                  <td>Polar H10/H9, Garmin HRM-Dual, Wahoo TICKR, Anything with Standard 0x180D BLE</td>
                </tr>
                <tr>
                  <td>Browser</td>
                  <td>Chrome, Edge, Opera (Web Bluetooth API Required)</td>
                </tr>
                <tr>
                  <td>OS Support</td>
                  <td>Windows 10+, Android, macOS. <span className="warning">iOS is not supported.</span></td>
                </tr>
              </tbody>
            </table>

            <h2>Connection</h2>
            <ol className="step-list">
              <li>
                <strong>Hardware Prep:</strong> Wear your heart rate strap. For devices like the <strong>Polar H10</strong>, the sensor only activates BLE signals once it detects skin contact.
              </li>
              <li>
                <strong>Connect:</strong> Click the large <span className="highlight-btn">Connect to Heart Rate Sensors</span> button. Select your device from the browser popup.
              </li>
              <li>
                <strong>Configure:</strong> Use the left panel to toggle graphs and set your RMSSD sliding window parameters.
              </li>
              <li>
                <strong>Adjust X, Y axis:</strong> Use the input boxes on  top of every graph to adjust the display range of x and y values. <br/> During recording, it's recommended to keep the x-range of all graphs within 1000 seconds, or the graph could lag. <br /> (e.g. 6000 ~ 7000 is fine, but avoid do 0 ~ 10000)
              </li>

              <li>
                <strong>Record:</strong> Click Start Recording on the left panel to start Recording.
              </li>

            </ol>

            <h2>Managing Intervals</h2>
            <p>
              Use the <strong>Annotations</strong> section to label specific activities (e.g., "Deep Breathing"). 
              If you need to update an interval, simply use the same <strong>Interval Name</strong> with new times or colors to overwrite the previous entry.
            </p>

            <h2>Exporting Your Data</h2>
            <p>
              Click <strong>Export Recording</strong> to download a <code>.csv</code> file. You can use the exported raw RRI, BPM, RMSSD data for further analysis in tools like Kubios, Excel, or analyze it with your own code in Python, R, etc.
            </p>

            <h2> Data Safety </h2>
            <p> Your data stays 100% local to your browser / computer; we never see or store any of your heart rate information.</p>

          </section>
        ) : (
          <section className="fade-in">
            <h2>Live HRV Calculation Logic</h2>
            <p>
              This application calculates <strong>RMSSD</strong> (Root Mean Square of Successive Differences) using a dynamic sliding window. 
              This allows for real-time physiological feedback without waiting for long recording intervals.
            </p>

            <div className="info-box">
              <h3>Sliding Window Parameters</h3>
              <ul className="spec-list">
                <li><strong>Max RMSSD Points:</strong> The maximum number of beats included in the look-back window.</li>
                <li><strong>Min RMSSD Points:</strong> The minimum beats required to calculate a valid value. If valid beats drop below this, the graph renders a blank point (NaN).</li>
                <li><strong>Artifact Rejection Cap:</strong> A manual threshold in milliseconds. If the difference between two consecutive RR intervals exceeds this value, the point is flagged as an artifact and excluded from the RMSSD calculation.</li>
              </ul>
            </div>

            <h2>Timekeeping & Accuracy</h2>
            <p>
              To maintain scientific integrity, the X-axis is calculated based on the <strong>Biological Time</strong> derived from the sensor data rather than the system clock.
            </p>
            
            <div className="formula-box">
              <p className="formula">Time = Σ (RR-Intervals received)</p>
            </div>

            <p>
              Each data point represents one BLE packet. Because time is calculated by summing the RRI values, the timeline is <strong>discrete</strong>. 
              While this may result in a minor drift from a standard stopwatch, it ensures that every heartbeat is mapped exactly to its physiological duration, providing the most accurate representation of HRV over time.
            </p>

            <h2>Metric Definitions</h2>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>RRI</strong></td>
                  <td>RR-Interval: The time between successive R-waves (heartbeats) in milliseconds.</td>
                </tr>
                <tr>
                  <td><strong>BPM</strong></td>
                  <td>Beats Per Minute value Calculated by the Sensor</td>
                </tr>
                <tr>
                  <td><strong>RMSSD</strong></td>
                  <td>The primary time-domain measure used to estimate vagally mediated changes reflected in HRV.</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default GettingStarted;