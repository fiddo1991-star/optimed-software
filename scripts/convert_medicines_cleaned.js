import fs from 'fs';

const csvPath1 = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/medicine_cleaned.csv';
const csvPath2 = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/pakistan_medicine_database.csv';
const outPath = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/data/medicines.ts';

const csv1 = fs.readFileSync(csvPath1, 'utf-8');
const lines1 = csv1.split(/\r?\n/);

const csv2 = fs.readFileSync(csvPath2, 'utf-8');
const lines2 = csv2.split(/\r?\n/);

let output = `export const MEDICINES_LIST: string[] = [\n`;
let added = new Set();

const processLines = (lines) => {
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        let medName = line.replace(/^"|"$/g, '');

        // Attempt parsing columns if it's a multi-column csv format, but since both seem to just be a list, we'll try to split and take the first or second.
        // Actually the files seem to just have one column or the rest is empty. Let's just use the logic from earlier or keep it simple.

        // In `medicine_cleaned.csv` it was single column, `pakistan_medicine_database.csv` looks like a single column as well 'Medicine,Cap. A-MAX...'. 
        let columns = [];
        let currentString = '';
        let insideQuotes = false;
        for (let char of line) {
            if (char === '"') insideQuotes = !insideQuotes;
            else if (char === ',' && !insideQuotes) { columns.push(currentString); currentString = ''; }
            else currentString += char;
        }
        columns.push(currentString);

        // If it has multiple columns, let's just take the first one since it looks like 'Cap. A-MAX (Vitamin A) 10000 IU' is the full line. 
        medName = columns[0].trim().replace(/^"|"$/g, '');

        if (medName && !added.has(medName)) {
            added.add(medName);
            medName = medName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            output += `  '${medName}',\n`;
        }
    }
};

processLines(lines1);
processLines(lines2);

output += `];\n`;

fs.writeFileSync(outPath, output);
console.log('Successfully extracted ' + added.size + ' medicines to ' + outPath);
