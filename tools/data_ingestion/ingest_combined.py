#!/usr/bin/env python3
"""
Ingest /root/development/gofr/datasets/combined.csv into the GOFR DEFAULT FHIR
partition as full mCSD Locations + supporting jurisdictional hierarchy
following the GofrLocation / GofrJurisdiction profiles and the CamDHEA FHIR R4
data dictionary.

Strategy:
  1. Walk the CSV, collect unique (code, name_kh, name_en, parent_code) for
     each of: province, district, OD, commune, village.
  2. Emit one jurisdiction Location + Organization pair per unique node, with
      Location.partOf, Location.managingOrganization, and Organization
      hierarchy extensions aligned to the same parent chain. Mapping to
      gofr-jurisdiction-type (constrained ValueSet of country/region/district/
      county): province->region, district->district, od->district,
      commune->county, village->county. Granularity preserved via Location.id
      prefix (province-, district-, od-, commune-, village-).
  3. Emit one Organization "kh-moh" (Cambodia Ministry of Health) — owner of
     all facilities in this dataset (all sources are MoH/DPHI/Survey123/BTB
     surveys of public-sector facilities).
  4. Emit one Location per facility:
       - id           = HF_CODE (zero-padded as in CSV)
       - name         = NAME_EN, alias = NAME_KH
       - identifier   = HF_CODE under camdhea legacy-hfcode system, plus
                        HF_ID under legacy-hfid where present
       - partOf       = village-<VIL_CODE>  (full hierarchy via chain)
       - position     = lat/long
       - operationalStatus = STATUS (Operational | Pending)
       - type         = CamDHEA facility-type coding (HealthCenter, etc.)
       - physicalType = bu (building) per mCSD convention
       - managingOrganization = Organization/kh-moh
       - telecom      = phone (CONTACT_NO), email (CONTACT_EMAIL)
       - extensions:
           facilityLevel        = CamDHEA facility-level (MPA/CPA1/CPA2/CPA3)
           ownershipType        = MOH
           coordinateAccuracy   = derived from OWNERSHIP source
           googleMapsLink       = GOOGLE_MAP_LINK
           operationalPeriod    = Period.start = START_DATE
           administrativeLocation = {province,district,od,commune,village}
           managingEntityName   = "Ministry of Health, Cambodia"
           managingEntityNameUse / Script = official / Latin
  5. POST Organization, jurisdiction-organization, jurisdiction-location, and
      facility bundles to HAPI DEFAULT in dependency order.
  6. Run validate_jurisdiction_pairs.py against the same partition and fail if
      any jurisdiction pair is incomplete or non-canonical.
"""
import csv
import json
import os
import subprocess
import sys
import urllib.request
from collections import OrderedDict
from datetime import datetime

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CSV_PATH = os.environ.get("COMBINED_CSV", os.path.join(REPO_ROOT, "datasets", "combined.csv"))
FHIR_BASE = os.environ.get("FHIR_BASE", "http://localhost:8080/fhir/DEFAULT")
BATCH_SIZE = 50
VALIDATOR_PATH = os.path.join(os.path.dirname(__file__), "validate_jurisdiction_pairs.py")

CAMDHEA_NS = "http://camdhea.gov.kh/fhir"
EXT = lambda name: f"{CAMDHEA_NS}/StructureDefinition/{name}"
SYS = lambda name: f"{CAMDHEA_NS}/CodeSystem/{name}"
ID_SYS = "https://camdhea.gov.kh/ns"

JURISDICTION_TYPE_SYS = "http://gofr.org/fhir/CodeSystem/gofr-jurisdiction-type"
IHE_URI_SYS = "urn:ietf:rfc:3986"
IHE_JURISDICTION_CODE = "urn:ihe:iti:mcsd:2019:jurisdiction"
JURISDICTION_LOCATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation"
JURISDICTION_ORGANIZATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization"
ORGANIZATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization"
GOFR_JURISDICTION_PROFILE = "http://gofr.org/fhir/StructureDefinition/gofr-jurisdiction"
ORG_HIERARCHY_EXT = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension"
ORG_HIERARCHY_TYPE_SYS = "http://gofr.org/fhir/CodeSystem/gofr-organization-hiearchy-type-codesystem"

