let CHART_MAX_POINTS = 600
const CHART_CONTAINER_WIDTH = chartContainer.clientWidth;




let chartData = {
  datasets: [{
    label: "RMSSD",
    data: [], // will be {x, y} objects
    borderWidth: 2,
    borderColor: '#3498db',
    tension: 0.3,
    pointRadius: 0
  }]
};

const chart = new Chart(document.getElementById("rmssd-chart"), {
    type: "line",
    data: chartData,
    options: { animation: false, responsive: false, maintainAspectRatio: false,
    scales: {
        x: { type: 'linear', min: 0, max: CHART_MAX_POINTS,
        ticks: { stepSize: 10 },
        title: { display: true, text: 'Time (seconds)' } },
        y: { min: 0, max: 100,
            title: { display: true, text: 'RMSSD (ms)' } }
    } //accidently put here plugins: [intervalPlugin]
}, plugins: [intervalPlugin]
});


// function tick(){
//     console.log(tick)
//     setTimeout({() => {
//         console.log('tock')
//         setTimeout(tick, 1000)
//     }},1000)
// }

// function updateGraph(){
//     if (appState.isRecording && !appState.isPaused){
//         updateGraphInterval = setInterval(function () {
//             const rmssd = rr_record.at(-1)['rmssd'];
//             if (rmssd) { 
//                 let num_points = chartData.datasets[0].data.length;
//                 chartData.datasets[0].data.push({x:num_points, y:rmssd});
//                 liveValue.innerText = Math.round(rmssd);

//                 if (num_points > chart.options.scales.x.max){
//                     chart.options.scales.x.max+=10;
//                     chartContainer.style.width = num_points * WIDTH_PER_POINT + 'px';
//                     chart.canvas.style.width = num_points * WIDTH_PER_POINT + 'px';
//                     chart.resize();
//                     scrollContainer.scrollLeft = scrollContainer.scrollWidth;
//                 }
//                 chart.update();
//             }
//         }, 1000)
//     }
//     else {
//         clearInterval(updateGraphInterval);
//     }
// }