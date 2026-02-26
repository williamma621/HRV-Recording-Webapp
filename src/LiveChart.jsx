import React, { useMemo, useState, useEffect, useRef } from 'react';
import "./LiveChart.css"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

const fieldData = {
  'units':{'rri':'Milliseconds', 'bpm':'BPM', 'rmssd': 'RMSSD'},
  'yRange':{'rri': [600, 1000], 'bpm': [60, 120], 'rmssd': [0, 100]},
  'color':{'rri': '#3498db', 'bpm': '#e74c3c', 'rmssd': '#68b141'}
}

const LiveChart = ({ Data, field, show, intervalPlugin }) => {
  if (!show) return(<div></div>);
  const chartRef = useRef(null);
  const [range, setRange] = useState({'x1':0, 'x2':300, 'y1':fieldData['yRange'][field][0], 'y2':fieldData['yRange'][field][1]})
  const chartOptions = {
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Time(Seconds)' }, min:range.x1, max:range.x2, ticks: {stepSize: 10, callback: function(value) { return value; }}},
      y: { type: 'linear', title: { display: true, text: fieldData['units'][field]}, min: range.y1, max: range.y2, ticks: {callback: function(value) { return value; }}}
    },
    borderColor: fieldData['color'][field],
    label: field.toUpperCase(), // Label Matches the field
    responsive: true,  // Make it as big as canvas
    maintainAspectRatio: false, // Allow for Free resize
    //Optimization Settings
    animation: false,      // High frequency updates can't afford animation overhead
    parsing: false,        // Skips the "is this a number?" checks (O(1) vs O(n))
    normalized: true,     // Enables Binary Search for the visible window
    spanGaps: false,      // Skips checks for null values
    pointRadius: 0,       // Don't Draw Circle
    tension: 0,           //Don't have round lines
  };

  const chartData = useMemo(() => ({datasets: [{data: []}]}), [field]); // Re-run only if the field prop changes

  useEffect(() => {
      const chart = chartRef.current;
      chart.data.datasets[0].data = Data;
      chart.update('none');
    }, [Data.length, field, show]);
  
    useEffect(() => {
      const chart = chartRef.current;
      chart.update('none')
    }, [Object.keys(intervalPlugin).length]);

  return (
    <article className="chart-container">
      <div className="chart-header">
        <b>Live {field.toUpperCase()}: </b>
        <span className="live-value">
          {Data.length !=1 ? Data.at(-1)['y'].toFixed(2) : " "}
        </span>
      </div>
      
      <div className="chart-controls">
        <div>
          <button> X Range: </button>
          <input type="number" value={range.x1} onChange={(e) => setRange({...range, 'x1':e.target.value})} />
          <input type="number" value={range.x2} onChange={(e) => setRange({...range, 'x2':e.target.value})} />
          <button> Y Range: </button>
          <input type="number" value={range.y1} onChange={(e) => setRange({...range, 'y1':e.target.value})} />
          <input type="number" value={range.y2} onChange={(e) => setRange({...range, 'y2':e.target.value})} />

        </div>
      </div>

      <div style={{ height: '35em' }}>
        <Line ref={chartRef} data={chartData} options={chartOptions} plugins={[intervalPlugin]} />
      </div>
    </article>  
  );
}
;

export default LiveChart;

{
  /* <button onClick={()=> setRange(xRange1, xRange2, 'x')}>Apply X Range: </button> */
}
