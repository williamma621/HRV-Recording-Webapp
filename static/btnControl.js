btnSearch.onclick = async () => {
    btnSearch.disabled = true;
    btnSearch.innerText = "Scanning...";
    incrementProgressBar(3, document.getElementById("search-progress"))

    const response = await fetch("/api/devices");
    const devices = await response.json();
    
    fillOptions(deviceSelect, devices)
    btnSearch.innerText = "Search Again";
    appState.isSearched = true;
    updateUI()
};

btnDisconnect.onclick = async () => {
    btnDisconnect.disabled = true;
    btnDisconnect.innerText = "Disconnecting...";
    const response = await fetch(`/api/disconnect`, { method: 'POST' });
    if (response.ok) { 
        btnDisconnect.innerText = "Disconnected";
        btnConnect.innerText = "Connect"
        appState.isConnected = false;
    }
    updateUI();

}
btnConnect.onclick = async () => {
    const address = deviceSelect.value;
    btnConnect.disabled = true;
    btnConnect.innerText = "Connecting...";

    const response = await fetch(`/api/connect/${address}`, { method: 'POST' });
    if (response.ok) { 
        btnConnect.innerText = "Connected";
        btnDisconnect.innerText = "Disconnect"
        appState.isConnected = true; }
    else { alert("Failed to connect: " + await response.text()); }
    updateUI()
}


btnStart.onclick = async () => {
    const response = await fetch("/api/record/start", { method: 'POST' });
    if (response.ok) {appState.isRecording = true;}
    startRecording();
    updateUI();
    updateGraph();
}


btnPauseResume.onclick = async () => {
    const response = await fetch("/api/record/pause-resume", { method: 'POST' });
    const result = await response.json()
    if (result.status == "paused"){ appState.isPaused = true;}
    if (result.status == "resumed"){ appState.isPaused = false;}
    btnPauseResume.innerText = appState.isPaused ? 'Resume' : 'Pause';
    updateUI();
    updateGraph();
}


btnEnd.onclick = async () => {
    const response = await fetch("/api/record/end", { method: 'POST' });
    if (response.ok){ 
        appState.isRecording = false; 
        appState.isPaused = false; 
        btnStart.innerText = "Restart Recording";
        liveValue.innerText = "--";
    }
    
    updateUI();
    updateGraph();
}


btnExport.onclick = () => {export_csv(rr_record);}


btnOpenSetting.onclick = () => {
    const SettingsPage = document.getElementById("setting")
    SettingsPage.style.display = "block";
    SettingsPage.style.visibility = "visible";
}


btnSaveSetting.onclick = () => {
    appSetting = {
        displayRMSSD: document.getElementById('setting-display-rmssd').checked,
        displayRawRRI: document.getElementById('setting-display-raw-rri').checked,
        // displayECG: document.getElementById('setting-display-ecg').checked,
        minRRIForRMSSD: parseInt(document.getElementById('setting-min-rri-rmssd').value),
        maxRRIForRMSSD: parseInt(document.getElementById('setting-max-rri-rmssd').value),
        RRIRemovalCap: parseInt(document.getElementById('setting-rri-artifact-removal-cap').value),
    };
}


btnCloseSetting.onclick = () => {
    SettingsPage.style.display = "none";
    SettingsPage.style.visibility = "hidden";
}
