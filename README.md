# OB360 Tools

A collection of internal engineering and sustainability tools developed for **O'Brien360**.

---

## Tools Directory

### 1. [CBECC Result Tool (`CBECC_result_tool/`)](CBECC_result_tool/)
**Energy Performance Rating Compliance Tool**
- Extracts and aggregates CBECC / LEED EAp2-4/5 Performance Rating Method compliance data from simulation output HTML reports (`ap`, `ab1`, `ab2`, `ab3`, `ab4`).
- Parses end-use breakdowns for:
  - **Electricity**: Energy Use (kWh) and Demand (W)
  - **Natural Gas**: Energy Use (therms) and Demand (Btu/h)
- Supports dynamic baseline averaging (averaging ab1–ab4 across all categories and totals).
- Exports formatted reports matching the LEED standard template:
  - **CSV Export**: 67-column standardized format matching `2394-LEED MDL- Results.csv`.
  - **Excel Export**: Multi-tab formatted `.xlsx` spreadsheet.
- Visual summary with interactive Chart.js graphs and breakdown tables.
- Runs with zero required external Python dependencies (pure Python standard library).

---

## Quick Start for Team Members

### Prerequisites
- [Python 3.8+](https://www.python.org/downloads/) (standard installation with "Add python.exe to PATH" checked).

### Running the Tool (3 Ways)

#### Option 1: Double-Click Launcher (Windows - Easiest)
1. Navigate to `CBECC_result_tool/`.
2. Double-click **`run_tool.bat`**.
3. Your default browser will automatically open to `http://localhost:8080`.

#### Option 2: Via Terminal / Command Prompt
```bash
cd CBECC_result_tool
python server.py
```
Then visit `http://localhost:8080` in your web browser.

#### Option 3: Standalone Browser Mode (No Server)
Double-click `CBECC_result_tool/index.html` to open directly in any modern browser (Chrome, Edge, Firefox). You can drag and drop your `.htm` simulation files or select them using the file picker.

---

## Running Tests
To run the automated validation test suite:
```bash
cd CBECC_result_tool
python -m unittest test_app.py -v
```
