/**
 * app.js - Building Energy Performance Rating Compliance Extractor & Dashboard
 */

// =============================================================================
// Constants & Unit Conversion Factors
// =============================================================================
const CONVERSIONS = {
  KWH_TO_KBTU: 3.412142,
  THERM_TO_KBTU: 100.0,
  THERM_TO_KWH: 29.3071,
  KWH_TO_THERM: 1.0 / 29.3071,
};

// O'Brien360 Official Brand Palette
const SCENARIO_COLORS = {
  ap:             '#8CBD3A', // Pantone 368 C  - Signature O'Brien Green (Proposed Design)
  'baseline avg': '#4D76AD', // Pantone 7685 C - Slate Blue (Baseline Average)
  ab_avg:         '#4D76AD',
  ab1:            '#507281', // Pantone 2222 C - Marine Slate (Baseline 1)
  ab2:            '#62B8A4', // Pantone 3258 C - Teal (Baseline 2)
  ab3:            '#793E6D', // Pantone 2613 C - Aubergine (Baseline 3)
  ab4:            '#007AC9', // Pantone 2144 C - Title & Hyperlink Blue (Baseline 4)
};

const CHART_COLORS = [
  '#8CBD3A', // Pantone 368 C - Green
  '#4D76AD', // Pantone 7685 C - Slate Blue
  '#62B8A4', // Pantone 3258 C - Teal
  '#793E6D', // Pantone 2613 C - Aubergine
  '#507281', // Pantone 2222 C - Marine Slate
  '#007AC9', // Pantone 2144 C - Title & Hyperlink Blue
  '#66A154', // Pantone 7489 C - Sage Green
  '#483662', // Pantone 2118 C - Deep Purple
  '#E67E22', // Warm Amber (Gas Accent)
  '#C0392B', // Warm Crimson
  '#27AE60', // Emerald
  '#8E44AD', // Purple
  '#16A085', // Sea Green
  '#D35400', // Rust Orange
];

// =============================================================================
// Fixed Category Definitions
// All rows that ever appear in EAp2-4/5 CBECC-Com tables.
// electricityOnly: true means Gas columns show dash
// gasOnly: true means Electricity columns show dash
// =============================================================================
const FIXED_CATEGORIES = [
  { raw: 'Heating -- General',                        label: 'Heating',              electricityOnly: false, gasOnly: false },
  { raw: 'Cooling -- General',                        label: 'Cooling',              electricityOnly: true,  gasOnly: false },
  { raw: 'Interior Lighting -- ComplianceLtg',        label: 'Interior Lighting',    electricityOnly: true,  gasOnly: false },
  { raw: 'Exterior Lighting -- Not Subdivided',       label: 'Exterior Lighting',    electricityOnly: true,  gasOnly: false },
  { raw: 'Interior Equipment -- Receptacle',          label: 'Receptacle',           electricityOnly: true,  gasOnly: false },
  { raw: 'Interior Equipment -- Internal Transport',  label: 'Elevators/Escalators', electricityOnly: true,  gasOnly: false },
  { raw: 'Exterior Equipment -- Not Subdivided',      label: 'Exterior Equipment',   electricityOnly: true,  gasOnly: false },
  { raw: 'Fans -- Interior Fans',                     label: 'Fans',                 electricityOnly: true,  gasOnly: false },
  { raw: 'Pumps -- General',                          label: 'Pumps',                electricityOnly: true,  gasOnly: false },
  { raw: 'Heat Rejection -- Not Subdivided',          label: 'Heat Rejection',       electricityOnly: true,  gasOnly: false },
  { raw: 'Humidification -- Not Subdivided',          label: 'Humidification',       electricityOnly: false, gasOnly: false },
  { raw: 'Heat Recovery -- Not Subdivided',           label: 'Heat Recovery',        electricityOnly: true,  gasOnly: false },
  { raw: 'Water Systems -- General',                  label: 'Water Systems (SHW)',  electricityOnly: false, gasOnly: false },
  { raw: 'Refrigeration -- Not Subdivided',           label: 'Refrigeration',        electricityOnly: true,  gasOnly: false },
  { raw: 'Generators -- General',                     label: 'Generators',           electricityOnly: false, gasOnly: false },
];

// 26 electricity categories in exact sequence from user template
const CSV_ELECS = [
  'Heating -- General',
  'Heating -- Boiler Parasitic',
  'Cooling -- General',
  'Interior Lighting -- ComplianceLtg',
  'Exterior Lighting -- General',
  'Exterior Lighting -- Not Subdivided',
  'Interior Equipment -- Receptacle',
  'Interior Equipment -- Refrig',
  'Interior Equipment -- Process',
  'Interior Equipment -- Internal Transport',
  'Exterior Equipment -- Not Subdivided',
  'Fans -- General',
  'Fans -- ProcessMotors',
  'Fans -- Parking Garage',
  'Fans -- Interior Fans',
  'Pumps -- General',
  'Heat Rejection -- Not Subdivided',
  'Heat Rejection -- General',
  'Humidification -- Not Subdivided',
  'Heat Recovery -- General',
  'Heat Recovery -- Not Subdivided',
  'Water Systems -- General',
  'Water Systems -- Water Heater Parasitic',
  'Water Systems -- Other',
  'Refrigeration -- Not Subdivided',
  'Generators -- General',
];

// 6 natural gas categories in exact sequence from user template
const CSV_GASES = [
  'Heating -- General',
  'Interior Equipment -- Receptacle',
  'Interior Equipment -- Process',
  'Exterior Equipment -- Not Subdivided',
  'Water Systems -- General',
  'Generators -- General',
];

// Standard 67-column header rows matching the user's template
const CSV_HEADER_ROW_1 = [
  'Run ID', 'Rev #', 'Run ID',
  'Heating -- General', '',
  'Heating -- Boiler Parasitic', '',
  'Cooling -- General', '',
  'Interior Lighting -- ComplianceLtg', '',
  'Exterior Lighting -- General', '',
  'Exterior Lighting -- Not Subdivided', '',
  'Interior Equipment -- Receptacle', '',
  'Interior Equipment -- Refrig', '',
  'Interior Equipment -- Process', '',
  'Interior Equipment -- Internal Transport', '',
  'Exterior Equipment -- Not Subdivided', '',
  'Fans -- General', '',
  'Fans -- ProcessMotors', '',
  'Fans -- Parking Garage', '',
  'Fans -- Interior Fans', '',
  'Pumps -- General', '',
  'Heat Rejection -- Not Subdivided', '',
  'Heat Rejection -- General', '',
  'Humidification -- Not Subdivided', '',
  'Heat Recovery -- General', '',
  'Heat Recovery -- Not Subdivided', '',
  'Water Systems -- General', '',
  'Water Systems -- Water Heater Parasitic', '',
  'Water Systems -- Other', '',
  'Refrigeration -- Not Subdivided', '',
  'Generators -- General', '',
  'Heating -- General', '',
  'Interior Equipment -- Receptacle', '',
  'Interior Equipment -- Process', '',
  'Exterior Equipment -- Not Subdivided', '',
  'Water Systems -- General', '',
  'Generators -- General', ''
];

const CSV_HEADER_ROW_2 = [
  '', '', '',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[kWh]', '[W]',
  '[therm]', '[Btu/h]',
  '[therm]', '[Btu/h]',
  '[therm]', '[Btu/h]',
  '[therm]', '[Btu/h]',
  '[therm]', '[Btu/h]',
  '[therm]', '[Btu/h]'
];

// Canonical scenario order (ap first, then Baseline Avg, then ab1-ab4)
const CANONICAL_ORDER = {
  'ap': 1,
  'baseline avg': 2,
  'ab_avg': 2,
  'ab1': 3,
  'ab2': 4,
  'ab3': 5,
  'ab4': 6
};