# Map CSV facility type to CamDHEA facility-type code
HF_TYPE_MAP = {
    "Health Center": "HealthCenter",
    "Health Center with beds": "HealthCenterWithBed",
    "Health Post": "HealthPost",
    "Provincial Hospital": "ProvincialHospital",
    "Referral Hospital": "DistrictReferralHospital",
}

# Map OWNERSHIP (data provenance) to coordinate accuracy
OWNERSHIP_TO_ACCURACY = {
    "DPHI (GPS)": "GPSDevice",
    "Survey123 (WHO)": "GPSDevice",
    "BTB (Phone)": "GPSDevice",
    "DPHI (GPS)\tUnknown": "Unknown",
    "": "Unknown",
}

# Operational status
STATUS_TO_FHIR = {
    "Operational": ("active", "Operational"),
    "Pending": ("active", "Pending"),
    "": ("active", "Operational"),
}


def parse_date(s):
    s = (s or "").strip()
    if not s:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def jur_id(level, code):
    return f"{level}-{code}"


def build_jurisdiction_types(level, jur_type_code):
    return [
        {
            "coding": [{
                "system": JURISDICTION_TYPE_SYS,
                "code": jur_type_code,
                "display": jur_type_code.title(),
            }],
            "text": level.title(),
        },
        {
            "coding": [{
                "system": IHE_URI_SYS,
                "code": IHE_JURISDICTION_CODE,
                "display": "Jurisdiction",
            }],
            "text": "Jurisdiction",
        },
    ]


def build_jurisdiction_hierarchy(parent_org_ref):
    return {
        "url": ORG_HIERARCHY_EXT,
        "extension": [
            {
                "url": "part-of",
                "valueReference": {"reference": parent_org_ref},
            },
            {
                "url": "hierarchy-type",
                "valueCodeableConcept": {
                    "coding": [{
                        "system": ORG_HIERARCHY_TYPE_SYS,
                        "code": "operational",
                        "display": "Operational",
                    }],
                    "text": "Operational",
                },
            },
        ],
    }


def build_jurisdiction_organization(level, code, name_en, name_kh, parent_org_ref, jur_type_code):
    org = {
        "resourceType": "Organization",
        "id": f"org-{jur_id(level, code)}",
        "meta": {
            "profile": [
                ORGANIZATION_PROFILE,
                JURISDICTION_ORGANIZATION_PROFILE,
            ],
        },
        "active": True,
        "name": (name_en or name_kh or code).strip(),
        "type": build_jurisdiction_types(level, jur_type_code),
    }
    alias_kh = (name_kh or "").strip()
    if alias_kh and alias_kh != org["name"]:
        org["alias"] = [alias_kh]
    if parent_org_ref:
        org["extension"] = [build_jurisdiction_hierarchy(parent_org_ref)]
    return org


def build_jurisdiction(level, code, name_en, name_kh, parent_ref, managing_org_ref, jur_type_code):
    loc = {
        "resourceType": "Location",
        "id": jur_id(level, code),
        "meta": {
            # List the IHE mCSD parent profile FIRST so that GUI searches
            # using _profile=...IHE.mCSD.JurisdictionLocation match. HAPI does
            # exact-string matching on meta.profile and does not resolve
            # profile inheritance.
            "profile": [
                JURISDICTION_LOCATION_PROFILE,
                GOFR_JURISDICTION_PROFILE,
            ],
        },
        "status": "active",
        "name": (name_en or name_kh or code).strip(),
        "type": build_jurisdiction_types(level, jur_type_code),
        "identifier": [{
            "system": f"{CAMDHEA_NS}/ns/admin-{level}-code",
            "value": code,
            "use": "official",
        }],
        "managingOrganization": {"reference": managing_org_ref},
    }
    alias_kh = (name_kh or "").strip()
    if alias_kh and alias_kh != loc["name"]:
        loc["alias"] = [alias_kh]
    if parent_ref:
        loc["partOf"] = {"reference": parent_ref}
    return loc


