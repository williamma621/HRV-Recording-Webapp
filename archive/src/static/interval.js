let draftInterval = null;
// const INTERVAL_COLORS = [
//   '#eb2d2d', // soft red
//   '#CC5600',  // orange
//   '#DCE775',  // lime
//   '#81C784', // green
//   '#4DB6AC', // teal
//   '#64B5F6', // blue
//   '#BA68C8', // purple
// ];

const INTERVAL_COLORS = [
  '#eb2d2d', //red
  '#cfe134',  //yellow
  '#e8ebb5', //white
  '#000000', //black
  '#43a950', //green
];

const INTERVAL_ALPHA = 0.15;
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


function getNextIntervalColor() {
  const index = intervalPlugin.intervals.length % INTERVAL_COLORS.length;
  return {'hex': INTERVAL_COLORS[index], 'rgba': hexToRgba(INTERVAL_COLORS[index], INTERVAL_ALPHA)};
}



document.getElementById('newIntervalBtn').onclick = () => {
  const t = getLiveTime();
  const color = getNextIntervalColor()
  draftInterval = {
    start: t,
    end: t,
    color: color.rgba,
    live: { start: true, end: true }
  };

  document.getElementById('intervalEditor').classList.remove('hidden');
  document.getElementById('intervalStart').value = t.toFixed(1);
  document.getElementById('intervalEnd').value = t.toFixed(1);
  document.getElementById('intervalColor').value = color.hex;

  chart.update();
};



function updateDraftInterval() {
  if (!draftInterval) return;

  const t = getLiveTime();

//   if (draftInterval.live.start) {
//     draftInterval.start = t;
//     document.getElementById('intervalStart').value = t.toFixed(1);
//   }

  if (draftInterval.live.end) {
    draftInterval.end = t;
    document.getElementById('intervalEnd').value = t.toFixed(1);
  }

  chart.update('none');
}



document.getElementById('intervalStart').oninput = (e) => {
  if (!draftInterval) return;
  draftInterval.start = parseFloat(e.target.value);
  draftInterval.live.start = false;
  chart.update();
};



document.getElementById('intervalEnd').oninput = (e) => {
  if (!draftInterval) return;
  draftInterval.end = parseFloat(e.target.value);
  draftInterval.live.end = false;
  chart.update();
};



document.getElementById('intervalColor').oninput = (e) => {
  if (!draftInterval) return;
  draftInterval.color = hexToRgba(e.target.value, 0.15);
  chart.update();
};



document.getElementById('saveIntervalBtn').onclick = () => {
  if (!draftInterval) return;

  intervalPlugin.intervals.push({
    start: draftInterval.start,
    end: draftInterval.end,
    color: draftInterval.color
  });

  draftInterval = null;
  document.getElementById('intervalEditor').classList.add('hidden');
  chart.update();
};



document.getElementById('cancelIntervalBtn').onclick = () => {
  draftInterval = null;
  document.getElementById('intervalEditor').classList.add('hidden');
  chart.update();
};




// Absolutely — here’s a **clean, compact summary** you can copy-paste next time to restore context 👇
// (I’ll write it as a “prompt to ChatGPT” style.)

// ---

// ### Interval Labels & Coloring – Project Summary

// I’m working on a **web-based chart that supports time intervals** (e.g. labeled regions on a timeline).
// Here’s what we’ve implemented so far:

// **Core interval structure**

// * Each interval is an object with:

//   ```js
//   {
//     start: number,        // time in seconds
//     end: number,
//     color: string,        // rgba(...) for chart shading
//     label: string,        // human-readable name
//     live: { start: boolean, end: boolean }
//   }
//   ```
// * Intervals can be *live* (start or end follows current time) or fixed.

// **Interval creation**

// * Clicking `newIntervalBtn` creates a draft interval at the current live time.
// * Start and end are initialized to the same value.
// * An interval editor UI is shown, allowing:

//   * Editing start/end times
//   * Choosing a color
//   * Entering a label

// **Automatic color assignment**

// * We use a predefined palette of **10 visually distinct colors**.
// * Colors are assigned **in order**, cycling when more than 10 intervals exist.
// * Each color has:

//   * A hex value for UI inputs
//   * A matching semi-transparent RGBA value for chart rendering
// * A `colorIndex` (or interval count) determines which color is used next.

// **Rendering**

// * Intervals are rendered as shaded regions on the chart using their RGBA color.
// * Labels are associated with intervals (not just visual color blocks).

// **Tech stack**

// * Plain **HTML / CSS / JavaScript** (no Bootstrap required, though discussed).
// * Chart updates are triggered via `chart.update()`.

// **Design goals**

// * Simple, readable UI
// * Clear visual distinction between intervals
// * Minimal dependencies
// * Easy to extend later (e.g. interval lists, hover tooltips, exports)

// ---

// If you want, next time I can also:

// * Turn this into a **single source-of-truth spec**
// * Convert it into **TypeScript interfaces**
// * Add **undo/redo**, **interval snapping**, or **keyboard shortcuts**

// Just say the word 😄