// =============================================================================
// Application State
// =============================================================================
const state = {
  rawScenarios: [],        // Original parsed scenarios from folder
  scenarios: [],           // All display scenarios (including Baseline Avg if enabled)
  baselineAvgScenario: null, // Computed Baseline Avg scenario
  selectedScenarios: [],   // Array of active scenario names
  activeScenario: null,    // Single scenario name when in single view
  baselineScenario: null,  // Baseline scenario name for variance calculations
  averageBaselines: true,  // Calculate and display average of ab1-ab4 (default true)
  selectedFolderName: '',  // Current project folder name

  viewMode: 'compare',     // 'compare' | 'single' | 'variance'
  energyUnit: 'kBtu',       // 'kBtu' | 'kWh' | 'therm'
  fuelType: 'both',        // 'both' | 'electricity' | 'gas' | 'split'
  chartType: 'bar',        // 'bar' | 'stacked-bar' | 'doughnut' | 'horizontalBar' | 'radar'

  cleanLabels: true,       // Strip redundant suffixes
  hideZeroes: true,        // Hide zero rows (chart only)

  chartInstance: null,
  isServerOnline: false,
};

// =============================================================================
// DOM Elements
// =============================================================================
const elements = {
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon: document.getElementById('theme-icon'),
  serverStatus: document.getElementById('server-status'),

  folderPathInput: document.getElementById('folder-path-input'),
  scanPathBtn: document.getElementById('scan-path-btn'),
  useDefaultBtn: document.getElementById('use-default-btn'),

  dropZone: document.getElementById('drop-zone'),
  browserFolderInput: document.getElementById('browser-folder-input'),
  browserFilesInput: document.getElementById('browser-files-input'),
  browseFolderBtn: document.getElementById('browse-folder-btn'),
  browseFilesBtn: document.getElementById('browse-files-btn'),

  scenariosContainer: document.getElementById('scenarios-container'),
  scenariosCountBadge: document.getElementById('scenarios-count-badge'),
  scenariosPillList: document.getElementById('scenarios-pill-list'),
  averageBaselinesToggle: document.getElementById('average-baselines-toggle'),
  selectAllScenariosBtn: document.getElementById('select-all-scenarios-btn'),
  deselectAllScenariosBtn: document.getElementById('deselect-all-scenarios-btn'),

  dashboardArea: document.getElementById('dashboard-area'),

  viewModeControl: document.getElementById('view-mode-control'),
  unitControl: document.getElementById('unit-control'),
  fuelSelect: document.getElementById('fuel-select'),
  chartTypeSelect: document.getElementById('chart-type-select'),

  singleScenarioGroup: document.getElementById('single-scenario-group'),
  singleScenarioSelect: document.getElementById('single-scenario-select'),
  baselineScenarioGroup: document.getElementById('baseline-scenario-group'),
  baselineScenarioSelect: document.getElementById('baseline-scenario-select'),

  cleanLabelsToggle: document.getElementById('clean-labels-toggle'),
  hideZeroesToggle: document.getElementById('hide-zeroes-toggle'),

  metricTotalEnergy: document.getElementById('metric-total-energy'),
  metricTotalSubtitle: document.getElementById('metric-total-subtitle'),
  metricElecVal: document.getElementById('metric-elec-val'),
  metricElecPercent: document.getElementById('metric-elec-percent'),
  metricGasVal: document.getElementById('metric-gas-val'),
  metricGasPercent: document.getElementById('metric-gas-percent'),
  metricPeakCategory: document.getElementById('metric-peak-category'),
  metricPeakVal: document.getElementById('metric-peak-val'),

  chartMainTitle: document.getElementById('chart-main-title'),
  chartUnitBadge: document.getElementById('chart-unit-badge'),
  energyChartCanvas: document.getElementById('energy-chart'),
  downloadChartBtn: document.getElementById('download-chart-btn'),

  tableTitle: document.getElementById('table-title'),
  complianceDataTable: document.getElementById('compliance-data-table'),
  tableHead: document.getElementById('table-head'),
  tableBody: document.getElementById('table-body'),
  tableFoot: document.getElementById('table-foot'),
  copyExcelBtn: document.getElementById('copy-excel-btn'),
  exportExcelBtn: document.getElementById('export-excel-btn'),

  // CSV export panel
  csvFilenamePreview: document.getElementById('csv-filename-preview'),
  csvRunId: document.getElementById('csv-run-id'),
  csvRevision: document.getElementById('csv-revision'),
  csvExportScope: document.getElementById('csv-export-scope'),
  exportCsvBtn: document.getElementById('export-csv-btn'),

  toast: document.getElementById('toast'),
  toastTitle: document.getElementById('toast-title'),
  toastMessage: document.getElementById('toast-message'),
};

// =============================================================================
// Helper Functions: Parsing & Conversion
// =============================================================================

function parseNumber(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/,/g, '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

function formatNum(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatNumRaw(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return Number(val).toFixed(decimals);
}

/**
 * Client-side HTML parser for CBECC EAp2-4/5 Performance Rating Method Compliance tables.
 * Extracts: Electricity Energy Use [kWh], Electricity Demand [W],
 *           Natural Gas Energy Use [therm], Natural Gas Demand [Btu/h]
 */
function extractComplianceFromHTML(htmlString, sourceName = '') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const tables = doc.querySelectorAll('table');
  let targetTable = null;

  for (const table of tables) {
    const text = table.textContent || '';
    if (text.includes('Electricity Energy Use') && text.includes('Natural Gas Energy Use')) {
      targetTable = table;
      break;
    }
  }

  if (!targetTable) return null;

  const rows = Array.from(targetTable.querySelectorAll('tr'));
  if (rows.length < 2) return null;

  const headerRow = rows[0];
  const headerCells = Array.from(headerRow.querySelectorAll('th, td')).map(c => c.textContent.trim());

  // Locate column indices
  let elecEnergyIdx = -1;
  let elecDemandIdx = -1;
  let gasEnergyIdx  = -1;
  let gasDemandIdx  = -1;

  headerCells.forEach((cell, idx) => {
    const lower = cell.toLowerCase();
    if (lower.includes('electricity energy use') || (lower.includes('electricity') && lower.includes('[kwh]') && !lower.includes('demand'))) elecEnergyIdx = idx;
    if (lower.includes('electricity demand') || (lower.includes('electricity') && lower.includes('[w]'))) elecDemandIdx = idx;
    if (lower.includes('natural gas energy use') || (lower.includes('natural gas') && lower.includes('[therm]') && !lower.includes('demand'))) gasEnergyIdx = idx;
    if (lower.includes('natural gas demand') || (lower.includes('natural gas') && lower.includes('[btu/h]'))) gasDemandIdx = idx;
  });

  // Fallback column guesses
  if (elecEnergyIdx === -1) elecEnergyIdx = 1;
  if (elecDemandIdx === -1) elecDemandIdx = 2;
  if (gasEnergyIdx  === -1) gasEnergyIdx  = 3;
  if (gasDemandIdx  === -1) gasDemandIdx  = 4;

  // Build a lookup map: rawCategory -> data object
  const categoryMap = {};

  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll('td, th')).map(c => c.textContent.trim());
    if (cells.length === 0 || !cells[0]) continue;

    const catLabel = cells[0];
    const elecKwh    = parseNumber(cells[elecEnergyIdx]);
    const elecDemW   = parseNumber(cells[elecDemandIdx]);
    const gasTherm   = parseNumber(cells[gasEnergyIdx]);
    const gasDemBtuh = parseNumber(cells[gasDemandIdx]);
    const isTotal    = catLabel.toLowerCase().includes('total');

    const elecKbtu = elecKwh  * CONVERSIONS.KWH_TO_KBTU;
    const gasKbtu  = gasTherm * CONVERSIONS.THERM_TO_KBTU;

    categoryMap[catLabel] = {
      rawCategory: catLabel,
      isTotal,
      elecKwh,
      elecDemW,
      gasTherm,
      gasDemBtuh,
      elecKbtu,
      gasKbtu,
      totalKbtu: elecKbtu + gasKbtu,
    };
  }

  // Calculate totals from non-total rows
  let totalElecKwh = 0;
  let totalGasTherm = 0;
  Object.values(categoryMap).forEach(r => {
    if (!r.isTotal) {
      totalElecKwh  += r.elecKwh;
      totalGasTherm += r.gasTherm;
    }
  });

  const totalElecKbtu = totalElecKwh  * CONVERSIONS.KWH_TO_KBTU;
  const totalGasKbtu  = totalGasTherm * CONVERSIONS.THERM_TO_KBTU;
  const grandTotalKbtu = totalElecKbtu + totalGasKbtu;

  return {
    sourceName,
    categoryMap,
    summary: {
      totalElectricity_kWh:  totalElecKwh,
      totalNaturalGas_therm: totalGasTherm,
      totalElectricity_kBtu: totalElecKbtu,
      totalNaturalGas_kBtu:  totalGasKbtu,
      grandTotal_kBtu:       grandTotalKbtu,
      electricitySharePercent: grandTotalKbtu > 0 ? (totalElecKbtu / grandTotalKbtu) * 100 : 0,
      naturalGasSharePercent:  grandTotalKbtu > 0 ? (totalGasKbtu  / grandTotalKbtu) * 100 : 0,
    },
  };
}

