#!/usr/bin/env python3
"""
Merge the per-province Cambodia Health Facility Master List workbooks
(datasets/all-facilities-dataset.zip) into a single combined.csv that follows
the canonical CamDHEA facility schema consumed by ingest_combined.py.

Each workbook ("[EXT] Health Failicity Master List/<NN>-<Province>.xlsx") shares
the same layout:
  * a banner row, a blank row, then a header row containing HF_ID, HF_CODE, ...
  * facility rows below the header.

The merge:
  1. Walks every .xlsx member of the archive (no extraction to disk needed).
  2. Locates the header row by looking for the HF_CODE / NAME_EN markers, so the
     script is robust to a stray leading/blank row.
  3. Normalises each row to the 32-column canonical schema. Administrative codes
     that some workbooks store as numbers (losing leading zeros) are zero-padded
     back to their canonical widths; everything else is passed through verbatim
     (including sentinel values such as "NA" so data-quality issues stay visible).
  4. Writes datasets/combined.csv and prints a per-source summary.

Usage:
    python3 merge_facility_master_list.py \
        [--zip datasets/all-facilities-dataset.zip] \
        [--out datasets/combined.csv]
"""
import argparse
import csv
import io
import os
import sys
import zipfile
from datetime import date, datetime

import openpyxl

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_ZIP = os.path.join(REPO_ROOT, "datasets", "all-facilities-dataset.zip")
DEFAULT_OUT = os.path.join(REPO_ROOT, "datasets", "combined.csv")

CANONICAL_COLUMNS = [
    "HF_ID", "HF_CODE", "NAME_KH", "NAME_EN",
    "PRO_CODE", "PRO_NAME_KH", "PRO_NAME_EN",
    "DIS_CODE", "DIS_NAME_KH", "DIS_NAME_EN",
    "OD_CODE", "OD_NAME_KH", "OD_NAME_EN",
    "COM_CODE", "COM_NAME_KH", "COM__NAME_EN",
    "VIL_CODE", "VIL_NAME_KH", "VIL__NAME_EN",
    "OWNERSHIP", "ACRONYM", "HF_TYPE_EN", "HF_TYPE_KH", "HF_LEVEL",
    "HF_HEAD", "CONTACT_NO", "CONTACT_EMAIL",
    "HF_LAT", "HF_LON", "START_DATE", "GOOGLE_MAP_LINK", "STATUS",
]

# Administrative-code columns and their canonical fixed widths. Numeric cells are
# zero-padded back to these widths; non-numeric values (e.g. "NA") are kept as-is.
CODE_WIDTHS = {
    "HF_CODE": 6,
    "PRO_CODE": 2,
    "DIS_CODE": 4,
    "OD_CODE": 4,
    "COM_CODE": 6,
    "VIL_CODE": 8,
}

# Invisible characters that corrupt otherwise-clean numeric codes (e.g. a stray
# zero-width space pasted into Excel). These are NOT caught by str.strip() or
# str.isspace(), so they are removed explicitly. All Unicode whitespace is also
# stripped from code columns.
ZERO_WIDTH_CHARS = {
    "\u200b",  # zero width space
    "\u200c",  # zero width non-joiner
    "\u200d",  # zero width joiner
    "\u2060",  # word joiner
    "\ufeff",  # zero width no-break space / BOM
}


def clean_code(text):
    """Strip zero-width and whitespace characters from an admin-code string.

    Preserves non-numeric sentinels such as 'NA' (kept visible as a data-quality
    flag) while recovering codes that are clean apart from invisible junk, e.g.
    '08​020610' -> '08020610'.
    """
    return "".join(
        ch for ch in text
        if ch not in ZERO_WIDTH_CHARS and not ch.isspace()
    )


def find_header_row(ws, max_scan=10):
    """Return (row_index, {column_name: column_position}) for the header row."""
    for ri, row in enumerate(ws.iter_rows(min_row=1, max_row=max_scan, values_only=True)):
        vals = [str(c).strip() if c is not None else "" for c in row]
        if "HF_CODE" in vals and "NAME_EN" in vals:
            positions = {}
            for pos, name in enumerate(vals):
                if name and name not in positions:
                    positions[name] = pos
            return ri + 1, positions  # openpyxl rows are 1-based
    return None, None


def normalise_cell(column, value):
    """Coerce a single cell to its canonical string form."""
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        # START_DATE in the canonical CSV uses dd/mm/YYYY.
        return value.strftime("%d/%m/%Y")
    if column in CODE_WIDTHS:
        width = CODE_WIDTHS[column]
        if isinstance(value, float) and value.is_integer():
            value = int(value)
        if isinstance(value, int):
            return str(value).zfill(width)
        text = clean_code(str(value))
        if text.isdigit():
            return text.zfill(width)
        return text
    if isinstance(value, float):
        # Avoid scientific notation / trailing .0 for whole numbers.
        if value.is_integer():
            return str(int(value))
        return repr(value)
    return str(value).strip()


def read_workbook(raw_bytes, source_label):
    """Yield canonical-dict rows from a single workbook's active sheet."""
    wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), read_only=True, data_only=True)
    ws = wb.active
    header_row, positions = find_header_row(ws)
    if header_row is None:
        wb.close()
        raise ValueError(f"No HF_CODE/NAME_EN header row found in {source_label}")

    missing = [c for c in CANONICAL_COLUMNS if c not in positions]
    if missing:
        print(f"  WARNING [{source_label}]: missing columns {missing}", file=sys.stderr)

    hf_pos = positions["HF_CODE"]
    rows = []
    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        # Skip fully blank rows and rows with no facility code at all.
        if hf_pos >= len(row) or row[hf_pos] in (None, ""):
            if all(c in (None, "") for c in row):
                continue
            # Row has data but no HF_CODE — keep it so the gap is visible.
        out = {}
        for col in CANONICAL_COLUMNS:
            pos = positions.get(col)
            raw = row[pos] if (pos is not None and pos < len(row)) else None
            out[col] = normalise_cell(col, raw)
        if all(v == "" for v in out.values()):
            continue
        rows.append(out)
    wb.close()
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", default=DEFAULT_ZIP, help="Path to the master-list zip archive")
    parser.add_argument("--out", default=DEFAULT_OUT, help="Path to write the merged combined.csv")
    args = parser.parse_args()

    if not os.path.isfile(args.zip):
        sys.exit(f"Archive not found: {args.zip}")

    archive = zipfile.ZipFile(args.zip)
    members = sorted(n for n in archive.namelist() if n.lower().endswith(".xlsx"))
    if not members:
        sys.exit("No .xlsx members found in archive")

    print(f"Merging {len(members)} workbook(s) from {os.path.relpath(args.zip, REPO_ROOT)}")

    all_rows = []
    per_source = []
    for member in members:
        label = os.path.basename(member)
        rows = read_workbook(archive.read(member), label)
        per_source.append((label, len(rows)))
        all_rows.extend(rows)
        print(f"  {label:<60} {len(rows):>5} rows")
    archive.close()

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CANONICAL_COLUMNS)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nWrote {len(all_rows)} facility rows -> {os.path.relpath(args.out, REPO_ROOT)}")


if __name__ == "__main__":
    main()
