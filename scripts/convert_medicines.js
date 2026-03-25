import fs from 'fs';

const csvPath = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/MEDICINE_LIST.csv';
const outPath = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/data/medicines.ts';

const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split(/\r?\n/);

let output = `export const MEDICINES_LIST: string[] = [\n`;
let added = new Set();

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Format: "1,BAMBAC 20MG TAB (30s),TAB,2826,,,"
    // We want to extract the MED_DESC column. In CSV, columns are separated by commas.
    // We need to handle quotes if they exist.
    // Basic split by comma. If there's a comma inside quotes, it's more complex, but looking at the data, it seems to not have many quotes except maybe in some places.

    // A simpler way is to match by regex or just do a simple split.
    let columns = [];
    let currentString = '';
    let insideQuotes = false;

    for (let char of line) {
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            columns.push(currentString);
            currentString = '';
        } else {
            currentString += char;
        }
    }
    columns.push(currentString);

    // Usually the 2nd column (index 1) is the medicine description if the first column is an empty or index.
    // Wait, let's look at line 1: `   ,MED_DESC,MED_TYPE,MED_ID,TERMINAL_ID,FED_BY,DATETIME` -> index 1 is MED_DESC
    // line 2: `1,BAMBAC 20MG TAB (30s),TAB,2826,,,` -> index 1 is BAMBAC 20MG TAB (30s)

    if (columns.length > 1) {
        let medName = columns[1].trim();
        if (medName && !added.has(medName)) {
            added.add(medName);
            // escape quotes and backslashes
            medName = medName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            output += `  '${medName}',\n`;
        }
    }
}

output += `];\n`;

fs.writeFileSync(outPath, output);
console.log('Successfully extracted ' + added.size + ' medicines to ' + outPath);
