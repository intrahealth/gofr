/* eslint-disable no-console */
const fs = require('fs');
const csv = require('fast-csv');

const OUTPUT_HEADERS = [
  'facility',
  'alt_name',
  'code',
  'lat',
  'long',
  'type',
  'status',
  'ownership',
  'phone',
  'email',
  'fax',
  'website',
  'level1',
  'level2',
  'level3',
  'level4',
  'level5',
  'level6',
  'level7',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      continue;
    }
    const key = arg.replace(/^--/, '');
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function mapStatus(dictionaryStatus) {
  const value = String(dictionaryStatus || '').trim();
  const mapping = {
    Operational: 'active',
    Closed: 'inactive',
    Suspended: 'suspended',
    Pending: 'active',
    UnderConstruction: 'active',
    UnderRenovation: 'active',
  };
  return mapping[value] || value;
}

function quoteCSV(value) {
  if (value === undefined || value === null) {
    return '';
  }
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function writeRows(outputPath, rows) {
  const lines = [];
  lines.push(OUTPUT_HEADERS.join(','));
  rows.forEach((row) => {
    lines.push(OUTPUT_HEADERS.map(header => quoteCSV(row[header])).join(','));
  });
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
}

function run() {
  const args = parseArgs(process.argv);
  const input = args.input || args.i;
  const output = args.output || args.o;
  const country = args.country || 'Cambodia';

  if (!input || !output) {
    console.error('Usage: node transformFacilityDictionaryToGofrCsv.js --input <path-to-csv> --output <path-to-csv> [--country Cambodia]');
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  const outRows = [];
  let inputRows = 0;

  csv
    .fromPath(input, { headers: true, trim: true })
    .on('data', (row) => {
      inputRows += 1;
      outRows.push({
        facility: row.facility_name || '',
        alt_name: '',
        code: row.hfid || '',
        lat: row.gps_latitude || '',
        long: row.gps_longitude || '',
        type: row.facility_type || '',
        status: mapStatus(row.operational_status),
        ownership: row.ownership_type || '',
        phone: row.contact_number || '',
        email: '',
        fax: '',
        website: row.google_maps_link || '',
        level1: country,
        level2: row.province_code || '',
        level3: row.district_code || '',
        level4: row.od_code || '',
        level5: row.commune_code || '',
        level6: row.village_code || '',
        level7: '',
      });
    })
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .on('end', () => {
      writeRows(output, outRows);
      console.log(JSON.stringify({
        inputRows,
        outputRows: outRows.length,
        output,
      }, null, 2));
    });
}

run();