/**
 * Return the energy value for a category row given current fuel/unit selection.
 * Used only by the chart (not the fixed table).
 */
function getCategoryEnergyValue(catData, fuel = state.fuelType, unit = state.energyUnit) {
  if (!catData) return 0;
  if (fuel === 'electricity') {
    if (unit === 'kWh')   return catData.elecKwh;
    if (unit === 'therm') return catData.elecKwh * CONVERSIONS.KWH_TO_THERM;
    return catData.elecKbtu;
  }
  if (fuel === 'gas') {
    if (unit === 'kWh')   return catData.gasTherm * CONVERSIONS.THERM_TO_KWH;
    if (unit === 'therm') return catData.gasTherm;
    return catData.gasKbtu;
  }
  // 'both' combined
  if (unit === 'kWh')   return catData.elecKwh + catData.gasTherm * CONVERSIONS.THERM_TO_KWH;
  if (unit === 'therm') return catData.elecKwh * CONVERSIONS.KWH_TO_THERM + catData.gasTherm;
  return catData.totalKbtu;
}

// =============================================================================
// Server Connectivity & Folder Scanning
// =============================================================================

async function checkServerStatus() {
  try {
    const res = await fetch('/api/default-folder', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      state.isServerOnline = true;
      elements.serverStatus.className = 'status-chip online';
      elements.serverStatus.querySelector('.status-text').textContent = 'Local Server Active';
      if (data.path && !elements.folderPathInput.value) {
        elements.folderPathInput.value = data.path;
      }
      return true;
    }
  } catch (e) {
    state.isServerOnline = false;
    elements.serverStatus.className = 'status-chip offline';
    elements.serverStatus.querySelector('.status-text').textContent = 'Browser Mode';
  }
  return false;
}

async function scanFolderViaServer(folderPath) {
  try {
    showToast('Scanning Folder...', 'Analyzing HTM files and extracting EAp2-4/5 tables', '⏳');
    const res = await fetch(`/api/scan?folder=${encodeURIComponent(folderPath)}`);
    const data = await res.json();
    if (data.success && data.files && data.files.length > 0) {
      state.selectedFolderName = data.folder || folderPath || elements.folderPathInput.value;
      updateCsvFilenamePreview();
      loadParsedScenarios(data.files);
      showToast('Scan Complete', `Loaded ${data.files.length} scenarios from ${folderPath || 'default folder'}`, '✅');
    } else {
      showToast('Scan Notice', data.error || 'No compliance tables found in directory', '⚠️');
    }
  } catch (err) {
    showToast('Error', 'Failed to communicate with local server', '❌');
  }
}

// =============================================================================
// File Ingestion Handlers (Browser Mode)
// =============================================================================

async function handleFileList(files) {
  const htmFiles = Array.from(files).filter(f => f.name.endsWith('.htm') || f.name.endsWith('.html'));
  if (htmFiles.length === 0) {
    showToast('No HTM Files', 'Please select a folder or files with .htm/.html extensions', '⚠️');
    return;
  }

  // Derive folder name from relative path or first file
  if (files.length > 0 && files[0].webkitRelativePath) {
    state.selectedFolderName = files[0].webkitRelativePath.split('/')[0];
  } else if (files.length > 0) {
    state.selectedFolderName = files[0].name.replace(/\.(htm|html)$/i, '');
  }
  updateCsvFilenamePreview();

  showToast('Parsing Files...', `Reading ${htmFiles.length} files in browser...`, '⏳');
  const parsedResults = [];

  for (const file of htmFiles) {
    try {
      const text = await file.text();
      let scenarioName = file.name.replace(/\.(htm|html)$/i, '');
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 2) {
          scenarioName = parts[parts.length - 2];
        }
      }

      // Filter out zb and zp scenarios
      const scLower = scenarioName.toLowerCase();
      if (scLower.startsWith('zb') || scLower.startsWith('zp') ||
          scLower.includes('- zb') || scLower.includes('- zp')) {
        continue;
      }

      const parsed = extractComplianceFromHTML(text, scenarioName);
      if (parsed) {
        parsed.fileBaseName   = file.name;
        parsed.scenarioName   = scenarioName;
        parsedResults.push(parsed);
      }
    } catch (e) {
      console.error('Error parsing file:', file.name, e);
    }
  }

  if (parsedResults.length > 0) {
    loadParsedScenarios(parsedResults);
    showToast('Success', `Successfully parsed ${parsedResults.length} scenarios!`, '✅');
  } else {
    showToast('Extraction Failed', 'No EAp2-4/5 compliance tables found in selected files', '⚠️');
  }
}

// =============================================================================
// Helper: Folder Name & File Naming
// =============================================================================

/**
 * Derives CSV filename from selected folder name:
 * Ignores trailing " - run" or " - batch" (case-insensitive) and appends " - Results.csv".
 */
function getCleanCsvFilename(folderName) {
  let name = (folderName || '').trim();
  if (!name) name = 'Energy_Compliance';
  // Strip trailing slashes and backslashes
  name = name.replace(/[/\\]+$/, '');
  // Extract folder basename from path if full path is provided
  const base = name.split(/[/\\]/).filter(Boolean).pop() || name;
  // Ignore ending if it ends with " - run" or " - batch" (case-insensitive)
  const stripped = base.replace(/\s*-\s*(run|batch)$/i, '').trim();
  const finalBase = stripped || base;
  return `${finalBase} - Results.csv`;
}

function updateCsvFilenamePreview() {
  if (!elements.csvFilenamePreview) return;
  const rawFolder = state.selectedFolderName || (elements.folderPathInput ? elements.folderPathInput.value.trim() : '') || 'example_project_folder';
  elements.csvFilenamePreview.textContent = getCleanCsvFilename(rawFolder);
}

// =============================================================================
// Helper: Baseline Averaging Calculation
// =============================================================================

/**
 * Calculates the average of the 4 baseline scenarios (ab1, ab2, ab3, ab4).
 * Creates a synthetic scenario object with identical structure to parsed scenarios.
 */
