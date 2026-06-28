# Cambodia Health Facility Master List — Data Quality Analysis Plan

## 1. Purpose & scope

This plan defines how the merged national Health Facility Master List
(`datasets/combined.csv`, produced by
[`merge_facility_master_list.py`](../../tools/data_ingestion/merge_facility_master_list.py))
is profiled for quality **before** it is ingested into the GOFR / CamDHEA FHIR
registry by
[`ingest_combined.py`](../../tools/data_ingestion/ingest_combined.py).

The goal is to (a) summarise the dataset, and (b) surface gaps and defects that
would either break ingestion (referential integrity, identifiers) or degrade the
registry's usefulness (coverage, completeness, plausibility).

**Inputs**

| Artifact | Role |
|---|---|
| `datasets/combined.csv` | Subject under test (32-column canonical schema). |
| `datasets/Data dictionary FHIR R4 - updated.csv` | Authority for required fields, formats, value sets. |
| `tools/data_ingestion/kh_districts.geojson` (197 districts, `adm2_pcode`) | Reference denominator for district coverage. |
| `tools/data_ingestion/kh_communes.geojson` (1,633 communes, `adm3_pcode`) | Reference denominator for commune coverage. |
| `tools/data_ingestion/kh_provinces.json` / `kh.json` | Province reference. |

**Execution:** `python3 tools/data_ingestion/analyze_facility_data_quality.py`
→ writes [`facility-data-quality-report.md`](./facility-data-quality-report.md).

## 2. Quality dimensions & checks

The plan follows the standard ISO/DAMA data-quality dimensions, tailored to this
dataset and the FHIR R4 data dictionary.

### 2.1 Completeness
- **Field fill rate** for every column; non-empty defined as not in the sentinel
  set `{"", NA, N/A, None, null, -, unknown}` (case-insensitive).
- **Required-field gaps**: the dictionary marks `hfid`, `facility_name`,
  `facility_type`, `facility_level`, `ownership_type`, the five admin codes
  (`province/district/od/commune/village`), `gps_latitude/longitude`,
  `contact_number`, `operational_status`, `start_date` as **Required**. Each is
  reported with its populated count and rate.
- **Primary-key presence**: `HF_ID` / `HF_CODE`. The dictionary makes `hfid` the
  required, unique primary key; rows with no usable facility code are flagged as
  ingestion blockers.

### 2.2 Validity / conformance
- **Code format**: `HF_CODE` 6 digits; `PRO_CODE` 2; `DIS_CODE`/`OD_CODE` 4;
  `COM_CODE` 6; `VIL_CODE` 8 — all numeric. Report blank/NA, wrong-length, and
  non-numeric counts.
- **Hierarchy nesting**: Cambodian pcodes are prefix-nested, so a valid
  `DIS_CODE` starts with its `PRO_CODE`, `COM_CODE` with its `DIS_CODE`, and
  `VIL_CODE` with its `COM_CODE`. Violations indicate mis-keyed geography.
- **GPS plausibility**: parseable decimals; not (0,0); within Cambodia's
  bounding box (lat 9.5–15.0, lon 101.0–108.0, WGS84) per the dictionary range.
- **Controlled vocabularies**: distribution of `STATUS`, `HF_TYPE_EN`,
  `OWNERSHIP`, `HF_LEVEL` against the CamDHEA value sets; near-duplicate /
  misspelled members (e.g. `Health Cente`, `NoneMPA`) flagged.
- **Placeholders**: `CONTACT_EMAIL` and others carrying literal `None`/`NA`.
- **Dates**: `START_DATE` parseable to a real calendar date; no future dates.

### 2.3 Uniqueness & duplication
- **Duplicate `HF_CODE`** (must be unique per dictionary).
- **Exact duplicate rows** (all 32 fields identical).
- **Probable duplicate facilities**: identical `NAME_EN` within the same
  `COM_CODE`.

### 2.4 Coverage gaps (the core ask)
Measured against the official boundary denominators:
- **Provinces with no facilities** (of 24/25).
- **Districts with no facilities** (of 197).
- **Communes with no facilities** (of 1,633).
- **Villages**: distinct villages represented; *villages with no facilities*
  flagged as **not computable** until a national village registry is loaded
  (none is bundled; ~14,000 villages exist nationally).
- **Orphan codes**: district/commune codes present in the data but absent from
  the boundary reference — either data-entry errors or post-2018 admin changes.

### 2.5 Referential integrity (code ↔ name consistency)
- One admin **code mapping to multiple names** (and one name to multiple codes)
  for province/district/commune — exposes inconsistent labelling or copy-paste
  errors that corrupt the jurisdiction hierarchy built during ingestion.

### 2.6 Duplicated names across areas (the core ask)
- **Commune names reused** by multiple distinct communes (legitimately common in
  Cambodia, e.g. *Samraong* — reported for disambiguation, not as errors).
- **Facility name == commune name** (name likely defaulted from the locality).
- **Facility names reused** across many records.

### 2.7 Distribution & plausibility
- Facilities per province and per type, to spot under-counted provinces and
  unexpected type values.

## 3. Severity & thresholds

| Severity | Definition | Examples |
|---|---|---|
| **Blocker** | Prevents or corrupts ingestion. | Missing/duplicate primary key; admin code that breaks the jurisdiction chain. |
| **Major** | Registry usable but materially degraded. | Required field <90% complete; GPS missing; orphan admin codes. |
| **Minor** | Cosmetic / easily normalised. | Value-set typos; placeholder emails; reused names that are genuinely valid. |

Target acceptance gates for go-live: required-field completeness ≥ 98% (except
where conditionally required), 0 duplicate primary keys, 0 hierarchy-nesting
violations, GPS present and in-country ≥ 98%.

## 4. Limitations

- Boundary references are **valid as of 2018**; genuine post-2018 admin units
  legitimately appear as "orphan" codes and need a refreshed gazetteer to
  separate true errors from real change.
- No **village** master list is available, so village-level coverage is partial.
- The GPS check is a bounding-box test, not a point-in-polygon test against the
  facility's own commune; a follow-up spatial check is recommended.

## 5. Remediation workflow

1. Run the analysis; triage findings by the severity table above.
2. Return Blocker/Major line items (missing `HF_ID`, duplicate `HF_CODE`,
   nesting violations, orphan codes) to the source PHD/OD for correction.
3. Normalise Minor value-set typos in a transform step before ingestion.
4. Re-run the analysis until the acceptance gates pass, then ingest.
