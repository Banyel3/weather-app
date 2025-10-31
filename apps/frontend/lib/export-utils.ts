/**
 * Export utilities for weather data
 * Supports JSON, XML, CSV, PDF, and Markdown formats
 */

import { WeatherRequest } from "./api-client";

/**
 * Export weather request as JSON
 */
export function exportAsJSON(request: WeatherRequest): void {
  const dataStr = JSON.stringify(request, null, 2);
  downloadFile(
    dataStr,
    `weather-data-${request.location_name}-${request.start_date}_${request.end_date}.json`,
    "application/json"
  );
}

/**
 * Export weather request as XML
 */
export function exportAsXML(request: WeatherRequest): void {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<WeatherRequest>
  <id>${request.id}</id>
  <location>
    <name>${escapeXml(request.location_name)}</name>
    <country>${escapeXml(request.country)}</country>
    <latitude>${request.latitude}</latitude>
    <longitude>${request.longitude}</longitude>
    <timezone>${escapeXml(request.timezone)}</timezone>
  </location>
  <dateRange>
    <startDate>${request.start_date}</startDate>
    <endDate>${request.end_date}</endDate>
  </dateRange>
  <notes>${escapeXml(request.notes || "")}</notes>
  <weatherData>
${request.weather_data
  .map(
    (day) => `    <day>
      <date>${day.date}</date>
      <temperatureMax>${day.temperature_max}</temperatureMax>
      <temperatureMin>${day.temperature_min}</temperatureMin>
      ${day.temperature_mean ? `<temperatureMean>${day.temperature_mean}</temperatureMean>` : ""}
      <feelsLikeMax>${day.feels_like_max}</feelsLikeMax>
      <feelsLikeMin>${day.feels_like_min}</feelsLikeMin>
      <precipitation>${day.precipitation}</precipitation>
      <rain>${day.rain}</rain>
      <weatherCode>${day.weather_code}</weatherCode>
      <weatherDescription>${escapeXml(day.weather_description)}</weatherDescription>
      <windSpeedMax>${day.wind_speed_max}</windSpeedMax>
      <windDirection>${day.wind_direction}</windDirection>
    </day>`
  )
  .join("\n")}
  </weatherData>
  <metadata>
    <createdAt>${request.created_at}</createdAt>
    <updatedAt>${request.updated_at}</updatedAt>
  </metadata>
</WeatherRequest>`;

  downloadFile(
    xml,
    `weather-data-${request.location_name}-${request.start_date}_${request.end_date}.xml`,
    "application/xml"
  );
}

/**
 * Export weather request as CSV
 */
export function exportAsCSV(request: WeatherRequest): void {
  const headers = [
    "Date",
    "Temperature Max (°C)",
    "Temperature Min (°C)",
    "Temperature Mean (°C)",
    "Feels Like Max (°C)",
    "Feels Like Min (°C)",
    "Precipitation (mm)",
    "Rain (mm)",
    "Weather Code",
    "Weather Description",
    "Wind Speed Max (km/h)",
    "Wind Direction (°)",
  ];

  const rows = request.weather_data.map((day) => [
    day.date,
    day.temperature_max,
    day.temperature_min,
    day.temperature_mean || "",
    day.feels_like_max,
    day.feels_like_min,
    day.precipitation,
    day.rain,
    day.weather_code,
    `"${day.weather_description}"`,
    day.wind_speed_max,
    day.wind_direction,
  ]);

  // Add metadata header
  const metadata = [
    `# Weather Data for ${request.location_name}, ${request.country}`,
    `# Date Range: ${request.start_date} to ${request.end_date}`,
    `# Location: ${request.latitude}, ${request.longitude}`,
    `# Timezone: ${request.timezone}`,
    request.notes ? `# Notes: ${request.notes}` : "",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const csv =
    metadata +
    headers.join(",") +
    "\n" +
    rows.map((row) => row.join(",")).join("\n");

  downloadFile(
    csv,
    `weather-data-${request.location_name}-${request.start_date}_${request.end_date}.csv`,
    "text/csv"
  );
}

/**
 * Export weather request as Markdown
 */