function computeBaselineAverage(scenarios) {
  const baselines = scenarios.filter(s => /^ab\d+/i.test(s.scenarioName));
  if (baselines.length === 0) return null;

  const count = baselines.length;
  const categoryMap = {};

  // Collect all category keys across fixed list and template lists
  const allCatKeys = new Set();
  FIXED_CATEGORIES.forEach(fc => allCatKeys.add(fc.raw));
  CSV_ELECS.forEach(c => allCatKeys.add(c));
  CSV_GASES.forEach(c => allCatKeys.add(c));
  baselines.forEach(b => {
    Object.keys(b.categoryMap || {}).forEach(k => allCatKeys.add(k));
  });

  let totalElecKwh = 0;
  let totalGasTherm = 0;

  allCatKeys.forEach(raw => {
    let sumElecKwh    = 0;
    let sumElecDemW   = 0;
    let sumGasTherm   = 0;
    let sumGasDemBtuh = 0;
    let isTotal = false;

    baselines.forEach(b => {
      const r = b.categoryMap ? b.categoryMap[raw] : null;
      if (r) {
        sumElecKwh    += (r.elecKwh || 0);
        sumElecDemW   += (r.elecDemW || 0);
        sumGasTherm   += (r.gasTherm || 0);
        sumGasDemBtuh += (r.gasDemBtuh || 0);
        if (r.isTotal) isTotal = true;
      }
    });

    const avgElecKwh    = sumElecKwh / count;
    const avgElecDemW   = sumElecDemW / count;
    const avgGasTherm   = sumGasTherm / count;
    const avgGasDemBtuh = sumGasDemBtuh / count;

    const elecKbtu  = avgElecKwh * CONVERSIONS.KWH_TO_KBTU;
    const gasKbtu   = avgGasTherm * CONVERSIONS.THERM_TO_KBTU;
    const totalKbtu = elecKbtu + gasKbtu;

    if (!isTotal && FIXED_CATEGORIES.some(fc => fc.raw === raw)) {
      totalElecKwh  += avgElecKwh;
      totalGasTherm += avgGasTherm;
    }

    categoryMap[raw] = {
      rawCategory: raw,
      isTotal,
      elecKwh:    avgElecKwh,
      elecDemW:   avgElecDemW,
      gasTherm:   avgGasTherm,
      gasDemBtuh: avgGasDemBtuh,
      elecKbtu,
      gasKbtu,
      totalKbtu,
    };
  });

  const totalElecKbtu  = totalElecKwh  * CONVERSIONS.KWH_TO_KBTU;
  const totalGasKbtu   = totalGasTherm * CONVERSIONS.THERM_TO_KBTU;
  const grandTotalKbtu = totalElecKbtu + totalGasKbtu;

  return {
    scenarioName: 'Baseline Avg',
    isCalculatedAverage: true,
    fileBaseName: 'baseline_avg',
    categoryMap,
    summary: {
      totalElectricity_kWh:  totalElecKwh,
      totalNaturalGas_therm: totalGasTherm,
      totalElectricity_kBtu: totalElecKbtu,
      totalNaturalGas_kBtu:  totalGasKbtu,
      grandTotal_kBtu:       grandTotalKbtu,
      electricitySharePercent: grandTotalKbtu > 0 ? (totalElecKbtu / grandTotalKbtu) * 100 : 0,
      naturalGasSharePercent:  grandTotalKbtu > 0 ? (totalGasKbtu  / grandTotalKbtu) * 100 : 0,
    }
  };
}

function loadParsedScenarios(scenarios) {
  // Filter out zb/zp and any previous Baseline Avg
  const filtered = scenarios.filter(s => {
    const scLower = s.scenarioName.toLowerCase();
    return !scLower.startsWith('zb') && !scLower.startsWith('zp') &&
           !scLower.includes('- zb') && !scLower.includes('- zp') &&
           s.scenarioName !== 'Baseline Avg';
  });

  state.rawScenarios = [...filtered];

  // Calculate Baseline Average across ab1..ab4
  const baselineAvg = computeBaselineAverage(filtered);
  state.baselineAvgScenario = baselineAvg;

  if (baselineAvg) {
    filtered.push(baselineAvg);
  }

  // Sort: ap first, then Baseline Avg, then ab1-ab4
  filtered.sort((a, b) => {
    const ordA = CANONICAL_ORDER[a.scenarioName.toLowerCase()] || 99;
    const ordB = CANONICAL_ORDER[b.scenarioName.toLowerCase()] || 99;
    return ordA - ordB;
  });

  state.scenarios = filtered;

  // Option: average of the 4 baseline results, default to select it and not selecting ab1, ab2, ab3, ab4
  state.averageBaselines = elements.averageBaselinesToggle ? elements.averageBaselinesToggle.checked : true;

  if (baselineAvg && state.averageBaselines) {
    // Select ap and Baseline Avg, do NOT select ab1, ab2, ab3, ab4 by default
    state.selectedScenarios = filtered
      .map(s => s.scenarioName)
      .filter(name => !/^ab\d+/i.test(name)); // excludes individual ab1..ab4; keeps ap & Baseline Avg
    state.baselineScenario = 'Baseline Avg';
    state.activeScenario = filtered.find(s => s.scenarioName.toLowerCase() === 'ap')?.scenarioName || 'Baseline Avg';
  } else {
    // If averaging is disabled, select all real scenarios
    state.selectedScenarios = filtered.filter(s => s.scenarioName !== 'Baseline Avg').map(s => s.scenarioName);
    state.activeScenario = filtered.find(s => s.scenarioName.toLowerCase() === 'ap')?.scenarioName || filtered[0]?.scenarioName || null;
    state.baselineScenario = filtered.find(s => s.scenarioName.toLowerCase() === 'ab1')?.scenarioName || filtered[0]?.scenarioName || null;
  }

  if (elements.averageBaselinesToggle) {
    elements.averageBaselinesToggle.checked = state.averageBaselines;
  }

  updateCsvFilenamePreview();
  renderScenariosPills();
  renderDropdownSelectors();

  elements.scenariosContainer.classList.remove('hidden');
  elements.dashboardArea.classList.remove('hidden');

  updateDashboard();
}

// =============================================================================
// Rendering: Scenarios & Controls
// =============================================================================

function renderScenariosPills() {
  const activeCount = state.selectedScenarios.length;
  elements.scenariosCountBadge.textContent = `${activeCount} of ${state.scenarios.length} active`;
  elements.scenariosPillList.innerHTML = '';

  state.scenarios.forEach(sc => {
    const isSelected = state.selectedScenarios.includes(sc.scenarioName);
    const isAvg = sc.isCalculatedAverage || sc.scenarioName === 'Baseline Avg';
    const pill = document.createElement('div');
    pill.className = `scenario-pill ${isSelected ? 'active' : ''} ${isAvg ? 'pill-avg' : ''}`;
    pill.innerHTML = `
      <span class="pill-check">${isSelected ? '✓' : ''}</span>
      <span>${sc.scenarioName}</span>
      ${isAvg ? '<span class="pill-tag">AVG</span>' : ''}
    `;
    pill.addEventListener('click', () => { toggleScenarioSelection(sc.scenarioName); });
    elements.scenariosPillList.appendChild(pill);
  });
}

function toggleScenarioSelection(name) {
  if (state.selectedScenarios.includes(name)) {
    if (state.selectedScenarios.length > 1) {
      state.selectedScenarios = state.selectedScenarios.filter(n => n !== name);
    } else {
      showToast('Notice', 'At least one scenario must remain selected', 'ℹ️');
      return;
    }
  } else {
    state.selectedScenarios.push(name);
  }

  // If user unselected Baseline Avg, uncheck average baselines toggle
  if (name === 'Baseline Avg' && elements.averageBaselinesToggle) {
    elements.averageBaselinesToggle.checked = state.selectedScenarios.includes('Baseline Avg');
  }

  renderScenariosPills();
  updateDashboard();
}

function toggleAverageBaselines(enabled) {
  state.averageBaselines = enabled;
  if (enabled) {
    // Select Baseline Avg, deselect individual ab1..ab4
    state.selectedScenarios = state.selectedScenarios.filter(n => !/^ab\d+/i.test(n));
    if (!state.selectedScenarios.includes('Baseline Avg') && state.scenarios.some(s => s.scenarioName === 'Baseline Avg')) {
      state.selectedScenarios.push('Baseline Avg');
    }
    state.baselineScenario = 'Baseline Avg';
  } else {
    // Deselect Baseline Avg, select individual ab1..ab4
    state.selectedScenarios = state.selectedScenarios.filter(n => n !== 'Baseline Avg');
    state.scenarios.forEach(s => {
      if (/^ab\d+/i.test(s.scenarioName) && !state.selectedScenarios.includes(s.scenarioName)) {
        state.selectedScenarios.push(s.scenarioName);
      }
    });
    const firstAb = state.scenarios.find(s => /^ab1/i.test(s.scenarioName));
    if (firstAb) state.baselineScenario = firstAb.scenarioName;
  }
  renderScenariosPills();
  renderDropdownSelectors();
  updateDashboard();
}

