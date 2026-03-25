import fs from 'fs';

const csvPath = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/icd10_hospital_master_4500.csv';
const outPath = 'c:/Users/Fahad Tariq/Downloads/Clinic Software/clinical-software/src/data/icdCodes.ts';

const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split(/\r?\n/);

let output = `export interface ICDCode {
    code: string;
    description: string;
    category: string;
}

export const ICD_CODES: ICDCode[] = [\n`;

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lastCommaIndex = line.lastIndexOf(',');
    if (lastCommaIndex === -1) continue;

    let disease = line.substring(0, lastCommaIndex).replace(/^"|"$/g, '');
    // escape backslashes and single quotes
    disease = disease.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const code = line.substring(lastCommaIndex + 1).trim().replace(/^"|"$/g, '');

    output += `    { code: '${code}', description: '${disease}', category: 'General' },\n`;
}

output += `];\n`;

fs.writeFileSync(outPath, output);
console.log('Successfully written to ' + outPath);