export function exportAsMarkdown(request: WeatherRequest): void {
  const markdown = `# Weather Data Report

## Location Information
- **Location:** ${request.location_name}, ${request.country}
- **Coordinates:** ${request.latitude}, ${request.longitude}
- **Timezone:** ${request.timezone}

## Date Range
- **Start Date:** ${request.start_date}
- **End Date:** ${request.end_date}
- **Duration:** ${request.weather_data.length} days

${request.notes ? `## Notes\n${request.notes}\n` : ""}
## Weather Data

| Date | Temp Max | Temp Min | Temp Mean | Feels Like Max | Feels Like Min | Precipitation | Rain | Weather | Wind Speed | Wind Dir |
|------|----------|----------|-----------|----------------|----------------|---------------|------|---------|------------|----------|
${request.weather_data
  .map(
    (day) =>
      `| ${day.date} | ${day.temperature_max}°C | ${day.temperature_min}°C | ${day.temperature_mean ? day.temperature_mean + "°C" : "N/A"} | ${day.feels_like_max}°C | ${day.feels_like_min}°C | ${day.precipitation}mm | ${day.rain}mm | ${day.weather_description} | ${day.wind_speed_max}km/h | ${day.wind_direction}° |`
  )
  .join("\n")}

## Statistics

- **Average Max Temperature:** ${(
    request.weather_data.reduce((sum, d) => sum + d.temperature_max, 0) /
    request.weather_data.length
  ).toFixed(1)}°C
- **Average Min Temperature:** ${(
    request.weather_data.reduce((sum, d) => sum + d.temperature_min, 0) /
    request.weather_data.length
  ).toFixed(1)}°C
- **Total Precipitation:** ${request.weather_data.reduce((sum, d) => sum + d.precipitation, 0).toFixed(1)}mm
- **Total Rain:** ${request.weather_data.reduce((sum, d) => sum + d.rain, 0).toFixed(1)}mm
- **Average Wind Speed:** ${(
    request.weather_data.reduce((sum, d) => sum + d.wind_speed_max, 0) /
    request.weather_data.length
  ).toFixed(1)}km/h

---
*Generated on ${new Date().toLocaleString()}*
*Request ID: ${request.id}*
`;

  downloadFile(
    markdown,
    `weather-data-${request.location_name}-${request.start_date}_${request.end_date}.md`,
    "text/markdown"
  );
}

/**
 * Export weather request as PDF (using HTML to PDF conversion)
 */
export function exportAsPDF(request: WeatherRequest): void {
  // Create HTML content for PDF
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Weather Data Report - ${request.location_name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 10px;
      margin: 20px 0;
    }
    .info-label {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #2563eb;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .stats {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Weather Data Report</h1>
  
  <h2>Location Information</h2>
  <div class="info-grid">
    <div class="info-label">Location:</div>
    <div>${request.location_name}, ${request.country}</div>
    <div class="info-label">Coordinates:</div>
    <div>${request.latitude}, ${request.longitude}</div>
    <div class="info-label">Timezone:</div>
    <div>${request.timezone}</div>
  </div>
  
  <h2>Date Range</h2>
  <div class="info-grid">
    <div class="info-label">Start Date:</div>
    <div>${request.start_date}</div>
    <div class="info-label">End Date:</div>
    <div>${request.end_date}</div>
    <div class="info-label">Duration:</div>
    <div>${request.weather_data.length} days</div>
  </div>
  
  ${request.notes ? `<h2>Notes</h2><p>${request.notes}</p>` : ""}
  
  <h2>Weather Data</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Temp Max</th>
        <th>Temp Min</th>
        <th>Temp Mean</th>
        <th>Precipitation</th>
        <th>Rain</th>
        <th>Weather</th>
        <th>Wind Speed</th>
      </tr>
    </thead>
    <tbody>
      ${request.weather_data
        .map(
          (day) => `
        <tr>
          <td>${day.date}</td>
          <td>${day.temperature_max}°C</td>
          <td>${day.temperature_min}°C</td>
          <td>${day.temperature_mean ? day.temperature_mean + "°C" : "N/A"}</td>
          <td>${day.precipitation}mm</td>
          <td>${day.rain}mm</td>
          <td>${day.weather_description}</td>
          <td>${day.wind_speed_max}km/h</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  
  <div class="stats">
    <h2>Statistics</h2>
    <div class="info-grid">
      <div class="info-label">Avg Max Temp:</div>
      <div>${(request.weather_data.reduce((sum, d) => sum + d.temperature_max, 0) / request.weather_data.length).toFixed(1)}°C</div>
      <div class="info-label">Avg Min Temp:</div>
      <div>${(request.weather_data.reduce((sum, d) => sum + d.temperature_min, 0) / request.weather_data.length).toFixed(1)}°C</div>
      <div class="info-label">Total Precipitation:</div>
      <div>${request.weather_data.reduce((sum, d) => sum + d.precipitation, 0).toFixed(1)}mm</div>
      <div class="info-label">Total Rain:</div>
      <div>${request.weather_data.reduce((sum, d) => sum + d.rain, 0).toFixed(1)}mm</div>
      <div class="info-label">Avg Wind Speed:</div>
      <div>${(request.weather_data.reduce((sum, d) => sum + d.wind_speed_max, 0) / request.weather_data.length).toFixed(1)}km/h</div>
    </div>
  </div>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Request ID: ${request.id}</p>
  </div>
</body>
</html>`;

  // For browser-based PDF generation, we'll open the HTML in a new window for printing
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Helper function to escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Helper function to download a file
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