def build_moh_organization():
    return {
        "resourceType": "Organization",
        "id": "kh-moh",
        "meta": {
            # The GUI's "mcsd-organization" search page queries with
            # _profile=...IHE.mCSD.Organization (the baseDefinition of
            # gofr-mcsd-organization). HAPI does exact-string matching on
            # meta.profile, so include the IHE base profile, the
            # JurisdictionsOrganization variant, and the GOFR derived profile.
            "profile": [
                "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization",
                "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionsOrganization",
                "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization",
            ],
        },
        "name": "Ministry of Health, Cambodia",
        "alias": ["ក្រសួងសុខាភិបាល"],
        "active": True,
        "type": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                "code": "govt",
                "display": "Government",
            }],
            "text": "Government",
        }],
    }


def build_facility(row, all_codes):
    hf_code = (row["HF_CODE"] or "").strip()
    if not hf_code:
        return None

    name_en = (row["NAME_EN"] or "").strip()
    name_kh = (row["NAME_KH"] or "").strip()
    acronym = (row["ACRONYM"] or "").strip()
    hf_type_en = (row["HF_TYPE_EN"] or "").strip()
    hf_level = (row["HF_LEVEL"] or "").strip()
    ownership_src = (row["OWNERSHIP"] or "").strip()
    hf_head = (row["HF_HEAD"] or "").strip()
    contact_no = (row["CONTACT_NO"] or "").strip()
    contact_email = (row["CONTACT_EMAIL"] or "").strip()
    if contact_email.lower() in ("none", "n/a", ""):
        contact_email = ""
    lat = (row["HF_LAT"] or "").strip()
    lon = (row["HF_LON"] or "").strip()
    start_date = parse_date(row["START_DATE"])
    google_map = (row["GOOGLE_MAP_LINK"] or "").strip()
    status_raw = (row["STATUS"] or "").strip()
    hf_id = (row["HF_ID"] or "").strip()

    pro_code = (row["PRO_CODE"] or "").strip()
    dis_code = (row["DIS_CODE"] or "").strip()
    od_code = (row["OD_CODE"] or "").strip()
    com_code = (row["COM_CODE"] or "").strip()
    vil_code = (row["VIL_CODE"] or "").strip()

    fhir_status, op_status_code = STATUS_TO_FHIR.get(status_raw, ("active", "Operational"))

    loc = OrderedDict()
    loc["resourceType"] = "Location"
    loc["id"] = hf_code
    loc["meta"] = {
        # IHE mCSD parent profile MUST be present so that the GUI search page
        # (which queries with _profile=...IHE.mCSD.FacilityLocation, the
        # baseDefinition of gofr-facility) returns these resources.
        "profile": [
            "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation",
            "http://gofr.org/fhir/StructureDefinition/gofr-facility",
        ],
    }
    loc["status"] = fhir_status
    loc["operationalStatus"] = {
        "system": SYS("camdhea-operational-status"),
        "code": op_status_code,
        "display": op_status_code,
    }
    loc["name"] = name_en or name_kh or hf_code
    if name_kh and name_kh != loc["name"]:
        loc["alias"] = [name_kh]

    # Identifiers
    identifiers = [{
        "use": "old",
        "system": f"{ID_SYS}/legacy-hfcode",
        "value": hf_code,
    }]
    if hf_id:
        identifiers.append({
            "use": "old",
            "system": f"{ID_SYS}/legacy-hfid",
            "value": hf_id,
        })
    loc["identifier"] = identifiers

    # Type: CamDHEA facility-type coding
    type_code = HF_TYPE_MAP.get(hf_type_en, "Other")
    type_coding = [{
        "coding": [{
            "system": SYS("camdhea-facility-type"),
            "code": type_code,
            "display": acronym or type_code,
        }],
        "text": hf_type_en or type_code,
    }]
    # Also include the IHE mCSD facility marker per profile convention
    type_coding.insert(0, {
        "coding": [{
            "system": "urn:ietf:rfc:3986",
            "code": "urn:ihe:iti:mcsd:2019:facility",
        }],
        "text": "Facility",
    })
    loc["type"] = type_coding

    loc["physicalType"] = {
        "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
            "code": "bu",
            "display": "Building",
        }],
        "text": "Building",
    }

    # Telecom
    telecom = []
    if contact_no:
        telecom.append({"system": "phone", "use": "work", "value": contact_no})
    if contact_email:
        telecom.append({"system": "email", "use": "work", "value": contact_email})
    if telecom:
        loc["telecom"] = telecom

    # Position
    if lat and lon:
        try:
            loc["position"] = {
                "longitude": float(lon),
                "latitude": float(lat),
            }
        except ValueError:
            pass

    # partOf — link to most granular jurisdiction available
    parent_ref = None
    if vil_code and vil_code in all_codes["village"]:
        parent_ref = f"Location/{jur_id('village', vil_code)}"
    elif com_code and com_code in all_codes["commune"]:
        parent_ref = f"Location/{jur_id('commune', com_code)}"
    elif od_code and od_code in all_codes["od"]:
        parent_ref = f"Location/{jur_id('od', od_code)}"
    elif dis_code and dis_code in all_codes["district"]:
        parent_ref = f"Location/{jur_id('district', dis_code)}"
    elif pro_code and pro_code in all_codes["province"]:
        parent_ref = f"Location/{jur_id('province', pro_code)}"
    if parent_ref:
        loc["partOf"] = {"reference": parent_ref}

    loc["managingOrganization"] = {"reference": "Organization/kh-moh"}

    # Extensions
    extensions = []

    # Facility level
    if hf_level:
        extensions.append({
            "url": EXT("facility-level"),
            "valueCodeableConcept": {
                "coding": [{
                    "system": SYS("camdhea-facility-level"),
                    "code": hf_level,
                    "display": hf_level,
                }],
                "text": hf_level,
            },
        })

    # Ownership type — all CSV facilities are MoH-operated public sector
    extensions.append({
        "url": EXT("ownership-type"),
        "valueCodeableConcept": {
            "coding": [{
                "system": SYS("camdhea-ownership-type"),
                "code": "MOH",
                "display": "Ministry of Health",
            }],
            "text": "MOH",
        },
    })

    # Coordinate accuracy — derived from OWNERSHIP source label
    accuracy = OWNERSHIP_TO_ACCURACY.get(ownership_src, "Unknown")
    if lat and lon:
        extensions.append({
            "url": EXT("coordinate-accuracy"),
            "valueCode": accuracy,
        })

    # Google maps link
    if google_map and google_map.startswith("http"):
        extensions.append({
            "url": EXT("google-maps-link"),
            "valueUrl": google_map,
        })

    # Facility head — record as plain string identifier (HWR not present)
    if hf_head:
        extensions.append({
            "url": EXT("facility-head"),
            "valueIdentifier": {
                "system": f"{ID_SYS}/facility-head-name",
                "value": hf_head,
            },
        })

    # Operational period
    if start_date:
        extensions.append({
            "url": EXT("operational-period"),
            "valuePeriod": {"start": start_date},
        })

    # Administrative location (admin codes)
    admin_subs = []
    for sub_name, sub_val in (
        ("province", pro_code),
        ("district", dis_code),
        ("od", od_code),
        ("commune", com_code),
        ("village", vil_code),
    ):
        if sub_val:
            admin_subs.append({"url": sub_name, "valueString": sub_val})
    if admin_subs:
        extensions.append({
            "url": EXT("administrative-location"),
            "extension": admin_subs,
        })

    # Managing entity name (MoH)
    extensions.append({
        "url": EXT("managing-entity-name"),
        "valueString": "Ministry of Health, Cambodia",
    })
    extensions.append({
        "url": EXT("managing-entity-name-use"),
        "valueString": "official",
    })
    extensions.append({
        "url": EXT("managing-entity-name-script"),
        "valueCodeableConcept": {
            "coding": [{
                "system": SYS("camdhea-name-script"),
                "code": "Latin",
                "display": "Latin",
            }],
            "text": "Latin",
        },
    })

    loc["extension"] = extensions
    return loc