function renderDropdownSelectors() {
  elements.singleScenarioSelect.innerHTML = '';
  state.scenarios.forEach(sc => {
    const opt = document.createElement('option');
    opt.value = sc.scenarioName;
    opt.textContent = sc.scenarioName + (sc.isCalculatedAverage ? ' (Baseline Average)' : '');
    if (sc.scenarioName === state.activeScenario) opt.selected = true;
    elements.singleScenarioSelect.appendChild(opt);
  });

  elements.baselineScenarioSelect.innerHTML = '';
  state.scenarios.forEach(sc => {
    const opt = document.createElement('option');
    opt.value = sc.scenarioName;
    opt.textContent = `Baseline: ${sc.scenarioName}` + (sc.isCalculatedAverage ? ' (Average)' : '');
    if (sc.scenarioName === state.baselineScenario) opt.selected = true;
    elements.baselineScenarioSelect.appendChild(opt);
  });
}

// =============================================================================
// Dashboard Updates (Metrics, Chart, Table)
// =============================================================================

function updateDashboard() {
  const activeScenariosList = state.scenarios.filter(s => {
    if (state.viewMode === 'single') return s.scenarioName === state.activeScenario;
    return state.selectedScenarios.includes(s.scenarioName);
  });

  if (activeScenariosList.length === 0) return;

  updateMetrics(activeScenariosList);
  updateChart(activeScenariosList);
  updateTable(activeScenariosList);
}

function updateMetrics(scenarios) {
  document.querySelectorAll('.unit-label').forEach(el => el.textContent = state.energyUnit);

  let totalElecKwh  = 0;
  let totalGasTherm = 0;
  let totalKbtu     = 0;
  const categoryTotals = {};

  scenarios.forEach(sc => {
    totalElecKwh  += sc.summary.totalElectricity_kWh;
    totalGasTherm += sc.summary.totalNaturalGas_therm;
    totalKbtu     += sc.summary.grandTotal_kBtu;

    FIXED_CATEGORIES.forEach(fc => {
      const r = sc.categoryMap[fc.raw];
      if (r && !r.isTotal) {
        categoryTotals[fc.raw] = (categoryTotals[fc.raw] || 0) + r.totalKbtu;
      }
    });
  });

  const count       = scenarios.length;
  const avgKbtu     = totalKbtu    / count;
  const avgElecKwh  = totalElecKwh / count;
  const avgGasTherm = totalGasTherm / count;

  const totalElecKbtu = avgElecKwh  * CONVERSIONS.KWH_TO_KBTU;
  const totalGasKbtu  = avgGasTherm * CONVERSIONS.THERM_TO_KBTU;

  let displayTotal = avgKbtu;
  let displayElec  = avgElecKwh;
  let displayGas   = avgGasTherm;

  if (state.energyUnit === 'kWh') {
    displayTotal = avgKbtu / CONVERSIONS.KWH_TO_KBTU;
    displayGas   = avgGasTherm * CONVERSIONS.THERM_TO_KWH;
  } else if (state.energyUnit === 'therm') {
    displayTotal = avgKbtu / CONVERSIONS.THERM_TO_KBTU;
    displayElec  = avgElecKwh * CONVERSIONS.KWH_TO_THERM;
  } else {
    displayElec = totalElecKbtu;
    displayGas  = totalGasKbtu;
  }

  elements.metricTotalEnergy.textContent  = `${formatNum(displayTotal, 0)} ${state.energyUnit}`;
  elements.metricTotalSubtitle.textContent = count > 1 ? `Average across ${count} selected scenarios` : `${scenarios[0].scenarioName} total energy`;

  const elecPct = avgKbtu > 0 ? (totalElecKbtu / avgKbtu) * 100 : 0;
  const gasPct  = avgKbtu > 0 ? (totalGasKbtu  / avgKbtu) * 100 : 0;

  elements.metricElecVal.textContent     = `${formatNum(displayElec, 0)} ${state.energyUnit}`;
  elements.metricElecPercent.textContent = `${formatNum(elecPct, 1)}% of total energy`;
  elements.metricGasVal.textContent      = `${formatNum(displayGas, 0)} ${state.energyUnit}`;
  elements.metricGasPercent.textContent  = `${formatNum(gasPct, 1)}% of total energy`;

  let topCat = '-';
  let topVal  = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > topVal) { topVal = val; topCat = cat; }
  });

  const peakDisplayVal = state.energyUnit === 'kWh'   ? (topVal / count) / CONVERSIONS.KWH_TO_KBTU  :
                         state.energyUnit === 'therm'  ? (topVal / count) / CONVERSIONS.THERM_TO_KBTU :
                                                         (topVal / count);

  const fc = FIXED_CATEGORIES.find(c => c.raw === topCat);
  elements.metricPeakCategory.textContent = fc ? (state.cleanLabels ? fc.label : fc.raw) : topCat;
  elements.metricPeakVal.textContent      = `${formatNum(peakDisplayVal, 0)} ${state.energyUnit} avg`;
}

// =============================================================================
// Chart.js Visualization Engine (unchanged from previous)
// =============================================================================

function getChartCategories(scenarios) {
  return FIXED_CATEGORIES.filter(fc => {
    if (!state.hideZeroes) return true;
    return scenarios.some(sc => {
      const r = sc.categoryMap[fc.raw];
      return r && getCategoryEnergyValue(r, state.fuelType, state.energyUnit) !== 0;
    });
  });
}

