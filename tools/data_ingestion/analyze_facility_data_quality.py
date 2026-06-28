#!/usr/bin/env python3
"""
Data-quality analysis for the merged Cambodia Health Facility Master List
(datasets/combined.csv).

Runs the checks documented in
docs/data_quality/facility-data-quality-plan.md and writes a Markdown report to
docs/data_quality/facility-data-quality-report.md.

Reference denominators for coverage gaps come from the national administrative
boundary layers shipped alongside the ingestion tooling:
  * kh_districts.geojson  (adm2_pcode)  -> 197 districts
  * kh_communes.geojson   (adm3_pcode)  -> 1633 communes
There is no national *village* registry in the repo, so village-level coverage
is reported only for villages that appear in the data.

Usage:
    python3 analyze_facility_data_quality.py
"""
import csv
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CSV_PATH = os.path.join(REPO_ROOT, "datasets", "combined.csv")
DISTRICTS = os.path.join(HERE, "kh_districts.geojson")
COMMUNES = os.path.join(HERE, "kh_communes.geojson")
OUT_PATH = os.path.join(REPO_ROOT, "docs", "data_quality", "facility-data-quality-report.md")

# Fields the FHIR R4 data dictionary marks as Required (mapped to CSV columns).
REQUIRED = {
    "HF_CODE": "legacy_hf_code / hfid", "NAME_KH": "facility_name (Khmer)",
    "NAME_EN": "facility_name (Latin)", "HF_TYPE_EN": "facility_type",
    "HF_LEVEL": "facility_level", "OWNERSHIP": "ownership_type",
    "PRO_CODE": "province_code", "DIS_CODE": "district_code",
    "OD_CODE": "od_code", "COM_CODE": "commune_code", "VIL_CODE": "village_code",
    "HF_LAT": "gps_latitude", "HF_LON": "gps_longitude",
    "CONTACT_NO": "contact_number", "STATUS": "operational_status",
    "START_DATE": "start_date",
}

CODE_WIDTHS = {"HF_CODE": 6, "PRO_CODE": 2, "DIS_CODE": 4, "COM_CODE": 6, "VIL_CODE": 8}
SENTINELS = {"", "na", "n/a", "none", "null", "-", "unknown"}
# Cambodia bounding box (generous), used for GPS plausibility.
KH_LAT = (9.5, 15.0)
KH_LON = (101.0, 108.0)


def is_blank(v):
    return v is None or str(v).strip().lower() in SENTINELS


def load_rows():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


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


def pct(n, d):
    return f"{(100.0 * n / d):.1f}%" if d else "n/a"


