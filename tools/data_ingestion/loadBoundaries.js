#!/usr/bin/env node
/**
 * loadBoundaries.js
 *
 * Loads GeoJSON administrative boundary polygons into HAPI FHIR by patching
 * jurisdiction Location resources with the location-boundary-geojson extension.
 *
 * Usage:
 *   node loadBoundaries.js --geojson <path-to-geojson> --nameProperty <property> \
 *                          --partition <partition-name> --fhir <fhir-base-url>
 *
 * Example:
 *   node loadBoundaries.js \
 *     --geojson ./khm_admin2.geojson \
 *     --nameProperty adm2_name \
 *     --partition DEFAULT \
 *     --fhir http://localhost:8080/fhir
 *
 * GeoJSON sources (free):
 *   - HDX: https://data.humdata.org/dataset/cod-ab-khm
 *   - GADM: https://gadm.org/download_country.html (choose GeoJSON, level 2 or 3)
 *
 * The script fetches ALL jurisdiction Locations from HAPI, normalises names,
 * matches them to GeoJSON features, and PATCHes each one with the boundary.
 * Unmatched features are reported at the end.
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf('--' + name);
  return idx !== -1 ? args[idx + 1] : null;
}

const geojsonPath  = getArg('geojson')   || null;
const nameProperty = getArg('nameProperty') || 'adm2_name';
const partition    = getArg('partition') || 'DEFAULT';
const fhirBase     = getArg('fhir')      || 'http://localhost:8080/fhir';
const typeCode     = getArg('typeCode')  || 'urn:ihe:iti:mcsd:2019:jurisdiction';
const dryRun       = args.includes('--dry-run');

if (!geojsonPath) {
  console.error('ERROR: --geojson <path> is required');
  console.error('Usage: node loadBoundaries.js --geojson <path> [--nameProperty <prop>] [--partition <name>] [--fhir <url>] [--dry-run]');
  process.exit(1);
}

if (!fs.existsSync(geojsonPath)) {
  console.error('ERROR: GeoJSON file not found:', geojsonPath);
  process.exit(1);
}

const BOUNDARY_EXT = 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalise(name) {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/[-_]+/g, ' ')       // hyphens → spaces
    .replace(/\s+/g, ' ')         // collapse whitespace
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip diacritics
}

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      }
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = mod.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        } else {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function fetchAll(url) {
  let results = [];
  let next = url;
  while (next) {
    const bundle = await request('GET', next, null);
    for (const e of (bundle.entry || [])) results.push(e.resource);
    const nextLink = (bundle.link || []).find(l => l.relation === 'next');
    next = nextLink ? nextLink.url : null;
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Loading GeoJSON from:', geojsonPath);
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];
  console.log(`  ${features.length} features in file, using property "${nameProperty}"`);

  console.log(`\nFetching all jurisdiction Locations from HAPI partition "${partition}"...`);
  const jurisdictions = await fetchAll(
    `${fhirBase}/${partition}/Location?type=${encodeURIComponent(typeCode)}&_count=200`
  );
  console.log(`  ${jurisdictions.length} jurisdiction Locations found`);

  // Build name → Location map (normalised)
  const locationByName = new Map();
  for (const loc of jurisdictions) {
    const key = normalise(loc.name);
    if (!locationByName.has(key)) {
      locationByName.set(key, loc);
    } else {
      // Duplicate name — keep both under a list for reporting
      const existing = locationByName.get(key);
      if (!Array.isArray(existing)) {
        locationByName.set(key, [existing, loc]);
      } else {
        existing.push(loc);
      }
    }
  }

  let matched = 0, skipped = 0, errors = 0;
  const unmatched = [];

  for (const feature of features) {
    const rawName = feature.properties && feature.properties[nameProperty];
    if (!rawName) {
      console.warn('  SKIP: feature has no property', nameProperty, JSON.stringify(feature.properties));
      skipped++;
      continue;
    }

    const key = normalise(rawName);
    const loc = locationByName.get(key);

    if (!loc) {
      unmatched.push(rawName);
      continue;
    }

    if (Array.isArray(loc)) {
      console.warn(`  WARN: multiple Locations named "${rawName}" — skipping (ambiguous)`);
      skipped++;
      continue;
    }

    // Encode single feature geometry as GeoJSON FeatureCollection
    const fc = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: feature.geometry, properties: {} }]
    };
    const encoded = Buffer.from(JSON.stringify(fc)).toString('base64');

    // Build extension (replace existing if present, otherwise add)
    const extensions = (loc.extension || []).filter(e => e.url !== BOUNDARY_EXT);
    extensions.push({
      url: BOUNDARY_EXT,
      valueAttachment: {
        contentType: 'application/geo+json',
        data: encoded
      }
    });

    const patch = {
      resourceType: 'Parameters',
      parameter: [{
        name: 'operation',
        part: [
          { name: 'type', valueCode: 'replace' },
          { name: 'path', valueString: 'Location.extension' },
          { name: 'value', valueBase64Binary: null }  // placeholder — see below
        ]
      }]
    };

    // Use a full-resource PUT instead of PATCH for simplicity
    const updated = Object.assign({}, loc, { extension: extensions });

    if (dryRun) {
      console.log(`  [DRY-RUN] Would update: ${loc.name} (${loc.id})`);
      matched++;
      continue;
    }

    try {
      await request(
        'PUT',
        `${fhirBase}/${partition}/Location/${loc.id}`,
        JSON.stringify(updated)
      );
      console.log(`  OK: ${loc.name} (${loc.id})`);
      matched++;
    } catch (err) {
      console.error(`  ERROR: ${loc.name} (${loc.id}): ${err.message}`);
      errors++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`  Matched & updated : ${matched}`);
  console.log(`  Skipped (ambiguous): ${skipped}`);
  console.log(`  Errors            : ${errors}`);
  if (unmatched.length) {
    console.log(`  Unmatched features (${unmatched.length}):`);
    unmatched.forEach(n => console.log(`    - ${n}`));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