function updateChart(scenarios) {
  if (state.chartInstance) { state.chartInstance.destroy(); }

  elements.chartUnitBadge.textContent  = `Units: ${state.energyUnit}`;
  elements.chartMainTitle.textContent  = state.viewMode === 'compare'  ?
    `Side-by-Side Scenario Comparison (${state.energyUnit})` :
    state.viewMode === 'variance' ?
    `Variance vs Baseline: ${state.baselineScenario} (%)` :
    `Energy Breakdown: ${state.activeScenario} (${state.energyUnit})`;

  const visibleCats = getChartCategories(scenarios);
  const labels = visibleCats.map(fc => state.cleanLabels ? fc.label : fc.raw);

  let chartConfig = {};

  // Stacked Fuel Breakdown
  if (state.fuelType === 'split') {
    const datasets = [];
    scenarios.forEach((sc, idx) => {
      const elecData = visibleCats.map(fc => {
        const r = sc.categoryMap[fc.raw];
        return r ? (state.energyUnit === 'kWh' ? r.elecKwh : state.energyUnit === 'therm' ? r.elecKwh * CONVERSIONS.KWH_TO_THERM : r.elecKbtu) : 0;
      });
      const gasData = visibleCats.map(fc => {
        const r = sc.categoryMap[fc.raw];
        return r ? (state.energyUnit === 'kWh' ? r.gasTherm * CONVERSIONS.THERM_TO_KWH : state.energyUnit === 'therm' ? r.gasTherm : r.gasKbtu) : 0;
      });
      datasets.push({ label: `${sc.scenarioName} - Elec`, data: elecData, backgroundColor: '#007AC9', stack: `stack-${idx}` });
      datasets.push({ label: `${sc.scenarioName} - Gas`,  data: gasData,  backgroundColor: '#E67E22', stack: `stack-${idx}` });
    });
    chartConfig = { type: 'bar', data: { labels, datasets }, options: getCommonChartOptions(true) };
  }

  // Variance Mode
  else if (state.viewMode === 'variance') {
    const baselineSc = state.scenarios.find(s => s.scenarioName === state.baselineScenario) || scenarios[0];
    const isDark = document.body.classList.contains('dark-theme');
    const datasets = scenarios.filter(s => s.scenarioName !== baselineSc.scenarioName).map((sc, idx) => {
      const deltaData = visibleCats.map(fc => {
        const baseRow = baselineSc.categoryMap[fc.raw];
        const currRow = sc.categoryMap[fc.raw];
        const baseVal = baseRow ? getCategoryEnergyValue(baseRow, state.fuelType, state.energyUnit) : 0;
        const currVal = currRow ? getCategoryEnergyValue(currRow, state.fuelType, state.energyUnit) : 0;
        if (baseVal === 0) return 0;
        return Number((((currVal - baseVal) / baseVal) * 100).toFixed(2));
      });
      const color = SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || CHART_COLORS[idx % CHART_COLORS.length];
      return { label: `${sc.scenarioName} vs ${baselineSc.scenarioName} (Δ %)`, data: deltaData, backgroundColor: color, borderColor: color, borderWidth: 1 };
    });
    chartConfig = {
      type: 'bar', data: { labels, datasets },
      options: { ...getCommonChartOptions(false), scales: {
        y: { title: { display: true, text: 'Percentage Difference (%)', color: isDark ? '#A0B0C0' : '#4F6173', font: { weight: '600' } }, ticks: { color: isDark ? '#A0B0C0' : '#4F6173', callback: v => `${v}%` } },
        x: { ticks: { color: isDark ? '#A0B0C0' : '#4F6173' } }
      }}
    };
  }

  // Donut
  else if (state.chartType === 'doughnut') {
    const targetSc = scenarios[0];
    const isDark = document.body.classList.contains('dark-theme');
    const dataVals = visibleCats.map(fc => { const r = targetSc.categoryMap[fc.raw]; return r ? getCategoryEnergyValue(r, state.fuelType, state.energyUnit) : 0; });
    chartConfig = {
      type: 'doughnut',
      data: { labels, datasets: [{ data: dataVals, backgroundColor: CHART_COLORS.slice(0, visibleCats.length), borderWidth: 2, borderColor: isDark ? '#161D26' : '#FFFFFF' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: {
        legend: { position: 'right', labels: { color: isDark ? '#A0B0C0' : '#4F6173', font: { family: 'Yu Gothic, Raleway, Inter', weight: '600' }, boxWidth: 14 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatNum(ctx.raw)} ${state.energyUnit}` } }
      }}
    };
  }

  // Horizontal Bar
  else if (state.chartType === 'horizontalBar') {
    const datasets = scenarios.map((sc, idx) => {
      const color = SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || CHART_COLORS[idx % CHART_COLORS.length];
      return { label: sc.scenarioName, data: visibleCats.map(fc => { const r = sc.categoryMap[fc.raw]; return r ? getCategoryEnergyValue(r, state.fuelType, state.energyUnit) : 0; }), backgroundColor: color, borderColor: color, borderWidth: 1 };
    });
    chartConfig = { type: 'bar', data: { labels, datasets }, options: { ...getCommonChartOptions(false), indexAxis: 'y' } };
  }

  // Radar
  else if (state.chartType === 'radar') {
    const isDark = document.body.classList.contains('dark-theme');
    const datasets = scenarios.map((sc, idx) => {
      const color = SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || CHART_COLORS[idx % CHART_COLORS.length];
      return { label: sc.scenarioName, data: visibleCats.map(fc => { const r = sc.categoryMap[fc.raw]; return r ? getCategoryEnergyValue(r, state.fuelType, state.energyUnit) : 0; }), backgroundColor: `${color}33`, borderColor: color, borderWidth: 2, pointBackgroundColor: color };
    });
    chartConfig = {
      type: 'radar', data: { labels, datasets },
      options: { responsive: true, maintainAspectRatio: false, scales: { r: { ticks: { color: isDark ? '#A0B0C0' : '#4F6173', backdropColor: 'transparent' }, pointLabels: { color: isDark ? '#A0B0C0' : '#4F6173', font: { family: 'Yu Gothic, Raleway, Inter', size: 11, weight: '600' } } } }, plugins: { legend: { labels: { color: isDark ? '#A0B0C0' : '#4F6173', font: { family: 'Yu Gothic, Raleway, Inter', weight: '600' } } } } }
    };
  }

  // Standard Grouped or Stacked Bar
  else {
    const isStacked = state.chartType === 'stacked-bar';
    const datasets = scenarios.map((sc, idx) => {
      const color = SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || CHART_COLORS[idx % CHART_COLORS.length];
      return { label: sc.scenarioName, data: visibleCats.map(fc => { const r = sc.categoryMap[fc.raw]; return r ? getCategoryEnergyValue(r, state.fuelType, state.energyUnit) : 0; }), backgroundColor: color, borderColor: color, borderWidth: 1 };
    });
    chartConfig = { type: 'bar', data: { labels, datasets }, options: getCommonChartOptions(isStacked) };
  }

  state.chartInstance = new Chart(elements.energyChartCanvas, chartConfig);
}

function getCommonChartOptions(stacked = false) {
  const isDark    = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#A0B0C0' : '#4F6173';
  const gridColor = isDark ? '#2D3A4B' : '#E8EEF3';
  return {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { stacked, grid: { color: isDark ? '#202A36' : '#F0F4F8' }, ticks: { color: textColor, font: { family: 'Yu Gothic, Raleway, Inter', size: 11, weight: '500' } } },
      y: { stacked, title: { display: true, text: `Energy Consumption (${state.energyUnit})`, color: textColor, font: { family: 'Yu Gothic, Raleway, Inter', weight: '600' } }, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Yu Gothic, Raleway, Inter', size: 11 } } }
    },
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Yu Gothic, Raleway, Inter', weight: '600' }, boxWidth: 14 } },
      tooltip: { padding: 10, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)} ${state.energyUnit}` } }
    }
  };
}

// =============================================================================
// Fixed-Column Table Generation
// Layout: [Category] then for each scenario (ap first): [Elec kWh | Elec Dem W | Gas therm | Gas Dem Btu/h]
// Electricity-only rows: Gas cells show "-"
// =============================================================================

function updateTable(scenarios) {
  elements.tableHead.innerHTML = '';
  elements.tableBody.innerHTML = '';
  elements.tableFoot.innerHTML = '';

  elements.tableTitle.textContent = 'EAp2-4/5 Performance Rating Method Compliance';

  // ---- Header row 1: Scenario group spans ----
  let head1 = `<tr><th class="cat-col" rowspan="2">End-Use Category</th>`;
  scenarios.forEach(sc => {
    head1 += `<th class="scenario-group-header" colspan="4" style="background:${(SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || '#4D76AD')}22; border-bottom: 3px solid ${SCENARIO_COLORS[sc.scenarioName.toLowerCase()] || '#4D76AD'};">${sc.scenarioName}</th>`;
  });
  head1 += `</tr>`;

  // ---- Header row 2: Sub-columns per scenario ----
  let head2 = `<tr>`;
  scenarios.forEach(() => {
    head2 += `<th class="num-col sub-col">Elec Use<br>[kWh]</th>`;
    head2 += `<th class="num-col sub-col">Elec Dem<br>[W]</th>`;
    head2 += `<th class="num-col sub-col">Gas Use<br>[therm]</th>`;
    head2 += `<th class="num-col sub-col">Gas Dem<br>[Btu/h]</th>`;
  });
  head2 += `</tr>`;

  elements.tableHead.innerHTML = head1 + head2;

  // ---- Column totals accumulators ----
  // Per scenario: [sumElecKwh, sumElecDemW, sumGasTherm, sumGasDemBtuh]
  const columnTotals = scenarios.map(() => [0, 0, 0, 0]);

  // ---- Data rows (fixed list) ----
  FIXED_CATEGORIES.forEach(fc => {
    const row = document.createElement('tr');
    let rowHtml = `<td class="cat-col">${state.cleanLabels ? fc.label : fc.raw}</td>`;

    scenarios.forEach((sc, sIdx) => {
      const r = sc.categoryMap[fc.raw];
      const elecKwh    = r ? r.elecKwh    : 0;
      const elecDemW   = r ? r.elecDemW   : 0;
      const gasTherm   = r ? r.gasTherm   : 0;
      const gasDemBtuh = r ? r.gasDemBtuh : 0;

      columnTotals[sIdx][0] += elecKwh;
      columnTotals[sIdx][1] += elecDemW;
      columnTotals[sIdx][2] += gasTherm;
      columnTotals[sIdx][3] += gasDemBtuh;

      const gasDisplay = fc.electricityOnly;

      rowHtml += `<td class="num-col">${formatNum(elecKwh)}</td>`;
      rowHtml += `<td class="num-col">${formatNum(elecDemW)}</td>`;
      rowHtml += `<td class="num-col gas-col${gasDisplay ? ' elec-only' : ''}">${gasDisplay ? '-' : formatNum(gasTherm)}</td>`;
      rowHtml += `<td class="num-col gas-col${gasDisplay ? ' elec-only' : ''}">${gasDisplay ? '-' : formatNum(gasDemBtuh)}</td>`;
    });

    row.innerHTML = rowHtml;
    elements.tableBody.appendChild(row);
  });

  // ---- Totals footer ----
  let footHtml = `<tr><td class="cat-col">TOTAL END USES</td>`;
  scenarios.forEach((sc, sIdx) => {
    const [sumElec, sumElecDem, sumGas, sumGasDem] = columnTotals[sIdx];
    footHtml += `<td class="num-col"><strong>${formatNum(sumElec)}</strong></td>`;
    footHtml += `<td class="num-col">${formatNum(sumElecDem)}</td>`;
    footHtml += `<td class="num-col gas-col"><strong>${formatNum(sumGas)}</strong></td>`;
    footHtml += `<td class="num-col gas-col">${formatNum(sumGasDem)}</td>`;
  });
  footHtml += `</tr>`;
  elements.tableFoot.innerHTML = footHtml;
}

// =============================================================================
// Excel TSV Copy (from fixed table)
// =============================================================================

function generateTSVForExcel() {
  const table = elements.complianceDataTable;
  const rows  = Array.from(table.querySelectorAll('tr'));
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => cell.textContent.trim()).join('\t');
  }).join('\r\n');
}