def main():
    rows = load_rows()
    n = len(rows)
    districts_ref = load_pcodes(DISTRICTS, "adm2_pcode")
    communes_ref = load_pcodes(COMMUNES, "adm3_pcode")
    # Province codes implied by the district reference (adm1_pcode).
    prov_ref = set()
    with open(DISTRICTS, encoding="utf-8") as f:
        for feat in json.load(f)["features"]:
            pc = (feat["properties"].get("adm1_pcode") or "").replace("KH", "", 1)
            if pc:
                prov_ref.add(pc)

    L = []  # report lines
    def w(s=""):
        L.append(s)

    w("# Cambodia Health Facility Master List — Data Quality Report")
    w()
    w(f"_Generated {datetime.now():%Y-%m-%d %H:%M} from "
      f"`datasets/combined.csv` ({n} facility records)._")
    w()
    w(f"Reference denominators: **{len(prov_ref)} provinces**, "
      f"**{len(districts_ref)} districts**, **{len(communes_ref):,} communes** "
      "(national administrative boundary layers, valid 2018).")
    w()

    # ---------------------------------------------------------------- 1. Completeness
    w("## 1. Completeness — field fill rates")
    w()
    w("| Field | Dictionary mapping | Required | Populated | Fill rate |")
    w("|---|---|:--:|--:|--:|")
    fill = {}
    for col in rows[0].keys():
        filled = sum(0 if is_blank(r.get(col)) else 1 for r in rows)
        fill[col] = filled
        req = "✅" if col in REQUIRED else ""
        mapping = REQUIRED.get(col, "")
        w(f"| {col} | {mapping} | {req} | {filled} | {pct(filled, n)} |")
    w()
    worst = sorted(
        [(c, fill[c]) for c in REQUIRED if c in fill],
        key=lambda x: x[1],
    )[:5]
    w("**Most-incomplete required fields:** "
      + ", ".join(f"`{c}` ({pct(v, n)})" for c, v in worst) + ".")
    w()

    # ---------------------------------------------------------------- 2. Validity
    w("## 2. Validity / conformance")
    w()
    # 2a Code format
    w("### 2.1 Administrative-code format")
    w()
    w("| Code | Expected | Blank/NA | Wrong length | Non-numeric |")
    w("|---|---|--:|--:|--:|")
    for col, width in CODE_WIDTHS.items():
        blank = wrong = nonnum = 0
        for r in rows:
            v = (r.get(col) or "").strip()
            if is_blank(v):
                blank += 1
                continue
            if not v.isdigit():
                nonnum += 1
            elif len(v) != width:
                wrong += 1
        w(f"| {col} | {width} digits | {blank} | {wrong} | {nonnum} |")
    w()
    # 2b Hierarchy nesting (pcode prefixes)
    w("### 2.2 Hierarchy nesting (pcode prefix consistency)")
    w()
    nest_fail = defaultdict(int)
    for r in rows:
        pro, dis, com, vil = (r.get(c, "").strip() for c in ("PRO_CODE", "DIS_CODE", "COM_CODE", "VIL_CODE"))
        if dis and pro and not dis.startswith(pro):
            nest_fail["DIS not under PRO"] += 1
        if com and dis and not com.startswith(dis):
            nest_fail["COM not under DIS"] += 1
        if vil and com and not vil.startswith(com):
            nest_fail["VIL not under COM"] += 1
    if nest_fail:
        for k, v in nest_fail.items():
            w(f"- **{k}:** {v} record(s)")
    else:
        w("- All populated codes nest correctly. ✅")
    w()
    # 2c GPS plausibility
    w("### 2.3 GPS coordinates")
    w()
    bad_parse = out_box = null_island = missing = 0
    for r in rows:
        la, lo = (r.get("HF_LAT", "").strip(), r.get("HF_LON", "").strip())
        if not la or not lo:
            missing += 1
            continue
        try:
            la, lo = float(la), float(lo)
        except ValueError:
            bad_parse += 1
            continue
        if la == 0 and lo == 0:
            null_island += 1
        elif not (KH_LAT[0] <= la <= KH_LAT[1] and KH_LON[0] <= lo <= KH_LON[1]):
            out_box += 1
    w(f"- Missing latitude or longitude: **{missing}**")
    w(f"- Unparseable coordinate: **{bad_parse}**")
    w(f"- Null Island (0,0): **{null_island}**")
    w(f"- Outside Cambodia bounding box "
      f"(lat {KH_LAT[0]}–{KH_LAT[1]}, lon {KH_LON[0]}–{KH_LON[1]}): **{out_box}**")
    w()
    # 2d Controlled vocabularies & sentinels
    w("### 2.4 Controlled values & placeholders")
    w()
    for col in ("STATUS", "HF_TYPE_EN", "OWNERSHIP", "HF_LEVEL"):
        counts = Counter((r.get(col) or "").strip() or "(blank)" for r in rows)
        top = ", ".join(f"`{k}`×{v}" for k, v in counts.most_common(8))
        w(f"- **{col}** ({len(counts)} distinct): {top}")
    email_sentinel = sum(
        1 for r in rows
        if (r.get("CONTACT_EMAIL") or "").strip()
        and (r.get("CONTACT_EMAIL") or "").strip().lower() in SENTINELS
    )
    w(f"- **CONTACT_EMAIL** placeholder values (None/NA/etc.): **{email_sentinel}**")
    w()
    # 2e Dates
    w("### 2.5 Dates (START_DATE)")
    w()
    unparsable = future = 0
    today = datetime.now()
    for r in rows:
        s = (r.get("START_DATE") or "").strip()
        if not s:
            continue
        dt = None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"):
            try:
                dt = datetime.strptime(s, fmt)
                break
            except ValueError:
                continue
        if dt is None:
            unparsable += 1
        elif dt > today:
            future += 1
    w(f"- Unparseable START_DATE: **{unparsable}**")
    w(f"- Future-dated START_DATE: **{future}**")
    w()

    # ---------------------------------------------------------------- 3. Uniqueness
    w("## 3. Uniqueness & duplicates")
    w()
    hf_codes = [r.get("HF_CODE", "").strip() for r in rows if not is_blank(r.get("HF_CODE"))]
    dup_codes = {c: v for c, v in Counter(hf_codes).items() if v > 1}
    w(f"- Records with a usable HF_CODE: **{len(hf_codes)}** / {n} "
      f"(missing/NA: **{n - len(hf_codes)}**)")
    w(f"- **Duplicate HF_CODE values:** {len(dup_codes)} code(s) affecting "
      f"{sum(dup_codes.values())} records"
      + (": " + ", ".join(f"`{c}`×{v}" for c, v in list(dup_codes.items())[:10]) if dup_codes else ""))
    # Exact duplicate rows (whole record)
    seen, exact_dup = set(), 0
    for r in rows:
        key = tuple(r.values())
        if key in seen:
            exact_dup += 1
        seen.add(key)
    w(f"- **Exact duplicate rows** (all fields identical): **{exact_dup}**")
    # Same facility name within the same commune (likely duplicate facility)
    name_in_commune = defaultdict(list)
    for r in rows:
        nm = (r.get("NAME_EN") or "").strip().lower()
        com = (r.get("COM_CODE") or "").strip()
        if nm and com:
            name_in_commune[(com, nm)].append(r)
    dup_name_commune = {k: v for k, v in name_in_commune.items() if len(v) > 1}
    w(f"- **Same facility name repeated within one commune:** "
      f"{len(dup_name_commune)} name/commune pair(s)")
    for (com, nm), recs in list(dup_name_commune.items())[:10]:
        w(f"    - `{recs[0].get('NAME_EN')}` ×{len(recs)} in commune {com}")
    w()

    # ---------------------------------------------------------------- 4. Coverage gaps
    w("## 4. Coverage gaps")
    w()
    data_prov = {r.get("PRO_CODE", "").strip() for r in rows if r.get("PRO_CODE", "").strip()}
    data_dist = {r.get("DIS_CODE", "").strip() for r in rows if r.get("DIS_CODE", "").strip()}
    data_com = {r.get("COM_CODE", "").strip() for r in rows if r.get("COM_CODE", "").strip()}
    data_vil = {r.get("VIL_CODE", "").strip() for r in rows if r.get("VIL_CODE", "").strip()}

    # Provinces
    prov_no_fac = sorted(prov_ref - data_prov)
    w(f"### 4.1 Provinces: {len(data_prov)} of {len(prov_ref)} have ≥1 facility")
    w()
    if prov_no_fac:
        w(f"- **Provinces with NO facilities:** {', '.join(prov_no_fac)}")
    else:
        w("- Every province with a boundary code has at least one facility. ✅")
    w()

    # Districts
    dist_no_fac = sorted(set(districts_ref) - data_dist)
    dist_orphan = sorted(data_dist - set(districts_ref))
    w(f"### 4.2 Districts: {len(data_dist & set(districts_ref))} of "
      f"{len(districts_ref)} reference districts covered")
    w()
    w(f"- **Districts with NO facilities:** {len(dist_no_fac)}")
    for code in dist_no_fac[:25]:
        nm = districts_ref[code].get("adm2_name", "?")
        prov = districts_ref[code].get("adm1_name", "?")
        w(f"    - {code} — {nm} ({prov})")
    if len(dist_no_fac) > 25:
        w(f"    - …and {len(dist_no_fac) - 25} more (see CSV export).")
    w(f"- **District codes in data but NOT in 2018 boundary reference "
      f"(orphan/new codes):** {len(dist_orphan)}"
      + (": " + ", ".join(dist_orphan[:20]) if dist_orphan else ""))
    w()

    # Communes
    com_no_fac = sorted(set(communes_ref) - data_com)
    com_orphan = sorted(data_com - set(communes_ref))
    w(f"### 4.3 Communes: {len(data_com & set(communes_ref))} of "
      f"{len(communes_ref)} reference communes covered")
    w()
    w(f"- **Communes with NO facilities:** {len(com_no_fac)} "
      f"({pct(len(com_no_fac), len(communes_ref))} of all communes)")
    w(f"- **Commune codes in data but NOT in boundary reference:** {len(com_orphan)}"
      + (": " + ", ".join(com_orphan[:20]) if com_orphan else ""))
    w("- Full list of uncovered communes is large; export with the script's "
      "`--dump-gaps` extension if a line-item list is required.")
    w()

    # Villages
    w("### 4.4 Villages")
    w()
    w(f"- Distinct villages represented in the data: **{len(data_vil)}**")
    w("- No national village registry is bundled in the repo, so *villages with "
      "no facilities* cannot be enumerated against a complete denominator. "
      "(Cambodia has ~14,000 villages; this dataset references "
      f"{len(data_vil)}.) Recommend loading a village master list to close this gap.")
    w()

    # ---------------------------------------------------------------- 5. Referential integrity
    w("## 5. Referential integrity (code ↔ name consistency)")
    w()
    for code_col, name_col, label in (
        ("PRO_CODE", "PRO_NAME_EN", "province"),
        ("DIS_CODE", "DIS_NAME_EN", "district"),
        ("COM_CODE", "COM__NAME_EN", "commune"),
    ):
        code_to_names = defaultdict(set)
        name_to_codes = defaultdict(set)
        for r in rows:
            c = (r.get(code_col) or "").strip()
            nm = (r.get(name_col) or "").strip()
            if c and nm:
                code_to_names[c].add(nm)
                name_to_codes[nm].add(c)
        one_code_many_names = {c: ns for c, ns in code_to_names.items() if len(ns) > 1}
        one_name_many_codes = {nm: cs for nm, cs in name_to_codes.items() if len(cs) > 1}
        w(f"- **{label.title()}**: {len(one_code_many_names)} code(s) map to "
          f">1 English name; {len(one_name_many_codes)} name(s) map to >1 code.")
        for c, ns in list(one_code_many_names.items())[:5]:
            w(f"    - code `{c}` → {sorted(ns)}")
    w()

    # ---------------------------------------------------------------- 6. Duplicated names across areas
    w("## 6. Duplicated names across areas")
    w()
    # Commune names reused across different communes
    com_name_codes = defaultdict(set)
    for r in rows:
        nm = (r.get("COM__NAME_EN") or "").strip()
        c = (r.get("COM_CODE") or "").strip()
        if nm and c:
            com_name_codes[nm].add(c)
    reused_com = {nm: cs for nm, cs in com_name_codes.items() if len(cs) > 1}
    w(f"- **Commune names shared by multiple distinct communes:** {len(reused_com)}")
    for nm, cs in sorted(reused_com.items(), key=lambda x: -len(x[1]))[:10]:
        w(f"    - `{nm}` used by {len(cs)} communes: {sorted(cs)}")
    # Facility name == commune name (possible name carried over from area)
    fac_eq_com = 0
    for r in rows:
        fn = (r.get("NAME_EN") or "").strip().lower()
        cn = (r.get("COM__NAME_EN") or "").strip().lower()
        if fn and fn == cn:
            fac_eq_com += 1
    w(f"- **Facilities whose name equals their commune name:** {fac_eq_com}")
    # Facility names reused across many facilities
    fac_names = Counter((r.get("NAME_EN") or "").strip() for r in rows if (r.get("NAME_EN") or "").strip())
    reused_fac = {nm: c for nm, c in fac_names.items() if c > 1}
    w(f"- **Facility names appearing on >1 record:** {len(reused_fac)} name(s); "
      f"top: " + ", ".join(f"`{nm}`×{c}" for nm, c in fac_names.most_common(8)))
    w()

    # ---------------------------------------------------------------- 7. Distribution
    w("## 7. Distribution & plausibility")
    w()
    by_prov = Counter((r.get("PRO_NAME_EN") or "?").strip() for r in rows)
    w("### Facilities per province")
    w()
    w("| Province | Facilities |")
    w("|---|--:|")
    for p, c in by_prov.most_common():
        w(f"| {p} | {c} |")
    w()
    by_type = Counter((r.get("HF_TYPE_EN") or "(blank)").strip() for r in rows)
    w("### Facilities per type")
    w()
    for t, c in by_type.most_common():
        w(f"- {t}: {c}")
    w()

    # ---------------------------------------------------------------- Summary scorecard
    w("## 8. Summary scorecard")
    w()
    w("| Dimension | Key finding |")
    w("|---|---|")
    w(f"| Volume | {n} records across {len(data_prov)} provinces |")
    hfid_rate = fill.get("HF_ID", 0)
    hfid_note = "✅" if hfid_rate == n else "**critical gap**"
    w(f"| Primary key (HF_ID) | {pct(hfid_rate, n)} populated — {hfid_note} |")
    w(f"| HF_CODE usable | {len(hf_codes)} ({pct(len(hf_codes), n)}); "
      f"{len(dup_codes)} duplicates |")
    w(f"| GPS present & in-country | "
      f"{n - missing - bad_parse - out_box - null_island} clean |")
    w(f"| District coverage | {len(data_dist & set(districts_ref))}/"
      f"{len(districts_ref)} ({len(dist_no_fac)} empty) |")
    w(f"| Commune coverage | {len(data_com & set(communes_ref))}/"
      f"{len(communes_ref)} ({len(com_no_fac)} empty) |")
    w(f"| Orphan codes | {len(dist_orphan)} district, {len(com_orphan)} commune |")
    w()

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")
    print(f"Wrote report -> {os.path.relpath(OUT_PATH, REPO_ROOT)} ({len(L)} lines)")


if __name__ == "__main__":
    main()
