const btnSearch = document.getElementById("btn-search");
const deviceSelect = document.getElementById("device-select");
const btnConnect = document.getElementById("btn-connect");
const btnDisconnect = document.getElementById("btn-disconnect")
const btnStart = document.getElementById("btn-start");
const btnPauseResume = document.getElementById("btn-pause-resume");
const btnEnd = document.getElementById("btn-end");
const btnExport = document.getElementById("btn-export");
const btnOpenSetting = document.getElementById("btn-open-setting");
const btnSaveSetting = document.getElementById("btn-save-setting");
const btnCloseSetting = document.getElementById("btn-close-setting");


const liveValue = document.getElementById("live-rmssd-value");
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



let rr_record = [{'beat':1, 'rr':-1, 'time':0, 'rmssd': -1}];
const ws = new WebSocket("ws://localhost:8000/ws");
ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    data['rmssd'] = computeRMSSD(rr_record, appSetting.minRRIForRMSSD, appSetting.maxRRIForRMSSD, appSetting.RRIRemovalCap)
    rr_record.push(data) };
