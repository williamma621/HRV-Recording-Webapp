import Papa from 'papaparse';

/**
 * Computes RMSSD (Root Mean Square of Successive Differences)
 * formula: sqrt( (1/n) * sum( (RR_i - RR_{i-1})^2 ) )
 */
export const computeRMSSD = (data,  min_rrs, max_rrs, rr_diff_cap ) => {
  const n = data.length;
  if (n < parseInt(min_rrs) + 1) return NaN;

  // Use the last N intervals as a sliding window
  const windowSize = parseInt(max_rrs);
  const usedData = n > windowSize ? data.slice(-windowSize) : data.slice(1);

  let sumSqDiff = 0;
  let count = 0;

  for (let i = 1; i < usedData.length; i++) {
    const diff = usedData[i].rri - usedData[i - 1].rri;
    // Artifact rejection: skip if the jump between beats is too high
    if (Math.abs(diff) > parseInt(rr_diff_cap)){console.log("skipped"); continue;}

    sumSqDiff += diff * diff;
    count++;
  }

  return count < min_rrs ? NaN : Math.sqrt(sumSqDiff / count);
};

/**
 * Handles CSV Formatting and Download
 */
export const exportCSV = (heartData, intervals, sessionId = 'session') => {
  console.log(heartData)

  // Convert intervals (metadata) to YAML-style comments
  const metadataHeader = `#---\n${Object.entries(intervals)
    .map(([key, val]) => `#${key}: ${JSON.stringify(val)}`)
    .join('\n')}\n#---\n`;

  const csv = Papa.unparse(heartData, { header: true });
  const blob = new Blob([metadataHeader + csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `heart_data_${sessionId}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Parses the custom CSV format back into usable JS objects
 */
export const parseImportedCSV = (content) => {
  const lines = content.split('\n');
  let metadata = {};
  let dataStartLine = 0;

  if (lines[0].startsWith('#---')) {
    let i = 1;
    while (i < lines.length && !lines[i].startsWith('#---')) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(1, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        try { metadata[key] = JSON.parse(value); } catch { metadata[key] = value; }
      }
      i++;
    }
    dataStartLine = i + 1;
  }

  const csvContent = lines.slice(dataStartLine).join('\n');
  const result = Papa.parse(csvContent, { header: true, dynamicTyping: true, skipEmptyLines: true });

  return { metadata, data: result.data };
};