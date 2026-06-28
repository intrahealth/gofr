#!/usr/bin/env python3
"""
Populate the HF_ID column of datasets/combined.csv with unique, valid Cambodia
HFIDs.

This is a faithful Python port of gofr-gui/src/plugins/hfid.js: a 6-digit
numeric string made of 5 random body digits plus one Damm-algorithm check digit
(a valid HFID drives the Damm interim value to 0). Every row receives a freshly
generated identifier and uniqueness is guaranteed across the file.

A fixed default --seed makes the assignment reproducible so the same checkout
yields the same IDs on re-run (re-seeding would churn identifiers that may have
already been ingested).

Usage:
    python3 generate_hfids.py [--csv datasets/combined.csv] [--seed 20260531]
"""
import argparse
import csv
import os
import random
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_CSV = os.path.join(REPO_ROOT, "datasets", "combined.csv")

# Damm quasigroup operation table — mathematical constant, identical to hfid.js.
DAMM_TABLE = [
    [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
    [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
    [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
    [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
    [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
    [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
    [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
    [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
    [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
    [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
]


def compute_check_digit(body):
    interim = 0
    for ch in body:
        interim = DAMM_TABLE[interim][int(ch)]
    return interim


def verify_hfid(numeric):
    if len(numeric) != 6 or not numeric.isdigit():
        return False
    interim = 0
    for ch in numeric:
        interim = DAMM_TABLE[interim][int(ch)]
    return interim == 0


def generate_hfid(rng):
    body = "".join(str(rng.randint(0, 9)) for _ in range(5))
    return body + str(compute_check_digit(body))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", default=DEFAULT_CSV)
    parser.add_argument("--seed", type=int, default=20260531)
    args = parser.parse_args()

    if not os.path.isfile(args.csv):
        sys.exit(f"CSV not found: {args.csv}")

    with open(args.csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if "HF_ID" not in fieldnames:
        sys.exit("HF_ID column not present in CSV")

    rng = random.Random(args.seed)
    used = set()
    for row in rows:
        hfid = generate_hfid(rng)
        while hfid in used:
            hfid = generate_hfid(rng)
        used.add(hfid)
        row["HF_ID"] = hfid

    # Sanity: all unique, all valid.
    assert len(used) == len(rows), "uniqueness invariant violated"
    assert all(verify_hfid(r["HF_ID"]) for r in rows), "produced an invalid HFID"

    with open(args.csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Assigned {len(rows)} unique Damm-valid HFIDs (seed {args.seed}) -> "
          f"{os.path.relpath(args.csv, REPO_ROOT)}")


if __name__ == "__main__":
    main()
