import React from 'react';

const Sidebar = ({ settings, setSettings, recordingProps, annotationProps }) => {
  const [isExpanded, setIsExpanded] = React.useState([true, true, true, true]);

  const toggle = (i) => {
    const newExp = [...isExpanded];
    newExp[i] = !newExp[i];
    setIsExpanded(newExp);
  };

  return (
    <aside className="settings-panel">
      {/* Graph Settings */}
      <section>
        <b onClick={() => toggle(0)}>{isExpanded[0] ? "▼" : "▶"} Show Graph</b>
        {isExpanded[0] && (
          <div className='control-group'>
            {['showRRI', 'showBPM', 'showRMSSD'].map(field => (
              <label key={field}>
                <input 
                  type="checkbox" 
                  checked={settings[field]} 
                  onChange={(e) => setSettings({...settings, [field]: e.target.checked})}
                /> {field.replace('show', '')} <br/>
              </label>
            ))}
          </div>
        )}
      </section>
      <hr />

      {/* Recording Controls */}
      <section>
        <b onClick={() => toggle(2)}>{isExpanded[2] ? "▼" : "▶"} Recording</b>
        {isExpanded[2] && (
          <div className='control-group'>
            <button className="btn-record" onClick={recordingProps.toggle}>
              {recordingProps.isRecording ? 'Stop' : 'Start'} Recording
            </button>
            <button onClick={recordingProps.clear}>Clear</button>
            <button onClick={recordingProps.triggerImport}>Import</button>
            <button onClick={recordingProps.export}>Export</button>
          </div>
        )}
      </section>
    </aside>
  );
};

export default Sidebar;