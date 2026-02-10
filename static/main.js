const liveRMSSDValue = document.getElementById("live-rmssd-value");
const liveTime = document.getElementById("live-time");

const chartContainer =  document.getElementById("rmssd-chart-container");
const scrollContainer = document.getElementById("rmssd-scroll-container");
const SettingsPage = document.getElementById("setting");


let appState = {
    isSearched: false,
    isConnected: false,
    isRecording: false,
    isPaused: false,
    deviceAddress: null,
};
let appSetting = {
    displayRMSSD: true,
    displayRawRRI: false,
    displayECG: false,
    minRRIForRMSSD: 5,
    maxRRIForRMSSD: 5,
    RRIRemovalCap: 163,
};

function updateUI() {
    btnSearch.disabled = appState.isConnected;
    deviceSelect.disabled = appState.isConnected || deviceSelect.options.length <= 1;
    btnConnect.disabled = appState.isConnected || !appState.isSearched;
    btnDisconnect.disabled = !appState.isConnected;
    btnStart.disabled = !appState.isConnected || appState.isRecording;
    btnPauseResume.disabled = !appState.isRecording;
    btnEnd.disabled = !appState.isRecording;
}

function startRecording(){
    rr_record = [{'beat':1, 'rr':-1, 'time':0, 'rmssd': -1}];
    chartData.datasets[0].data = []
    chartContainer.style.width = CHART_CONTAINER_WIDTH + 'px';
    chart.canvas.style.width = CHART_CONTAINER_WIDTH + 'px';
    chart.resize();
    chart.update();
}



let rr_record = [{'beat':1, 'rr':-1, 'time':0, 'rmssd': -1}];
const ws = new WebSocket("ws://localhost:8000/ws");
ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    data['rmssd'] = computeRMSSD(
        rr_record, 
        appSetting.minRRIForRMSSD, 
        appSetting.maxRRIForRMSSD, 
        appSetting.RRIRemovalCap
    )
    rr_record.push(data)
    update();
};


function getRMSSDSeries(records) {
  return records.map(r => ({ x: r.time, y: r.rmssd }));
}






document.getElementById("btn-import").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", handleFile);



// let draftInterval = {
//   start: null,
//   end: null,
//   color: null,
//   live: {
//     start: false,
//     end: false
//   }
// }


// function getLiveTime() {
//   return rr_record.at(-1)['time']
// }


// function startNewInterval() {
//   const t = getLiveTime();

//   draftInterval = {
//     start: t,
//     end: t,
//     color: 'rgba(224, 255, 99, 0.15)',
//     live: { start: true, end: true }
//   };
// }
