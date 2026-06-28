/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

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

function isISODate(value) {
  if (!value) {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.toISOString().slice(0, 10) === value;
}

function isBooleanString(value) {
  if (typeof value === 'boolean') {
    return true;
  }
  if (!value) {
    return false;
  }
  const cleaned = String(value).trim().toLowerCase();
  return cleaned === 'true' || cleaned === 'false';
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value).trim().toLowerCase() === 'true';
}

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function checkPattern(value, regex) {
  if (isEmpty(value)) {
    return true;
  }
  return regex.test(String(value).trim());
}

function validateRow(row, state, rowNumber) {
  const errors = [];

  const requiredFields = [
    'hfid',
    'facility_name',
    'facility_type',
    'ownership_type',
    'province_code',
    'district_code',
    'commune_code',
    'village_code',
    'gps_latitude',
    'gps_longitude',
    'operational_status',
    'start_date',
  ];

  requiredFields.forEach((field) => {
    if (isEmpty(row[field])) {
      errors.push(`${field} is required`);
    }
  });

  if (!checkPattern(row.hfid, /^\d{6}$/)) {
    errors.push('hfid must be a 6-digit numeric string');
  }

  if (!isEmpty(row.hfid) && state.hfidSeen.has(row.hfid)) {
    errors.push('hfid must be unique');
  }

  if (!isEmpty(row.hfid)) {
    state.hfidSeen.add(row.hfid);
  }

  if (!checkPattern(row.legacy_hf_id, /^H\d{4}$/)) {
    errors.push('legacy_hf_id must match pattern H####');
  }

  if (!checkPattern(row.legacy_hf_code, /^\d{6}$/)) {
    errors.push('legacy_hf_code must be 6 numeric digits');
  }

  if (!checkPattern(row.province_code, /^\d{2}$/)) {
    errors.push('province_code must be 2 numeric digits');
  }

  if (!checkPattern(row.district_code, /^\d{4}$/)) {
    errors.push('district_code must be 4 numeric digits');
  }

  if (!isEmpty(row.od_code) && !checkPattern(row.od_code, /^\d{4}$/)) {
    errors.push('od_code must be 4 numeric digits');
  }

  if (!checkPattern(row.commune_code, /^\d{6}$/)) {
    errors.push('commune_code must be 6 numeric digits');
  }

  if (!checkPattern(row.village_code, /^\d{8}$/)) {
    errors.push('village_code must be 8 numeric digits');
  }

  const lat = Number(row.gps_latitude);
  const long = Number(row.gps_longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('gps_latitude must be numeric and in range -90 to 90');
  }
  if (Number.isNaN(long) || long < -180 || long > 180) {
    errors.push('gps_longitude must be numeric and in range -180 to 180');
  }

  if (!checkPattern(row.contact_number, /^\+?\d{7,20}$/)) {
    errors.push('contact_number should be E.164 compatible (digits with optional leading +)');
  }

  if (!isISODate(row.start_date)) {
    errors.push('start_date must be ISO format YYYY-MM-DD');
  }

  if (!isEmpty(row.closure_date) && !isISODate(row.closure_date)) {
    errors.push('closure_date must be ISO format YYYY-MM-DD');
  }

  if (!isEmpty(row.licence_issue_date) && !isISODate(row.licence_issue_date)) {
    errors.push('licence_issue_date must be ISO format YYYY-MM-DD');
  }

  if (!isEmpty(row.licence_expiry_date) && !isISODate(row.licence_expiry_date)) {
    errors.push('licence_expiry_date must be ISO format YYYY-MM-DD');
  }

  if (
    isISODate(row.start_date)
    && isISODate(row.closure_date)
    && row.closure_date < row.start_date
  ) {
    errors.push('closure_date must be greater than or equal to start_date');
  }

  if (
    isISODate(row.licence_issue_date)
    && isISODate(row.licence_expiry_date)
    && row.licence_expiry_date < row.licence_issue_date
  ) {
    errors.push('licence_expiry_date must be greater than or equal to licence_issue_date');
  }

  const status = String(row.operational_status || '').trim();
  if (status === 'Closed') {
    if (isEmpty(row.closure_date)) {
      errors.push('closure_date is required when operational_status is Closed');
    }
    if (isEmpty(row.closure_reason)) {
      errors.push('closure_reason is required when operational_status is Closed');
    }
  }

  if (String(row.closure_reason || '').trim() === 'MergedWithAnotherFacility' && isEmpty(row.successor_hfid)) {
    errors.push('successor_hfid is required when closure_reason is MergedWithAnotherFacility');
  }

  if (!isEmpty(row.successor_hfid) && !checkPattern(row.successor_hfid, /^\d{6}$/)) {
    errors.push('successor_hfid must be a 6-digit numeric string');
  }

  const ownershipType = String(row.ownership_type || '').trim();
  if (ownershipType === 'Private') {
    const hasHsd = !isEmpty(row.hsd_facility_id);
    const hasOws = !isEmpty(row.ows_registration_id);
    if (!hasHsd && !hasOws) {
      errors.push('Private facility requires either hsd_facility_id or ows_registration_id');
    }
    if (hasHsd && hasOws) {
      errors.push('hsd_facility_id and ows_registration_id are mutually exclusive');
    }
  }

  if (!isEmpty(row.is_sub_facility) && !isBooleanString(row.is_sub_facility)) {
    errors.push('is_sub_facility must be true or false when provided');
  }

  if (!isEmpty(row.is_sub_facility) && isBooleanString(row.is_sub_facility) && toBoolean(row.is_sub_facility)) {
    if (isEmpty(row.parent_hfid)) {
      errors.push('parent_hfid is required when is_sub_facility is true');
    }
    if (isEmpty(row.sub_facility_type)) {
      errors.push('sub_facility_type is required when is_sub_facility is true');
    }
  }

  if (!isEmpty(row.parent_hfid) && !checkPattern(row.parent_hfid, /^\d{6}$/)) {
    errors.push('parent_hfid must be a 6-digit numeric string');
  }

  return {
    rowNumber,
    hfid: row.hfid,
    errors,
  };
}

function writeReport(outputPath, report) {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}

function run() {
  const args = parseArgs(process.argv);
  const input = args.input || args.i;
  const output = args.output || args.o;

  if (!input) {
    console.error('Usage: node validateFacilityDictionaryCsv.js --input <path-to-csv> [--output <path-to-json>]');
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  const state = {
    hfidSeen: new Set(),
    rows: 0,
    invalidRows: 0,
    validations: [],
  };

  csv
    .fromPath(input, { headers: true, trim: true })
    .on('data', (row) => {
      state.rows += 1;
      const result = validateRow(row, state, state.rows + 1);
      if (result.errors.length > 0) {
        state.invalidRows += 1;
        state.validations.push(result);
      }
    })
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .on('end', () => {
      const summary = {
        input: path.resolve(input),
        totalRows: state.rows,
        invalidRows: state.invalidRows,
        validRows: state.rows - state.invalidRows,
        passed: state.invalidRows === 0,
        errors: state.validations,
      };

      if (output) {
        writeReport(output, summary);
        console.log(`Validation report written to ${output}`);
      }

      console.log(JSON.stringify({
        totalRows: summary.totalRows,
        invalidRows: summary.invalidRows,
        validRows: summary.validRows,
        passed: summary.passed,
      }, null, 2));

      process.exit(summary.passed ? 0 : 2);
    });
}

run();
