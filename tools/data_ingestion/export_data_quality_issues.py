#!/usr/bin/env python3
"""
Split datasets/combined.csv into one dataset per data-quality issue described in
docs/data_quality/facility-data-quality-report.md.

Each issue is written to datasets/data_quality_issues/<issue>.csv:
  * Facility-level issues contain the full offending records (canonical 32-column
    schema) plus diagnostic column(s) explaining the defect.
  * Aggregate issues (coverage gaps, reused names, code<->name conflicts) are
    written as summary tables.

An _index.csv manifest lists every issue, its category/severity, the record
count, and the output file (issues with 0 records are listed but not written).

Usage:
    python3 export_data_quality_issues.py
"""
import csv
import json
import os
from collections import Counter, defaultdict
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CSV_PATH = os.path.join(REPO_ROOT, "datasets", "combined.csv")
DISTRICTS = os.path.join(HERE, "kh_districts.geojson")
COMMUNES = os.path.join(HERE, "kh_communes.geojson")
OUT_DIR = os.path.join(REPO_ROOT, "datasets", "data_quality_issues")

REQUIRED = [
    "HF_CODE", "NAME_KH", "NAME_EN", "HF_TYPE_EN", "HF_LEVEL", "OWNERSHIP",
    "PRO_CODE", "DIS_CODE", "OD_CODE", "COM_CODE", "VIL_CODE",
    "HF_LAT", "HF_LON", "CONTACT_NO", "STATUS", "START_DATE",
]
CODE_WIDTHS = {"HF_CODE": 6, "PRO_CODE": 2, "DIS_CODE": 4, "COM_CODE": 6, "VIL_CODE": 8}
SENTINELS = {"", "na", "n/a", "none", "null", "-", "unknown"}
KH_LAT = (9.5, 15.0)
KH_LON = (101.0, 108.0)
VALID_HF_TYPE = {
    "Health Center", "Health Center with beds", "Health Post",
    "Referral Hospital", "Provincial Hospital", "National Hospital",
}
VALID_HF_LEVEL = {"MPA", "CPA1", "CPA2", "CPA3"}
VALID_STATUS = {"Operational", "Pending", "Closed", "Suspended",
                "UnderConstruction", "UnderRenovation"}


def is_blank(v):
    return v is None or str(v).strip().lower() in SENTINELS


def load_rows():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return reader.fieldnames, list(reader)


def load_pcodes(path, prop):
    with open(path, encoding="utf-8") as f:
        gj = json.load(f)
    out = {}
    for feat in gj["features"]:
        p = feat["properties"]
        code = (p.get(prop) or "").replace("KH", "", 1)
        if code:
            out[code] = p
    return out


def parse_date(s):
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