def collect_hierarchy(rows):
    """Collect unique jurisdiction nodes."""
    nodes = {
        "province": OrderedDict(),  # code -> (name_en, name_kh, parent_level, parent_code)
        "district": OrderedDict(),
        "od": OrderedDict(),
        "commune": OrderedDict(),
        "village": OrderedDict(),
    }
    for r in rows:
        pro = (r["PRO_CODE"] or "").strip()
        dis = (r["DIS_CODE"] or "").strip()
        od = (r["OD_CODE"] or "").strip()
        com = (r["COM_CODE"] or "").strip()
        vil = (r["VIL_CODE"] or "").strip()
        if pro:
            nodes["province"].setdefault(pro, (r["PRO_NAME_EN"], r["PRO_NAME_KH"], None, None))
        if dis and pro:
            nodes["district"].setdefault(dis, (r["DIS_NAME_EN"], r["DIS_NAME_KH"], "province", pro))
        if od and dis:
            nodes["od"].setdefault(od, (r["OD_NAME_EN"], r["OD_NAME_KH"], "district", dis))
        if com and (od or dis):
            nodes["commune"].setdefault(
                com,
                (r["COM__NAME_EN"], r["COM_NAME_KH"], "od" if od else "district", od or dis),
            )
        if vil and com:
            nodes["village"].setdefault(vil, (r["VIL__NAME_EN"], r["VIL_NAME_KH"], "commune", com))
    return nodes


