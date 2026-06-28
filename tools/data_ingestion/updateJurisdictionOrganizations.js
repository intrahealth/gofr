#!/usr/bin/env node

/**
 * Script to scan HAPI FHIR server for jurisdiction Locations and normalize
 * the full mCSD jurisdiction pair shape.
 *
 * According to mCSD, jurisdictions are represented as a Location plus a
 * paired Organization. This script ensures each jurisdiction has:
 *   - a canonical managing Organization (Organization/org-<Location.id>)
 *   - the required local + IHE type codings on both resources
 *   - an Organization hierarchy extension that mirrors Location.partOf
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'http://localhost:8080/fhir/';
const PARTITION = process.env.PARTITION || 'DEFAULT';
const DRY_RUN = process.env.DRY_RUN === 'true';

const fhirClient = axios.create({
  baseURL: `${FHIR_BASE_URL}${PARTITION}/`,
  timeout: 30000,
});

const IHE_URI_SYSTEM = 'urn:ietf:rfc:3986';
const IHE_JURISDICTION_CODE = 'urn:ihe:iti:mcsd:2019:jurisdiction';
const JURISDICTION_TYPE_SYS = 'http://gofr.org/fhir/CodeSystem/gofr-jurisdiction-type';
const JURISDICTION_LOCATION_PROFILE = 'http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation';
const GOFR_JURISDICTION_PROFILE = 'http://gofr.org/fhir/StructureDefinition/gofr-jurisdiction';
const ORGANIZATION_PROFILE = 'http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization';
const JURISDICTION_ORGANIZATION_PROFILE = 'http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization';
const ORG_HIERARCHY_EXT = 'http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension';
const ORG_HIERARCHY_TYPE_SYS = 'http://gofr.org/fhir/CodeSystem/gofr-organization-hiearchy-type-codesystem';

const LEVEL_TO_JURISDICTION_TYPE = {
  province: 'region',
  district: 'district',
  od: 'district',
  commune: 'county',
  village: 'county',
};

const LEVEL_LABEL = {
  province: 'Province',
  district: 'District',
  od: 'Od',
  commune: 'Commune',
  village: 'Village',
};

// Utility functions
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function error(message) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

async function readOrganization(id) {
  try {
    const response = await fhirClient.get(`Organization/${id}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    error(`Failed to read Organization ${id}: ${err.message}`);
    throw err;
  }
}

function deepClone(resource) {
  return JSON.parse(JSON.stringify(resource || {}));
}

function mergeProfiles(existingProfiles, requiredProfiles) {
  const profiles = [];
  const seen = new Set();
  for (const profile of requiredProfiles.concat(existingProfiles || [])) {
    if (!profile || seen.has(profile)) {
      continue;
    }
    seen.add(profile);
    profiles.push(profile);
  }
  return profiles;
}

function entryHasCoding(typeEntry, system, code) {
  if (!typeEntry || !Array.isArray(typeEntry.coding)) {
    return false;
  }
  return typeEntry.coding.some((coding) => {
    if (!coding || coding.system !== system) {
      return false;
    }
    return code ? coding.code === code : true;
  });
}

function normalizeTypeEntries(existingTypes, requiredTypes) {
  const extras = Array.isArray(existingTypes)
    ? existingTypes.filter((typeEntry) => {
        if (entryHasCoding(typeEntry, JURISDICTION_TYPE_SYS)) {
          return false;
        }
        return !entryHasCoding(typeEntry, IHE_URI_SYSTEM, IHE_JURISDICTION_CODE);
      })
    : [];
  return requiredTypes.concat(extras);
}

function inferJurisdictionLevel(locationId) {
  if (!locationId || !locationId.includes('-')) {
    return null;
  }
  const level = locationId.split('-')[0];
  return LEVEL_TO_JURISDICTION_TYPE[level] ? level : null;
}

function getJurisdictionTypeCode(location) {
  if (Array.isArray(location.type)) {
    for (const typeEntry of location.type) {
      if (!Array.isArray(typeEntry.coding)) {
        continue;
      }
      for (const coding of typeEntry.coding) {
        if (coding && coding.system === JURISDICTION_TYPE_SYS && coding.code) {
          return coding.code;
        }
      }
    }
  }
  const level = inferJurisdictionLevel(location.id);
  return level ? LEVEL_TO_JURISDICTION_TYPE[level] : null;
}

function buildJurisdictionTypes(level, jurisdictionTypeCode) {
  return [
    {
      coding: [
        {
          system: JURISDICTION_TYPE_SYS,
          code: jurisdictionTypeCode,
          display: jurisdictionTypeCode.charAt(0).toUpperCase() + jurisdictionTypeCode.slice(1),
        },
      ],
      text: LEVEL_LABEL[level] || level,
    },
    {
      coding: [
        {
          system: IHE_URI_SYSTEM,
          code: IHE_JURISDICTION_CODE,
          display: 'Jurisdiction',
        },
      ],
      text: 'Jurisdiction',
    },
  ];
}

function buildHierarchyExtension(parentOrganizationReference) {
  return {
    url: ORG_HIERARCHY_EXT,
    extension: [
      {
        url: 'part-of',
        valueReference: {
          reference: parentOrganizationReference,
        },
      },
      {
        url: 'hierarchy-type',
        valueCodeableConcept: {
          coding: [
            {
              system: ORG_HIERARCHY_TYPE_SYS,
              code: 'operational',
              display: 'Operational',
            },
          ],
          text: 'Operational',
        },
      },
    ],
  };
}

function getCanonicalOrganizationId(locationId) {
  return `org-${locationId}`;
}

function getParentOrganizationReference(location) {
  const parentReference = location.partOf && location.partOf.reference;
  if (!parentReference || !parentReference.startsWith('Location/')) {
    return null;
  }
  return `Organization/org-${parentReference.slice('Location/'.length)}`;
}

function normalizeJurisdictionLocation(location) {
  const level = inferJurisdictionLevel(location.id);
  const jurisdictionTypeCode = getJurisdictionTypeCode(location);
  if (!level || !jurisdictionTypeCode) {
    throw new Error(`Cannot infer jurisdiction type for Location/${location.id}`);
  }

  const normalized = deepClone(location);
  normalized.meta = normalized.meta || {};
  normalized.meta.profile = mergeProfiles(normalized.meta.profile, [
    JURISDICTION_LOCATION_PROFILE,
    GOFR_JURISDICTION_PROFILE,
  ]);
  normalized.type = normalizeTypeEntries(normalized.type, buildJurisdictionTypes(level, jurisdictionTypeCode));
  normalized.managingOrganization = {
    reference: `Organization/${getCanonicalOrganizationId(location.id)}`,
    display: `Managing Organization for ${location.name}`,
  };
  return normalized;
}

function buildJurisdictionOrganization(location, existingOrganization) {
  const level = inferJurisdictionLevel(location.id);
  const jurisdictionTypeCode = getJurisdictionTypeCode(location);
  if (!level || !jurisdictionTypeCode) {
    throw new Error(`Cannot infer jurisdiction type for Organization/org-${location.id}`);
  }

  const organization = existingOrganization ? deepClone(existingOrganization) : {};
  organization.resourceType = 'Organization';
  organization.id = getCanonicalOrganizationId(location.id);
  organization.meta = organization.meta || {};
  organization.meta.profile = mergeProfiles(organization.meta.profile, [
    ORGANIZATION_PROFILE,
    JURISDICTION_ORGANIZATION_PROFILE,
  ]);
  organization.name = location.name;
  if (Array.isArray(location.alias) && location.alias.length > 0) {
    organization.alias = location.alias;
  } else {
    delete organization.alias;
  }
  organization.active = Object.prototype.hasOwnProperty.call(organization, 'active') ? organization.active : true;
  organization.type = normalizeTypeEntries(organization.type, buildJurisdictionTypes(level, jurisdictionTypeCode));

  const otherExtensions = Array.isArray(organization.extension)
    ? organization.extension.filter((extension) => extension && extension.url !== ORG_HIERARCHY_EXT)
    : [];
  const parentOrganizationReference = getParentOrganizationReference(location);
  if (parentOrganizationReference) {
    otherExtensions.push(buildHierarchyExtension(parentOrganizationReference));
  }
  if (otherExtensions.length > 0) {
    organization.extension = otherExtensions;
  } else {
    delete organization.extension;
  }

  return organization;
}

async function upsertOrganization(organization, existed) {
  const action = existed ? 'update' : 'create';

  try {
    if (DRY_RUN) {
      log(`[DRY RUN] Would ${action} Organization: ${organization.id}`);
      return organization;
    }

    const response = await fhirClient.put(`Organization/${organization.id}`, organization);
    log(`${existed ? 'Updated' : 'Created'} Organization: ${organization.id}`);
    return response.data;
  } catch (err) {
    error(`Failed to ${action} Organization ${organization.id}: ${err.message}`);
    throw err;
  }
}

async function upsertLocation(location) {
  try {
    if (DRY_RUN) {
      log(`[DRY RUN] Would update Location: ${location.id} with normalized jurisdiction metadata`);
      return location;
    }

    const response = await fhirClient.put(`Location/${location.id}`, location);
    log(`Updated Location: ${location.id} with normalized jurisdiction metadata`);
    return response.data;
  } catch (err) {
    error(`Failed to update Location ${location.id}: ${err.message}`);
    throw err;
  }
}

function isJurisdiction(location) {
  // Check physicalType for 'jdn' code
  if (location.physicalType && location.physicalType.coding && location.physicalType.coding[0] && location.physicalType.coding[0].code === 'jdn') {
    return true;
  }

  // Check type for jurisdiction coding
  if (location.type) {
    for (const typeEntry of location.type) {
      if (typeEntry.coding) {
        for (const coding of typeEntry.coding) {
          if (
            coding.system === 'urn:ietf:rfc:3986' &&
            coding.code === 'urn:ihe:iti:mcsd:2019:jurisdiction'
          ) {
            return true;
          }
          if (coding.system === JURISDICTION_TYPE_SYS) {
            return true;
          }
        }
      }
    }
  }

  // Check profile
  if (location.meta && location.meta.profile && location.meta.profile.includes(JURISDICTION_LOCATION_PROFILE)) {
    return true;
  }

  return false;
}

async function main() {
  log(`Starting jurisdiction Organization update script`);
  log(`FHIR Base URL: ${FHIR_BASE_URL}`);
  log(`Partition: ${PARTITION}`);
  log(`Dry Run: ${DRY_RUN}`);
  log('---');

  let stats = {
    totalLocations: 0,
    jurisdictionsFound: 0,
    jurisdictionsWithOrg: 0,
    jurisdictionsMissingOrg: 0,
    organizationsCreated: 0,
    organizationsUpdated: 0,
    locationsUpdated: 0,
    errors: 0,
  };

  try {
    // Get all Locations with pagination
    let pageCount = 1;
    let allLocations = [];
    let nextUrl = null;

    log('Fetching Locations from FHIR server...');

    do {
      let query = { _count: 100 };
      let response;

      if (nextUrl) {
        // Use the 'next' link from Bundle pagination
        response = await fhirClient.get(nextUrl);
      } else {
        response = await fhirClient.get('Location', { params: query });
      }

      if (response.data && response.data.entry) {
        allLocations = allLocations.concat(response.data.entry.map(e => e.resource));
        log(`Fetched ${response.data.entry.length} locations (page ${pageCount})`);
      }

      // Look for 'next' link
      nextUrl = null;
      if (response.data && response.data.link) {
        const nextLink = response.data.link.find(link => link.relation === 'next');
        if (nextLink) {
          nextUrl = nextLink.url;
        }
      }

      pageCount++;
    } while (nextUrl);

    stats.totalLocations = allLocations.length;
    log(`Total Locations fetched: ${stats.totalLocations}`);
    log('---');

    // Process jurisdictions
    log('Scanning for jurisdictions...');

    for (const location of allLocations) {
      if (!isJurisdiction(location)) {
        continue;
      }

      stats.jurisdictionsFound++;
      const canonicalOrganizationId = getCanonicalOrganizationId(location.id);
      const hasManagingOrg = location.managingOrganization && location.managingOrganization.reference;
      if (hasManagingOrg && location.managingOrganization.reference === `Organization/${canonicalOrganizationId}`) {
        stats.jurisdictionsWithOrg++;
      } else {
        stats.jurisdictionsMissingOrg++;
        log(`Jurisdiction Location needs normalized managingOrganization: ${location.id} (${location.name})`);
      }

      try {
        const normalizedLocation = normalizeJurisdictionLocation(location);
        const existingOrganization = await readOrganization(canonicalOrganizationId);
        const normalizedOrganization = buildJurisdictionOrganization(normalizedLocation, existingOrganization);

        await upsertOrganization(normalizedOrganization, Boolean(existingOrganization));
        if (existingOrganization) {
          stats.organizationsUpdated++;
        } else {
          stats.organizationsCreated++;
        }

        await upsertLocation(normalizedLocation);
        stats.locationsUpdated++;
      } catch (err) {
        error(`Failed to normalize jurisdiction pair for Location ${location.id}`);
        stats.errors++;
      }
    }

    log('---');
    log('SUMMARY:');
    log(`  Total Locations scanned: ${stats.totalLocations}`);
    log(`  Jurisdictions found: ${stats.jurisdictionsFound}`);
    log(`  Jurisdictions with Organization: ${stats.jurisdictionsWithOrg}`);
    log(`  Jurisdictions missing Organization: ${stats.jurisdictionsMissingOrg}`);
    log(`  Organizations created: ${stats.organizationsCreated}`);
    log(`  Organizations updated: ${stats.organizationsUpdated}`);
    log(`  Locations updated: ${stats.locationsUpdated}`);
    log(`  Errors: ${stats.errors}`);
    
    if (DRY_RUN) {
      log('(Dry run - no changes made)');
    }

    // Save report
    const reportFile = `jurisdiction-org-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(stats, null, 2));
    log(`Report saved to: ${reportFile}`);

  } catch (err) {
    error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

main().then(() => {
  log('Done.');
  process.exit(0);
}).catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