async function copyTableToExcel() {
  try {
    const tsv = generateTSVForExcel();
    await navigator.clipboard.writeText(tsv);
    const rowCount = elements.complianceDataTable.querySelectorAll('tbody tr').length + 2;
    showToast('Copied for Excel!', `Copied ${rowCount} rows as Tab-Separated Values. Paste with Ctrl+V into Excel.`, '📋');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = generateTSVForExcel();
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied for Excel!', 'Table copied to clipboard. Ready to paste in Excel.', '📋');
  }
}

/**
 * Native formatted Excel (.xlsx) workbook export via SheetJS
 * Exports both Compliance Summary (with 4-subcolumn scenario structure) and Scenario Totals.
 */
function exportExcelWorkbook() {
  if (!state.scenarios || state.scenarios.length === 0) {
    showToast('No Data', 'Please load project scenarios first.', '⚠️');
    return;
  }

  if (typeof XLSX === 'undefined') {
    showToast('Export Error', 'SheetJS library is not available.', '❌');
    return;
  }

  const activeScenariosList = state.scenarios.filter(s => {
    if (state.viewMode === 'single') return s.scenarioName === state.activeScenario;
    return state.selectedScenarios.includes(s.scenarioName);
  });

  if (activeScenariosList.length === 0) {
    showToast('No Scenarios Selected', 'Please select at least one scenario.', '⚠️');
    return;
  }

  const sheetData = [];

  // Title info
  const runId = (elements.csvRunId && elements.csvRunId.value.trim()) || 'RUN-001';
  const revision = (elements.csvRevision && elements.csvRevision.value.trim()) || 'Rev.0';
  sheetData.push(["O'Brien360 - EAp2-4/5 Performance Rating Method Compliance Report"]);
  sheetData.push([`Generated: ${new Date().toLocaleString()}`, `Run ID: ${runId}`, `Revision: ${revision}`]);
  sheetData.push([]); // blank separator

  // Header row 1: Scenario groups
  const headerGroupRow = ['End-Use Category'];
  activeScenariosList.forEach(sc => {
    headerGroupRow.push(sc.scenarioName, '', '', '');
  });
  sheetData.push(headerGroupRow);

  // Header row 2: Metric sub-headers
  const subHeaderRow = [''];
  activeScenariosList.forEach(() => {
    subHeaderRow.push('Elec Use [kWh]', 'Elec Dem [W]', 'Gas Use [therm]', 'Gas Dem [Btu/h]');
  });
  sheetData.push(subHeaderRow);

  // Column totals
  const columnTotals = activeScenariosList.map(() => [0, 0, 0, 0]);

  // Data rows
  FIXED_CATEGORIES.forEach(fc => {
    const row = [state.cleanLabels ? fc.label : fc.raw];
    activeScenariosList.forEach((sc, sIdx) => {
      const r = sc.categoryMap[fc.raw];
      const elecKwh    = r ? r.elecKwh    : 0;
      const elecDemW   = r ? r.elecDemW   : 0;
      const gasTherm   = r ? r.gasTherm   : 0;
      const gasDemBtuh = r ? r.gasDemBtuh : 0;

      columnTotals[sIdx][0] += elecKwh;
      columnTotals[sIdx][1] += elecDemW;
      columnTotals[sIdx][2] += gasTherm;
      columnTotals[sIdx][3] += gasDemBtuh;

      row.push(elecKwh, elecDemW);
      if (fc.electricityOnly) {
        row.push('-', '-');
      } else {
        row.push(gasTherm, gasDemBtuh);
      }
    });
    sheetData.push(row);
  });

  // Footer totals row
  const footerRow = ['TOTAL END USES'];
  activeScenariosList.forEach((sc, sIdx) => {
    const [sumElec, sumElecDem, sumGas, sumGasDem] = columnTotals[sIdx];
    footerRow.push(
      Number(sumElec.toFixed(2)),
      Number(sumElecDem.toFixed(2)),
      Number(sumGas.toFixed(2)),
      Number(sumGasDem.toFixed(2))
    );
  });
  sheetData.push(footerRow);

  // Create worksheet and apply merges
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: activeScenariosList.length * 4 } },
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }
  ];

  activeScenariosList.forEach((_, idx) => {
    const startCol = 1 + (idx * 4);
    ws['!merges'].push({ s: { r: 3, c: startCol }, e: { r: 3, c: startCol + 3 } });
  });

  const colWidths = [{ wch: 28 }];
  for (let i = 0; i < activeScenariosList.length * 4; i++) {
    colWidths.push({ wch: 16 });
  }
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Compliance Summary');

  // Scenario Summary sheet
  const summaryData = [
    ["O'Brien360 Scenario Energy Summaries"],
    [],
    ['Scenario', 'Total Elec [kWh]', 'Total Gas [therm]', 'Elec [kBtu]', 'Gas [kBtu]', 'Grand Total [kBtu]', 'Elec Share (%)', 'Gas Share (%)']
  ];
  activeScenariosList.forEach(sc => {
    const s = sc.summary;
    summaryData.push([
      sc.scenarioName,
      s.totalElectricity_kWh,
      s.totalNaturalGas_therm,
      s.totalElectricity_kBtu,
      s.totalNaturalGas_kBtu,
      s.grandTotal_kBtu,
      s.electricitySharePercent,
      s.naturalGasSharePercent
    ]);
  });
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Scenario Totals');

  const fileName = `OB360_Compliance_${runId}_${revision}.xlsx`.replace(/[^a-z0-9_\-\.]/gi, '_');
  XLSX.writeFile(wb, fileName);
  showToast('Excel Exported!', `Downloaded: ${fileName}`, '📊');
}

// =============================================================================
// CSV Export: Append rows to a persistent CSV log
// CSV columns: Run ID, Revision, Scenario, [Category x4 columns per scenario]
// Each row = one scenario's full data for that run
// =============================================================================

