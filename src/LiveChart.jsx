import React, { useMemo, useState, useEffect, useRef } from 'react';
import "./LiveChart.css"
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);



const LiveChart = ({ heartDataRef, field, show, intervalPlugin }) => {
  if (!show) return(<div></div>);
  const chartRef = useRef(null);

  const fieldData = {
    'units':{'rri':'Milliseconds', 'bpm':'BPM', 'rmssd': 'RMSSD'},
    'yRange':{'rri': [700, 900], 'bpm': [60, 120], 'rmssd': [0, 100]}
  }

  const [xRange1, setXRange1] = useState(0)
  const [xRange2, setXRange2] = useState(300)
  const [yRange1, setYRange1] = useState(fieldData['yRange'][field][0])
  const [yRange2, setYRange2] = useState(fieldData['yRange'][field][1])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Time(Seconds)' }, min:xRange1, max:xRange2, ticks: {callback: function(value) { return value; }}},
      y: { type: 'linear', title: { display: true, text: fieldData['units'][field]}, min: yRange1, max: yRange2, ticks: {callback: function(value) { return value; }}}
    }
  };

  const chartData = useMemo(() => ({
    datasets: [{
      label: field.toUpperCase(), // Now the label matches the field!
      data: [], 
      borderColor: field === 'rri' ? '#3498db' : '#e74c3c',
      tension: 0.3,
      pointRadius: 2,
    }]
  }), [field]); // Re-run only if the field prop changes

  useEffect(() => {
      const chart = chartRef.current;
      chart.data.datasets[0].data = heartDataRef.current.map(item => ({x: item.time, y: item[field]}));
      chart.update('none');
    }, [heartDataRef.current.length, field]);
  
    useEffect(() => {
      const chart = chartRef.current;
      chart.update('none')
    }, [Object.keys(intervalPlugin).length]);


  const setRange = (min, max, axis) => {
    const chart = chartRef.current;
    if (chart) {
      chart.options.scales[axis].min = min;
      chart.options.scales[axis].max = max;
      chart.update();
    }
  };

  return (
    <article className="chart-container">
      <div className="chart-header">
        <b>Live {field.toUpperCase()}: </b>
        <span className="live-value">
          {heartDataRef.current.length !=1 ? heartDataRef.current[heartDataRef.current.length - 1][field].toFixed(2) : " "}
        </span>
      </div>
      
      <div className="chart-controls">
        <div>
          <button onClick={()=> setRange(xRange1, xRange2, 'x')}>Apply X Range: </button>
          <input type="number" value={xRange1} onChange={(e) => setXRange1(e.target.value)} />
          <input type="number" value={xRange2} onChange={(e) => setXRange2(e.target.value)} />
          &nbsp;
          <button onClick={()=> setRange(yRange1, yRange2, 'y')}>Apply Y Range: </button>
          <input type="number" value={yRange1} onChange={(e) => setYRange1(e.target.value)} />
          <input type="number" value={yRange2} onChange={(e) => setYRange2(e.target.value)} />

        </div>
      </div>

      <div style={{ height: '30em' }}>
        <Line ref={chartRef} data={chartData} options={chartOptions} plugins={[intervalPlugin]} />
      </div>
    </article>  );
}
;

export default LiveChart;