def post_bundle(bundle):
    body = json.dumps(bundle).encode("utf-8")
    req = urllib.request.Request(
        FHIR_BASE,
        data=body,
        method="POST",
        headers={"Content-Type": "application/fhir+json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.status, resp.read().decode("utf-8")


def make_bundle(entries):
    return {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": entries,
    }


def put_entry(resource):
    return {
        "fullUrl": f"{resource['resourceType']}/{resource['id']}",
        "resource": resource,
        "request": {
            "method": "PUT",
            "url": f"{resource['resourceType']}/{resource['id']}",
        },
    }


def run_jurisdiction_validation():
    if not os.path.isfile(VALIDATOR_PATH):
        sys.exit(f"Validator not found: {VALIDATOR_PATH}")

    fhir_base_url, partition = FHIR_BASE.rsplit("/", 1)
    env = os.environ.copy()
    env["FHIR_BASE_URL"] = fhir_base_url
    env["PARTITION"] = partition

    print("\n--- Phase 5: Jurisdiction Pair Validation ---", flush=True)
    subprocess.run([sys.executable, VALIDATOR_PATH], check=True, env=env)


JUR_TYPE_FOR_LEVEL = {
    "province": "region",
    "district": "district",
    "od": "district",
    "commune": "county",
    "village": "county",
}


def main():
    if not os.path.isfile(CSV_PATH):
        sys.exit(f"CSV not found: {CSV_PATH}")

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Loaded {len(rows)} CSV rows")

    nodes = collect_hierarchy(rows)
    summary = {k: len(v) for k, v in nodes.items()}
    print(f"Hierarchy nodes: {summary}")

    all_codes = {k: set(v.keys()) for k, v in nodes.items()}

    # Build jurisdiction Location + Organization pairs in dependency order
    jurisdiction_locations = []
    jurisdiction_organizations = []
    for level in ("province", "district", "od", "commune", "village"):
        for code, (name_en, name_kh, parent_level, parent_code) in nodes[level].items():
            parent_loc_ref = None
            parent_org_ref = None
            if parent_code and parent_level:
                parent_loc_ref = f"Location/{jur_id(parent_level, parent_code)}"
                parent_org_ref = f"Organization/org-{jur_id(parent_level, parent_code)}"
            jur_org = build_jurisdiction_organization(
                level=level,
                code=code,
                name_en=name_en or "",
                name_kh=name_kh or "",
                parent_org_ref=parent_org_ref,
                jur_type_code=JUR_TYPE_FOR_LEVEL[level],
            )
            jurisdiction_organizations.append(jur_org)
            jurisdiction_locations.append(build_jurisdiction(
                level=level,
                code=code,
                name_en=name_en or "",
                name_kh=name_kh or "",
                parent_ref=parent_loc_ref,
                managing_org_ref=f"Organization/{jur_org['id']}",
                jur_type_code=JUR_TYPE_FOR_LEVEL[level],
            ))

    moh_org = build_moh_organization()

    facility_resources = []
    skipped = 0
    seen_ids = set()
    for r in rows:
        fac = build_facility(r, all_codes)
        if fac is None:
            skipped += 1
            continue
        if fac["id"] in seen_ids:
            skipped += 1
            continue
        seen_ids.add(fac["id"])
        facility_resources.append(fac)

    print(f"Built: {len(jurisdiction_locations)} jurisdiction locations, "
          f"{len(jurisdiction_organizations)} jurisdiction organizations, "
          f"1 organization, {len(facility_resources)} facilities "
          f"(skipped {skipped})")

    # Phase 1: organization first
    print("\n--- Phase 1: Organization ---")
    bundle = make_bundle([put_entry(moh_org)])
    status, body = post_bundle(bundle)
    print(f"  POST org bundle -> HTTP {status}")
    bundle_resp = json.loads(body)
    errors = [e for e in bundle_resp.get("entry", [])
              if not str(e.get("response", {}).get("status", "")).startswith(("200", "201"))]
    if errors:
        print(f"  ERRORS: {errors[:2]}")
        sys.exit(1)

    # Phase 2: jurisdiction Organizations in dependency order, batched
    print("\n--- Phase 2: Jurisdiction Organizations ---")
    for level in ("province", "district", "od", "commune", "village"):
        level_resources = [j for j in jurisdiction_organizations if j["id"].startswith(f"org-{level}-")]
        for i in range(0, len(level_resources), BATCH_SIZE):
            batch = level_resources[i:i + BATCH_SIZE]
            bundle = make_bundle([put_entry(r) for r in batch])
            status, body = post_bundle(bundle)
            bundle_resp = json.loads(body)
            errors = [e for e in bundle_resp.get("entry", [])
                      if not str(e.get("response", {}).get("status", "")).startswith(("200", "201"))]
            print(f"  {level} org batch {i//BATCH_SIZE+1}: {len(batch)} resources -> HTTP {status}, {len(errors)} errors")
            if errors:
                print(f"    First error: {json.dumps(errors[0], indent=2)[:500]}")
                sys.exit(1)

    # Phase 3: jurisdiction Locations in dependency order, batched
    print("\n--- Phase 3: Jurisdiction Locations ---")
    for level in ("province", "district", "od", "commune", "village"):
        level_resources = [j for j in jurisdiction_locations if j["id"].startswith(f"{level}-")]
        for i in range(0, len(level_resources), BATCH_SIZE):
            batch = level_resources[i:i + BATCH_SIZE]
            bundle = make_bundle([put_entry(r) for r in batch])
            status, body = post_bundle(bundle)
            bundle_resp = json.loads(body)
            errors = [e for e in bundle_resp.get("entry", [])
                      if not str(e.get("response", {}).get("status", "")).startswith(("200", "201"))]
            print(f"  {level} location batch {i//BATCH_SIZE+1}: {len(batch)} resources -> HTTP {status}, {len(errors)} errors")
            if errors:
                print(f"    First error: {json.dumps(errors[0], indent=2)[:500]}")
                sys.exit(1)

    # Phase 4: facilities
    print("\n--- Phase 4: Facilities ---")
    for i in range(0, len(facility_resources), BATCH_SIZE):
        batch = facility_resources[i:i + BATCH_SIZE]
        bundle = make_bundle([put_entry(r) for r in batch])
        status, body = post_bundle(bundle)
        bundle_resp = json.loads(body)
        errors = [e for e in bundle_resp.get("entry", [])
                  if not str(e.get("response", {}).get("status", "")).startswith(("200", "201"))]
        print(f"  facility batch {i//BATCH_SIZE+1}: {len(batch)} resources -> HTTP {status}, {len(errors)} errors")
        if errors:
            print(f"    First error: {json.dumps(errors[0], indent=2)[:600]}")

    # Final tally
    counts = {}
    for rt in ("Location", "Organization"):
        with urllib.request.urlopen(
            f"{FHIR_BASE}/{rt}?_summary=count&_total=accurate", timeout=30
        ) as resp:
            counts[rt] = json.loads(resp.read()).get("total")
    print(f"\nFinal counts in DEFAULT: {counts}")
    run_jurisdiction_validation()


if __name__ == "__main__":
    main()