/**
 * Builds the wide 67-column CSV rows matching the compliance log template.
 * Two header rows + one data row per scenario in scope.
 * Scope: 'all' (ap, ab1-ab4, Baseline Avg) or 'active' (selected scenarios only).
 */
function buildCsvRowsForExport() {
  const runId    = elements.csvRunId.value.trim()    || 'RUN-001';
  const revision = elements.csvRevision.value.trim() || 'Rev.0';
  const scope    = elements.csvExportScope ? elements.csvExportScope.value : 'all';

  // Determine which scenarios to export
  let exportScenarios;
  if (scope === 'active') {
    exportScenarios = state.scenarios.filter(s => state.selectedScenarios.includes(s.scenarioName));
  } else {
    // 'all': canonical order — ap first, then ab1–ab4, then Baseline Avg
    const order = { 'ap': 1, 'ab1': 2, 'ab2': 3, 'ab3': 4, 'ab4': 5, 'baseline avg': 6 };
    exportScenarios = [...state.scenarios].sort((a, b) => {
      const ordA = order[a.scenarioName.toLowerCase()] || 99;
      const ordB = order[b.scenarioName.toLowerCase()] || 99;
      return ordA - ordB;
    });
  }

  if (exportScenarios.length === 0) return [];

  const rows = [];

  // Header row 1: category names (matching template exactly)
  rows.push(CSV_HEADER_ROW_1);

  // Header row 2: units
  rows.push(CSV_HEADER_ROW_2);

  // One data row per scenario
  exportScenarios.forEach(sc => {
    const cmap = sc.categoryMap || {};
    const row = [runId, revision, sc.scenarioName];

    // 26 electricity columns (kWh + W per category)
    CSV_ELECS.forEach(catRaw => {
      const r = cmap[catRaw];
      row.push(r ? formatNumRaw(r.elecKwh, 2) : '0.00');
      row.push(r ? formatNumRaw(r.elecDemW, 2) : '0.00');
    });

    // 6 natural gas columns (therm + Btu/h per category)
    CSV_GASES.forEach(catRaw => {
      const r = cmap[catRaw];
      row.push(r ? formatNumRaw(r.gasTherm, 2) : '0.00');
      row.push(r ? formatNumRaw(r.gasDemBtuh, 2) : '0.00');
    });

    rows.push(row);
  });

  return rows;
}

function downloadCSVLog() {
  if (state.scenarios.length === 0) {
    showToast('No Data', 'Load scenarios before exporting CSV.', '⚠️');
    return;
  }

  const rows = buildCsvRowsForExport();
  if (rows.length === 0) {
    showToast('No Scenarios', 'No scenarios matched the selected export scope.', '⚠️');
    return;
  }

  const csvContent = rows.map(row =>
    row.map(cell => {
      const s = String(cell);
      // Wrap in quotes if cell contains comma, quote, or newline
      return (s.includes(',') || s.includes('"') || s.includes('\n'))
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(',')
  ).join('\r\n');

  const rawFolder = state.selectedFolderName ||
    (elements.folderPathInput ? elements.folderPathInput.value.trim() : '') ||
    'Energy_Compliance';
  const filename = getCleanCsvFilename(rawFolder);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const dataRowCount = rows.length - 2; // exclude 2 header rows
  showToast('CSV Exported', `Saved: ${filename} — ${dataRowCount} scenario row(s). Paste into your compliance log in Excel.`, '💾');
}

function downloadChartImage() {
  if (!state.chartInstance) return;
  const a    = document.createElement('a');
  a.href     = state.chartInstance.toBase64Image();
  a.download = `energy_chart_${state.viewMode}_${state.energyUnit}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Chart Saved', 'Chart exported as PNG image', '🖼️');
}

function showToast(title, message, icon = '✅') {
  elements.toastTitle.textContent   = title;
  elements.toastMessage.textContent = message;
  elements.toast.querySelector('.toast-icon').textContent = icon;
  elements.toast.classList.remove('hidden');
  clearTimeout(elements.toast._timeout);
  elements.toast._timeout = setTimeout(() => { elements.toast.classList.add('hidden'); }, 4500);
}

// =============================================================================
// Event Listeners & Initialization
// =============================================================================

function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    const isDark = document.body.classList.contains('dark-theme');
    elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
    if (state.scenarios.length > 0) updateDashboard();
  });

  // Direct Path Scan
  elements.scanPathBtn.addEventListener('click', () => {
    const path = elements.folderPathInput.value.trim();
    if (path) scanFolderViaServer(path);
    else showToast('Path Missing', 'Please enter a valid folder path', '⚠️');
  });

  elements.useDefaultBtn.addEventListener('click', () => scanFolderViaServer(''));

  // Browser Folder / Files
  elements.browseFolderBtn.addEventListener('click', () => elements.browserFolderInput.click());
  elements.browserFolderInput.addEventListener('change', e => { if (e.target.files.length > 0) handleFileList(e.target.files); });
  elements.browseFilesBtn.addEventListener('click', () => elements.browserFilesInput.click());
  elements.browserFilesInput.addEventListener('change', e => { if (e.target.files.length > 0) handleFileList(e.target.files); });

  // Drag & Drop
  elements.dropZone.addEventListener('dragover', e => { e.preventDefault(); elements.dropZone.classList.add('dragover'); });
  elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('dragover'));
  elements.dropZone.addEventListener('drop', e => {
    e.preventDefault();
    elements.dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFileList(e.dataTransfer.files);
  });

  // Average Baselines Toggle
  if (elements.averageBaselinesToggle) {
    elements.averageBaselinesToggle.addEventListener('change', e => {
      toggleAverageBaselines(e.target.checked);
    });
  }

  // Scenario Bulk Actions
  elements.selectAllScenariosBtn.addEventListener('click', () => {
    state.selectedScenarios = state.scenarios.map(s => s.scenarioName);
    renderScenariosPills(); updateDashboard();
  });
  elements.deselectAllScenariosBtn.addEventListener('click', () => {
    state.selectedScenarios = [state.scenarios[0].scenarioName];
    renderScenariosPills(); updateDashboard();
  });

  // View Mode
  elements.viewModeControl.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.viewModeControl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.viewMode = btn.dataset.value;
      elements.singleScenarioGroup.classList.toggle('hidden', state.viewMode !== 'single');
      elements.baselineScenarioGroup.classList.toggle('hidden', state.viewMode !== 'variance');
      updateDashboard();
    });
  });

  // Unit
  elements.unitControl.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.unitControl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.energyUnit = btn.dataset.unit;
      updateDashboard();
    });
  });

  // Fuel Type
  elements.fuelSelect.addEventListener('change', e => { state.fuelType = e.target.value; updateDashboard(); });

  // Chart Type
  elements.chartTypeSelect.addEventListener('change', e => { state.chartType = e.target.value; updateDashboard(); });

  // Scenario Selectors
  elements.singleScenarioSelect.addEventListener('change', e => { state.activeScenario = e.target.value; updateDashboard(); });
  elements.baselineScenarioSelect.addEventListener('change', e => { state.baselineScenario = e.target.value; updateDashboard(); });

  // Options
  elements.cleanLabelsToggle.addEventListener('change', e => { state.cleanLabels = e.target.checked; updateDashboard(); });
  elements.hideZeroesToggle.addEventListener('change', e => { state.hideZeroes = e.target.checked; updateDashboard(); });

  // Export Buttons
  elements.copyExcelBtn.addEventListener('click', copyTableToExcel);
  if (elements.exportExcelBtn) {
    elements.exportExcelBtn.addEventListener('click', exportExcelWorkbook);
  }
  elements.exportCsvBtn.addEventListener('click', downloadCSVLog);
  elements.downloadChartBtn.addEventListener('click', downloadChartImage);
}

// =============================================================================
// Initialization
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  const online = await checkServerStatus();
  if (online) scanFolderViaServer('');
});
