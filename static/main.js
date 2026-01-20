const btnSearch = document.getElementById("btn-search");
const deviceSelect = document.getElementById("device-select");
const btnConnect = document.getElementById("btn-connect");
const btnDisconnect = document.getElementById("btn-disconnect")
const btnStart = document.getElementById("btn-start");
const btnPauseResume = document.getElementById("btn-pause-resume");
const btnEnd = document.getElementById("btn-end");
const btnExport = document.getElementById("btn-export")
const btnOpenSetting = document.getElementById("btn-open-setting")
const btnSaveSetting = document.getElementById("btn-save-setting")
const btnCloseSetting = document.getElementById("btn-close-setting")


const liveValue = document.getElementById("live-rmssd-value")
const chartContainer =  document.getElementById("rmssd-chart-container")
const scrollContainer = document.getElementById("rmssd-scroll-container")
const SettingsPage = document.getElementById("setting")


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
}

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
    rr_record.push(data) };


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

function computeRMSSD(data, min_rrs, max_rrs, rr_diff_cap){
// data: data of R-R Intervals in an array
    
}