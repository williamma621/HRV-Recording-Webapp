// --- Import File Core Logic ---
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = parseRRCSV(reader.result);
      rr_record = parsed;
      console.log("rr_record updated");
      syncRMSSDChart(rr_record)
    } catch (err) {
      alert(err.message);
    }
  };

  reader.readAsText(file);
}
// --- CSV parsing & validation ---
function parseRRCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("CSV file is empty or invalid.");
  }

  const header = lines[0].split(",");
  const expectedHeader = ["beat", "rr", "time", "rmssd"];

  if (!isValidHeader(header, expectedHeader)) {
    throw new Error("Invalid file format. Header must be: beat,rr,time,rmssd");
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(",");
    if (values.length !== 4) {
      throw new Error(`Invalid row at line ${index + 2}`);
    }

    return {
      beat: Number(values[0]),
      rr: Number(values[1]),
      time: Number(values[2]),
      rmssd: Number(values[3]),
    };
  });
}
function isValidHeader(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((h, i) => h.trim() === expected[i])
  );
}


//Export CSV
function export_csv(data){
    export_data = [['beat', 'rr', 'time', 'rmssd']]
    for (const i of data){ export_data.push(Object.values(i)); } // Turn List[Dictionary] to List[List]

    let csvContent = "data:text/csv;charset=utf-8,";
    export_data.forEach(function(rowArray) { //Turn List[List] to CSV
        let row = rowArray.join(",");
        csvContent += row + "\r\n"; });
    
    var encodedUri = encodeURI(csvContent); //Encode
    window.open(encodedUri); //Export
}



//Compute RMSSD helper
function computeRMSSD(data, min_rrs, max_rrs, rr_diff_cap) {
    // data: array of RR intervals (ms)
    // returns RMSSD or -1 if insufficient data

    const n = data.length;

    // Not enough RR intervals
    if (n < min_rrs + 1) {
        return -1;
    }

    // Select last (max_rrs) RR intervals to use
    const usedData = n > max_rrs ? data.slice(n - max_rrs) : data.slice(1);

    let sumSqDiff = 0;
    let count = 0;

    for (let i = 1; i < usedData.length; i++) {
        const diff = usedData[i]['rr'] - usedData[i - 1]['rr'];
        // Delta-based RR rejection
        // if (Math.abs(diff) > rr_diff_cap) {
        //     continue;
        // }
        sumSqDiff += diff * diff;
        count++;
    }

    if (count == 0) { return -1; }
    return Math.sqrt(sumSqDiff / count) * 1000;
}



//Annotate Graph
// intervalPlugin.intervals.push = {start: 50, end: 100, color: 'rgba(224, 255, 99, 0.15)'}
const intervalPlugin = {
  id: 'intervalBackground',
  intervals: [],
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const xScale = scales.x;
    const yScale = scales.y;

    this.intervals.forEach(({ start, end, color }) => {
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
};



function syncRMSSDChart() {
  chartData.datasets[0].data = getRMSSDSeries(rr_record);
  const last = rr_record.at(-1);
  //update chart container size
  if (last.time > chart.options.scales.x.max){
    let newChartMax = Math.round(last.time) + 10
    chart.options.scales.x.max = newChartMax;
    chartContainer.style.width = newChartMax * WIDTH_PER_POINT + 'px';
    chart.canvas.style.width = newChartMax * WIDTH_PER_POINT + 'px';
    chart.resize();
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
  }
  chart.update("none"); // or "quiet" depending on your setup

}
function update(){
  syncRMSSDChart()
  const last = rr_record.at(-1);
  liveTime.innerText = Math.round(last.time)
  liveRMSSDValue.innerText = Math.round(last.rmssd);

}