#!/usr/bin/env bash
# refreshBoundaries.sh
#
# Idempotent refresh of Cambodia administrative boundary polygons in HAPI FHIR.
# Runs loadBoundaries.js for each admin level (0–3), adding or updating the
# location-boundary-geojson extension on matching Location resources.
#
# Usage:
#   ./refreshBoundaries.sh [OPTIONS]
#
# Options:
#   --geojson-dir DIR     Directory containing khm_admin*.geojson files
#                         (default: /tmp/kh_hdx)
#   --fhir URL            HAPI FHIR base URL (default: http://localhost:8080/fhir)
#   --partition NAME      FHIR partition (default: DEFAULT)
#   --dry-run             Pass --dry-run to loadBoundaries.js (no writes)
#   --help                Show this help
#
# Admin-level mapping (Cambodia COD-AB from HDX):
#   admin1  adm1_name  → FHIR type: region   (provinces)
#   admin2  adm2_name  → FHIR type: district  (districts)
#   admin3  adm3_name  → FHIR type: county    (communes)
#
# To refresh Battambang partition boundaries (admin2 jurisdiction type):
#   ./refreshBoundaries.sh \
#     --partition Battambangpjrymylm5mfb6skk5ese1m \
#     --geojson-dir /tmp/kh_hdx
#   (uses default typeCode urn:ihe:iti:mcsd:2019:jurisdiction, admin2 only)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOADER="$SCRIPT_DIR/loadBoundaries.js"

# ── Defaults ──────────────────────────────────────────────────────────────────
GEOJSON_DIR="/tmp/kh_hdx"
FHIR_BASE="http://localhost:8080/fhir"
PARTITION="DEFAULT"
FACILITIES_GEOJSON=""
SKIP_ADMIN=""
DRY_RUN_FLAG=""

# ── Arg parsing ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --geojson-dir)       GEOJSON_DIR="$2";        shift 2 ;;
    --facilities-geojson) FACILITIES_GEOJSON="$2"; shift 2 ;;
    --fhir)              FHIR_BASE="$2";          shift 2 ;;
    --partition)         PARTITION="$2";          shift 2 ;;
    --skip-admin)        SKIP_ADMIN="1";          shift ;;
    --dry-run)           DRY_RUN_FLAG="--dry-run"; shift ;;
    --help)
      sed -n '/^# /s/^# \?//p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ── Validate ──────────────────────────────────────────────────────────────────
if [[ ! -f "$LOADER" ]]; then
  echo "ERROR: loadBoundaries.js not found at $LOADER" >&2
  exit 1
fi

if [[ -z "$SKIP_ADMIN" && ! -d "$GEOJSON_DIR" ]]; then
  echo "ERROR: GeoJSON directory not found: $GEOJSON_DIR" >&2
  echo "       Download from https://data.humdata.org/dataset/cod-ab-khm and extract." >&2
  echo "       Use --skip-admin to skip admin boundary ingestion." >&2
  exit 1
fi

echo "======================================================================"
echo "  refreshBoundaries.sh"
echo "  FHIR base : $FHIR_BASE"
echo "  Partition : $PARTITION"
echo "  GeoJSON   : $GEOJSON_DIR"
[[ -n "$DRY_RUN_FLAG" ]] && echo "  Mode      : DRY-RUN (no writes)"
echo "======================================================================"
echo ""

TOTAL_UPDATED=0
TOTAL_SKIPPED=0
TOTAL_ERRORS=0

run_level() {
  local geojson="$1"
  local name_prop="$2"
  local type_code="$3"
  local label="$4"

  if [[ ! -f "$geojson" ]]; then
    echo "  [SKIP] $label: file not found ($geojson)"
    return
  fi

  echo "── $label ──────────────────────────────────────────────────────────"
  local output
  output=$(node "$LOADER" \
    --geojson "$geojson" \
    --nameProperty "$name_prop" \
    --typeCode "$type_code" \
    --partition "$PARTITION" \
    --fhir "$FHIR_BASE" \
    $DRY_RUN_FLAG 2>&1)

  echo "$output" | grep -v '^    - '   # suppress long unmatched lists inline

  local updated skipped errors
  updated=$(echo "$output" | grep -oP 'Matched & updated\s*:\s*\K[0-9]+' || echo 0)
  skipped=$(echo "$output" | grep -oP 'Skipped \(ambiguous\)\s*:\s*\K[0-9]+' || echo 0)
  errors=$(echo  "$output" | grep -oP 'Errors\s*:\s*\K[0-9]+'  || echo 0)

  TOTAL_UPDATED=$((TOTAL_UPDATED + updated))
  TOTAL_SKIPPED=$((TOTAL_SKIPPED + skipped))
  TOTAL_ERRORS=$((TOTAL_ERRORS  + errors))
  echo ""
}

# ── Run each admin level ───────────────────────────────────────────────────────
if [[ -z "$SKIP_ADMIN" ]]; then
  run_level \
    "$GEOJSON_DIR/khm_admin1.geojson" \
    "adm1_name" \
    "region" \
    "Admin-1 (Provinces → region)"

  run_level \
    "$GEOJSON_DIR/khm_admin2.geojson" \
    "adm2_name" \
    "district" \
    "Admin-2 (Districts → district)"

  run_level \
    "$GEOJSON_DIR/khm_admin3.geojson" \
    "adm3_name" \
    "county" \
    "Admin-3 (Communes → county)"
fi

if [[ -n "$FACILITIES_GEOJSON" ]]; then
  run_level \
    "$FACILITIES_GEOJSON" \
    "NAME_EN" \
    "urn:ihe:iti:mcsd:2019:facility" \
    "Facilities (→ urn:ihe:iti:mcsd:2019:facility)"
fi

# ── Final totals ──────────────────────────────────────────────────────────────
echo "======================================================================"
echo "  TOTAL UPDATED : $TOTAL_UPDATED"
echo "  TOTAL SKIPPED : $TOTAL_SKIPPED  (ambiguous duplicate names)"
echo "  TOTAL ERRORS  : $TOTAL_ERRORS"
echo "======================================================================"

if [[ "$TOTAL_ERRORS" -gt 0 ]]; then
  echo "WARNING: $TOTAL_ERRORS error(s) occurred — review output above." >&2
  exit 2
fi
