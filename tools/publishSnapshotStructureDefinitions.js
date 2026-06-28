#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const usage = () => {
  console.log('Usage: node publishSnapshotStructureDefinitions.js --server http://localhost:8080/fhir [--partition DEFAULT] [--dir ../fshcustom/fsh-generated/resources] [--ids gofr-facility,gofr-facility-add-request] [--username user --password pass] [--dryRun]');
};

const tryParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const parseArgs = (argv) => {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
};

const buildBaseUrl = (server, partition) => {
  const base = new URL(server);
  const normalizedPartition = partition && partition.trim();
  if (!normalizedPartition) {
    return base.toString().replace(/\/$/, '');
  }
  const segments = base.pathname.split('/').filter(Boolean);
  if (!segments.length || segments[segments.length - 1] !== normalizedPartition) {
    segments.push(normalizedPartition);
    base.pathname = `/${segments.join('/')}`;
  }
  return base.toString().replace(/\/$/, '');
};

const putResource = (destination, resource, username, password) => new Promise((resolve, reject) => {
  const target = new URL(destination);
  const client = target.protocol === 'https:' ? https : http;
  const body = JSON.stringify(resource);
  const headers = {
    'Content-Type': 'application/fhir+json',
    'Content-Length': Buffer.byteLength(body),
  };
  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
  const request = client.request(target, {
    method: 'PUT',
    headers,
  }, (response) => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve({ status: response.statusCode, data });
        return;
      }
      reject({
        response: {
          status: response.statusCode,
          data: data ? tryParseJson(data) : '',
        },
      });
    });
  });
  request.on('error', reject);
  request.write(body);
  request.end();
});

const listCandidateFiles = (directory) => {
  return fs.readdirSync(directory)
    .filter(file => file.startsWith('StructureDefinition-') && file.endsWith('.json'))
    .sort()
    .map(file => path.join(directory, file));
};

const readCandidates = (directory, requestedIds) => {
  const candidates = [];
  for (const filePath of listCandidateFiles(directory)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const resource = JSON.parse(raw);
    if (resource.resourceType !== 'StructureDefinition') {
      continue;
    }
    if (requestedIds.size > 0 && !requestedIds.has(resource.id)) {
      continue;
    }
    if (!resource.snapshot) {
      continue;
    }
    candidates.push({
      filePath,
      resource,
    });
  }
  return candidates;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  const server = options.server;
  const dryRun = Boolean(options.dryRun);
  const partition = options.partition === undefined ? 'DEFAULT' : options.partition;
  const directory = path.resolve(__dirname, options.dir || '../fshcustom/fsh-generated/resources');
  const idsOption = options.ids;
  const requestedIds = new Set(
    idsOption
      ? idsOption.split(',').map(id => id.trim()).filter(Boolean)
      : [],
  );

  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    console.error(`Directory not found: ${directory}`);
    process.exitCode = 1;
    return;
  }

  if (!server && !dryRun) {
    usage();
    console.error('--server is required unless --dryRun is set');
    process.exitCode = 1;
    return;
  }

  const resources = readCandidates(directory, requestedIds);
  if (resources.length === 0) {
    console.log(`No snapshot-bearing StructureDefinitions found in ${directory}`);
    if (requestedIds.size > 0) {
      console.log(`Requested ids: ${Array.from(requestedIds).join(', ')}`);
    }
    return;
  }

  const baseUrl = server ? buildBaseUrl(server, partition) : null;
  console.log(`Found ${resources.length} snapshot-bearing StructureDefinitions in ${directory}`);
  if (requestedIds.size > 0) {
    console.log(`Filtered ids: ${Array.from(requestedIds).join(', ')}`);
  }

  for (const { resource } of resources) {
    const destination = baseUrl
      ? `${baseUrl}/StructureDefinition/${resource.id}`
      : `(dry-run only) StructureDefinition/${resource.id}`;
    console.log(`${dryRun ? 'Would publish' : 'Publishing'} ${resource.id} -> ${destination}`);
    if (dryRun) {
      continue;
    }
    try {
      const response = await putResource(destination, resource, options.username, options.password);
      console.log(`${response.status} ${resource.id}`);
    } catch (error) {
      console.error(`Failed to publish ${resource.id}`);
      if (error.response) {
        console.error(`${error.response.status} ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(error.message);
      }
      process.exitCode = 1;
      return;
    }
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});