class Exporter:
    def __init__(self, fieldnames):
        self.fieldnames = fieldnames
        self.manifest = []

    def write_rows(self, name, category, severity, description, rows, extra_cols=None):
        """Write facility records (canonical schema + extra diagnostic columns)."""
        count = len(rows)
        fname = f"{name}.csv" if count else ""
        self.manifest.append((name, category, severity, description, count, fname))
        if not count:
            return
        cols = list(self.fieldnames) + (extra_cols or [])
        with open(os.path.join(OUT_DIR, fname), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)

    def write_table(self, name, category, severity, description, header, table):
        """Write an arbitrary summary table."""
        count = len(table)
        fname = f"{name}.csv" if count else ""
        self.manifest.append((name, category, severity, description, count, fname))
        if not count:
            return
        with open(os.path.join(OUT_DIR, fname), "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(table)

    def write_manifest(self):
        path = os.path.join(OUT_DIR, "_index.csv")
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["issue_id", "category", "severity", "description",
                             "record_count", "file"])
            writer.writerows(self.manifest)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    fieldnames, rows = load_rows()
    districts_ref = load_pcodes(DISTRICTS, "adm2_pcode")
    communes_ref = load_pcodes(COMMUNES, "adm3_pcode")

    ex = Exporter(fieldnames)

    # ---- 1. Completeness: rows missing any required field --------------------
    miss_rows = []
    for r in rows:
        missing = [c for c in REQUIRED if is_blank(r.get(c))]
        if missing:
            rr = dict(r)
            rr["missing_required_fields"] = ";".join(missing)
            miss_rows.append(rr)
    ex.write_rows("completeness_missing_required", "Completeness", "Major",
                  "Records missing one or more dictionary-required fields",
                  miss_rows, ["missing_required_fields"])

    # ---- 2.1 Validity: malformed admin codes ---------------------------------
    code_bad = []
    for r in rows:
        issues = []
        for col, width in CODE_WIDTHS.items():
            v = (r.get(col) or "").strip()
            if is_blank(v):
                continue
            if not v.isdigit():
                issues.append(f"{col}:non-numeric")
            elif len(v) != width:
                issues.append(f"{col}:len{len(v)}!={width}")
        if issues:
            rr = dict(r)
            rr["code_issues"] = ";".join(issues)
            code_bad.append(rr)
    ex.write_rows("validity_code_format", "Validity", "Major",
                  "Admin codes that are present but non-numeric or wrong length",
                  code_bad, ["code_issues"])

    # ---- 2.2 Validity: hierarchy nesting -------------------------------------
    nest_bad = []
    for r in rows:
        pro, dis, com, vil = (r.get(c, "").strip() for c in ("PRO_CODE", "DIS_CODE", "COM_CODE", "VIL_CODE"))
        issues = []
        if dis and pro and not dis.startswith(pro):
            issues.append("DIS_not_under_PRO")
        if com and dis and not com.startswith(dis):
            issues.append("COM_not_under_DIS")
        if vil and com and not vil.startswith(com):
            issues.append("VIL_not_under_COM")
        if issues:
            rr = dict(r)
            rr["nesting_issues"] = ";".join(issues)
            nest_bad.append(rr)
    ex.write_rows("validity_hierarchy_nesting", "Validity", "Blocker",
                  "Admin codes that violate pcode prefix nesting", nest_bad,
                  ["nesting_issues"])

    # ---- 2.3 Validity: GPS ---------------------------------------------------
    gps_bad = []
    for r in rows:
        la, lo = (r.get("HF_LAT", "").strip(), r.get("HF_LON", "").strip())
        issue = None
        if not la or not lo:
            issue = "missing"
        else:
            try:
                laf, lof = float(la), float(lo)
                if laf == 0 and lof == 0:
                    issue = "null_island"
                elif not (KH_LAT[0] <= laf <= KH_LAT[1] and KH_LON[0] <= lof <= KH_LON[1]):
                    issue = "outside_cambodia"
            except ValueError:
                issue = "unparseable"
        if issue:
            rr = dict(r)
            rr["gps_issue"] = issue
            gps_bad.append(rr)
    ex.write_rows("validity_gps", "Validity", "Major",
                  "Missing, unparseable, null-island, or out-of-country coordinates",
                  gps_bad, ["gps_issue"])

    # ---- 2.4 Validity: controlled value sets ---------------------------------
    vs_bad = []
    for r in rows:
        issues = []
        t = (r.get("HF_TYPE_EN") or "").strip()
        lv = (r.get("HF_LEVEL") or "").strip()
        st = (r.get("STATUS") or "").strip()
        if t and t not in VALID_HF_TYPE:
            issues.append(f"HF_TYPE_EN='{t}'")
        if lv and lv not in VALID_HF_LEVEL:
            issues.append(f"HF_LEVEL='{lv}'")
        if st and st not in VALID_STATUS:
            issues.append(f"STATUS='{st}'")
        if issues:
            rr = dict(r)
            rr["value_issues"] = ";".join(issues)
            vs_bad.append(rr)
    ex.write_rows("validity_value_set", "Validity", "Minor",
                  "Values outside the CamDHEA controlled vocabularies (typos)",
                  vs_bad, ["value_issues"])

    # ---- 2.4b Placeholder emails ---------------------------------------------
    email_bad = []
    for r in rows:
        v = (r.get("CONTACT_EMAIL") or "").strip()
        if v and v.lower() in SENTINELS:
            email_bad.append(r)
    ex.write_rows("validity_placeholder_email", "Validity", "Minor",
                  "CONTACT_EMAIL carrying a literal placeholder (None/NA/etc.)",
                  email_bad)

    # ---- 2.5 Validity: unparseable START_DATE --------------------------------
    date_bad = []
    for r in rows:
        s = (r.get("START_DATE") or "").strip()
        if s and parse_date(s) is None:
            rr = dict(r)
            rr["date_issue"] = "unparseable"
            date_bad.append(rr)
    ex.write_rows("validity_unparseable_start_date", "Validity", "Minor",
                  "START_DATE present but not a parseable calendar date", date_bad,
                  ["date_issue"])

    # ---- 3. Uniqueness: duplicate HF_CODE ------------------------------------
    code_counts = Counter((r.get("HF_CODE") or "").strip()
                          for r in rows if not is_blank(r.get("HF_CODE")))
    dup_codes = {c for c, n in code_counts.items() if n > 1}
    dup_rows = [r for r in rows if (r.get("HF_CODE") or "").strip() in dup_codes]
    dup_rows.sort(key=lambda r: (r.get("HF_CODE") or ""))
    ex.write_rows("duplicate_hf_code", "Uniqueness", "Blocker",
                  "Records sharing an HF_CODE that must be unique", dup_rows)

    # ---- 3b. Duplicate facility name within a commune ------------------------
    name_in_commune = defaultdict(list)
    for r in rows:
        nm = (r.get("NAME_EN") or "").strip().lower()
        com = (r.get("COM_CODE") or "").strip()
        if nm and com:
            name_in_commune[(com, nm)].append(r)
    dup_name_rows = []
    for (com, nm), recs in name_in_commune.items():
        if len(recs) > 1:
            dup_name_rows.extend(recs)
    ex.write_rows("duplicate_name_within_commune", "Uniqueness", "Major",
                  "Same facility name repeated within one commune (probable dup)",
                  dup_name_rows)

    # ---- 4. Coverage: districts / communes with no facilities ----------------
    data_dist = {r.get("DIS_CODE", "").strip() for r in rows if r.get("DIS_CODE", "").strip()}
    data_com = {r.get("COM_CODE", "").strip() for r in rows if r.get("COM_CODE", "").strip()}

    dist_empty = sorted(set(districts_ref) - data_dist)
    ex.write_table(
        "coverage_districts_no_facilities", "Coverage", "Major",
        "Reference districts with zero facilities in the data",
        ["district_code", "district_name", "province_name"],
        [[c, districts_ref[c].get("adm2_name", ""), districts_ref[c].get("adm1_name", "")]
         for c in dist_empty])

    com_empty = sorted(set(communes_ref) - data_com)
    ex.write_table(
        "coverage_communes_no_facilities", "Coverage", "Major",
        "Reference communes with zero facilities in the data",
        ["commune_code", "commune_name", "district_name", "province_name"],
        [[c, communes_ref[c].get("adm3_name", ""), communes_ref[c].get("adm2_name", ""),
          communes_ref[c].get("adm1_name", "")] for c in com_empty])

    # ---- 4b. Orphan codes (in data, not in boundary reference) ---------------
    orphan_dist = [r for r in rows
                   if r.get("DIS_CODE", "").strip()
                   and r.get("DIS_CODE", "").strip() not in districts_ref]
    ex.write_rows("coverage_orphan_district_codes", "Coverage", "Major",
                  "Records whose DIS_CODE is absent from the boundary reference",
                  orphan_dist)
    orphan_com = [r for r in rows
                  if r.get("COM_CODE", "").strip()
                  and r.get("COM_CODE", "").strip() not in communes_ref]
    ex.write_rows("coverage_orphan_commune_codes", "Coverage", "Major",
                  "Records whose COM_CODE is absent from the boundary reference",
                  orphan_com)

    # ---- 5. Referential integrity: code <-> name conflicts -------------------
    for code_col, name_col, label in (
        ("PRO_CODE", "PRO_NAME_EN", "province"),
        ("DIS_CODE", "DIS_NAME_EN", "district"),
        ("COM_CODE", "COM__NAME_EN", "commune"),
    ):
        code_to_names = defaultdict(set)
        for r in rows:
            c = (r.get(code_col) or "").strip()
            nm = (r.get(name_col) or "").strip()
            if c and nm:
                code_to_names[c].add(nm)
        table = [[c, " | ".join(sorted(ns)), len(ns)]
                 for c, ns in sorted(code_to_names.items()) if len(ns) > 1]
        ex.write_table(
            f"integrity_{label}_code_name_conflict", "Integrity", "Major",
            f"{label.title()} codes mapped to more than one English name",
            [f"{label}_code", "conflicting_names", "name_count"], table)

    # ---- 6. Duplicated names across areas ------------------------------------
    com_name_codes = defaultdict(set)
    for r in rows:
        nm = (r.get("COM__NAME_EN") or "").strip()
        c = (r.get("COM_CODE") or "").strip()
        if nm and c:
            com_name_codes[nm].add(c)
    reused_com = [[nm, len(cs), " | ".join(sorted(cs))]
                  for nm, cs in com_name_codes.items() if len(cs) > 1]
    reused_com.sort(key=lambda x: -x[1])
    ex.write_table("dupnames_reused_commune_names", "Duplicated names", "Minor",
                   "Commune names shared by multiple distinct communes",
                   ["commune_name", "commune_count", "commune_codes"], reused_com)

    fac_eq_com = []
    for r in rows:
        fn = (r.get("NAME_EN") or "").strip().lower()
        cn = (r.get("COM__NAME_EN") or "").strip().lower()
        if fn and fn == cn:
            fac_eq_com.append(r)
    ex.write_rows("dupnames_facility_equals_commune", "Duplicated names", "Minor",
                  "Facility whose NAME_EN equals its commune name", fac_eq_com)

    fac_name_counts = Counter((r.get("NAME_EN") or "").strip()
                              for r in rows if (r.get("NAME_EN") or "").strip())
    reused_fac_names = {nm for nm, n in fac_name_counts.items() if n > 1}
    reused_fac_rows = [r for r in rows if (r.get("NAME_EN") or "").strip() in reused_fac_names]
    reused_fac_rows.sort(key=lambda r: (r.get("NAME_EN") or ""))
    ex.write_rows("dupnames_reused_facility_names", "Duplicated names", "Minor",
                  "Records whose NAME_EN is shared by other facilities",
                  reused_fac_rows)

    # ---- Manifest ------------------------------------------------------------
    ex.write_manifest()

    written = [m for m in ex.manifest if m[4]]
    print(f"Exported {len(written)} non-empty issue dataset(s) to "
          f"{os.path.relpath(OUT_DIR, REPO_ROOT)}/")
    for name, _cat, sev, _desc, count, fname in ex.manifest:
        flag = f"-> {fname}" if fname else "(empty, skipped)"
        print(f"  [{sev:<7}] {name:<40} {count:>5}  {flag}")


if __name__ == "__main__":
    main()
