# Cambodia Health Facility Master List — Data Quality Report

_Generated 2026-06-01 00:08 from `datasets/combined.csv` (1521 facility records)._

Reference denominators: **25 provinces**, **197 districts**, **1,633 communes** (national administrative boundary layers, valid 2018).

## 1. Completeness — field fill rates

| Field | Dictionary mapping | Required | Populated | Fill rate |
|---|---|:--:|--:|--:|
| HF_ID |  |  | 1521 | 100.0% |
| HF_CODE | legacy_hf_code / hfid | ✅ | 1471 | 96.7% |
| NAME_KH | facility_name (Khmer) | ✅ | 1520 | 99.9% |
| NAME_EN | facility_name (Latin) | ✅ | 1520 | 99.9% |
| PRO_CODE | province_code | ✅ | 1519 | 99.9% |
| PRO_NAME_KH |  |  | 1520 | 99.9% |
| PRO_NAME_EN |  |  | 1520 | 99.9% |
| DIS_CODE | district_code | ✅ | 1512 | 99.4% |
| DIS_NAME_KH |  |  | 1513 | 99.5% |
| DIS_NAME_EN |  |  | 1513 | 99.5% |
| OD_CODE | od_code | ✅ | 1515 | 99.6% |
| OD_NAME_KH |  |  | 1517 | 99.7% |
| OD_NAME_EN |  |  | 1517 | 99.7% |
| COM_CODE | commune_code | ✅ | 1505 | 98.9% |
| COM_NAME_KH |  |  | 1510 | 99.3% |
| COM__NAME_EN |  |  | 1503 | 98.8% |
| VIL_CODE | village_code | ✅ | 1500 | 98.6% |
| VIL_NAME_KH |  |  | 1502 | 98.8% |
| VIL__NAME_EN |  |  | 1495 | 98.3% |
| OWNERSHIP | ownership_type | ✅ | 1505 | 98.9% |
| ACRONYM |  |  | 1513 | 99.5% |
| HF_TYPE_EN | facility_type | ✅ | 1515 | 99.6% |
| HF_TYPE_KH |  |  | 1515 | 99.6% |
| HF_LEVEL | facility_level | ✅ | 228 | 15.0% |
| HF_HEAD |  |  | 1188 | 78.1% |
| CONTACT_NO | contact_number | ✅ | 1178 | 77.4% |
| CONTACT_EMAIL |  |  | 177 | 11.6% |
| HF_LAT | gps_latitude | ✅ | 1496 | 98.4% |
| HF_LON | gps_longitude | ✅ | 1496 | 98.4% |
| START_DATE | start_date | ✅ | 1463 | 96.2% |
| GOOGLE_MAP_LINK |  |  | 456 | 30.0% |
| STATUS | operational_status | ✅ | 1499 | 98.6% |

**Most-incomplete required fields:** `HF_LEVEL` (15.0%), `CONTACT_NO` (77.4%), `START_DATE` (96.2%), `HF_CODE` (96.7%), `HF_LAT` (98.4%).

## 2. Validity / conformance

### 2.1 Administrative-code format

| Code | Expected | Blank/NA | Wrong length | Non-numeric |
|---|---|--:|--:|--:|
| HF_CODE | 6 digits | 50 | 48 | 0 |
| PRO_CODE | 2 digits | 2 | 0 | 0 |
| DIS_CODE | 4 digits | 9 | 0 | 0 |
| COM_CODE | 6 digits | 16 | 1 | 0 |
| VIL_CODE | 8 digits | 21 | 1 | 0 |

### 2.2 Hierarchy nesting (pcode prefix consistency)

- **COM not under DIS:** 51 record(s)
- **DIS not under PRO:** 7 record(s)
- **VIL not under COM:** 14 record(s)

### 2.3 GPS coordinates

- Missing latitude or longitude: **25**
- Unparseable coordinate: **0**
- Null Island (0,0): **0**
- Outside Cambodia bounding box (lat 9.5–15.0, lon 101.0–108.0): **0**

### 2.4 Controlled values & placeholders

- **STATUS** (3 distinct): `Operational`×1497, `(blank)`×22, `Pending`×2
- **HF_TYPE_EN** (9 distinct): `Health Center`×1243, `Referral Hospital`×94, `Health Post`×73, `Health Center with beds`×67, `Provincial Hospital`×23, `National Hospital`×13, `(blank)`×6, `Health Cente`×1
- **OWNERSHIP** (10 distinct): `DPHI (GPS)`×1442, `PHD Kampot`×21, `DPHI (Google Map)`×20, `(blank)`×16, `Survey123 (WHO)`×14, `BTB (Phone)`×2, `KEP (GPS)`×2, `Pailin (GPS)`×2
- **HF_LEVEL** (6 distinct): `(blank)`×1293, `MPA`×202, `CPA1`×12, `CPA2`×8, `CPA3`×4, `NoneMPA`×2
- **CONTACT_EMAIL** placeholder values (None/NA/etc.): **1324**

### 2.5 Dates (START_DATE)

- Unparseable START_DATE: **51**
- Future-dated START_DATE: **0**

## 3. Uniqueness & duplicates

- Records with a usable HF_CODE: **1471** / 1521 (missing/NA: **50**)
- **Duplicate HF_CODE values:** 12 code(s) affecting 25 records: `010324`×2, `010507`×2, `12030303`×2, `120705`×2, `200317`×2, `200318`×2, `040122`×2, `040124`×2, `040213`×3, `050120`×2
- **Exact duplicate rows** (all fields identical): **0**
- **Same facility name repeated within one commune:** 7 name/commune pair(s)
    - `HC Bos Sbov` ×2 in commune 010409
    - `HC Ponley` ×2 in commune 010303
    - `HP Kuon Klaeng` ×2 in commune 010302
    - `HP Prey Speu` ×2 in commune 120915
    - `HP Anlong Korng` ×2 in commune 120510
    - `HC Spean Thmar` ×2 in commune 120518
    - `HC Baray` ×2 in commune 210801

## 4. Coverage gaps

### 4.1 Provinces: 25 of 25 have ≥1 facility

- Every province with a boundary code has at least one facility. ✅

### 4.2 Districts: 195 of 197 reference districts covered

- **Districts with NO facilities:** 2
    - 0110 — Paoy Paet (Banteay Meanchey)
    - 1308 — Preah Vihear (Preah Vihear)
- **District codes in data but NOT in 2018 boundary reference (orphan/new codes):** 8: 0000, 0001, 0812, 0813, 1007, 1214, 1805, 1806

### 4.3 Communes: 1194 of 1633 reference communes covered

- **Communes with NO facilities:** 439 (26.9% of all communes)
- **Commune codes in data but NOT in boundary reference:** 33: 000000, 000001, 040809, 060901, 081301, 081302, 081305, 081306, 081307, 100506, 100701, 100702, 100704, 100705, 110198, 110199, 110200, 120609, 120915, 120917
- Full list of uncovered communes is large; export with the script's `--dump-gaps` extension if a line-item list is required.

### 4.4 Villages

- Distinct villages represented in the data: **1359**
- No national village registry is bundled in the repo, so *villages with no facilities* cannot be enumerated against a complete denominator. (Cambodia has ~14,000 villages; this dataset references 1359.) Recommend loading a village master list to close this gap.

## 5. Referential integrity (code ↔ name consistency)

- **Province**: 2 code(s) map to >1 English name; 1 name(s) map to >1 code.
    - code `22` → ['Oddar Meanchey', 'Takeo']
    - code `23` → ['Kep', 'Takeo']
- **District**: 28 code(s) map to >1 English name; 18 name(s) map to >1 code.
    - code `0105` → ['Ou Chrov', 'Poipet']
    - code `0108` → ['Svay Chek', 'thmor  Puok']
    - code `0104` → ['Preah Net Preah', 'Preah Netr Preah']
    - code `0103` → ['Doun Penh', 'Phnum Srok', 'Preah Net Preah']
    - code `1201` → ['Boeung Keng Kang', 'Chamkar Mon']
- **Commune**: 27 code(s) map to >1 English name; 86 name(s) map to >1 code.
    - code `010509` → ['KutShort', 'Ou Beichoan', 'Poipet']
    - code `010807` → ['Kumrou', 'Treas']
    - code `010501` → ['Changha', 'Soeng']
    - code `010701` → ['Banteay Chhmar', 'Rolous']
    - code `010901` → ['Boeng Beng', 'Tuol Pongro']

## 6. Duplicated names across areas

- **Commune names shared by multiple distinct communes:** 86
    - `Samraong` used by 9 communes: ['010505', '031311', '121103', '141309', '150407', '171109', '210708', '210910', '220404']
    - `Mean Chey` used by 5 communes: ['020906', '031405', '060605', '070311', '170907']
    - `Prasat` used by 4 communes: ['010404', '060707', '081006', '140309']
    - `Pongro` used by 4 communes: ['040607', '060901', '100107', '220304']
    - `Sambour` used by 4 communes: ['030107', '060503', '100407', '200413']
    - `Chrey` used by 4 communes: ['020204', '020605', '140304', '141303']
    - `Chres` used by 4 communes: ['040503', '070401', '140502', '200104']
    - `Svay Chrum` used by 4 communes: ['040612', '081306', '140507', '200514']
    - `Popel` used by 4 communes: ['040109', '171108', '210909', '250506']
    - `Ampil` used by 4 communes: ['030601', '170910', '200401', '220201']
- **Facilities whose name equals their commune name:** 21
- **Facility names appearing on >1 record:** 59 name(s); top: `HC Samraong`×6, `HC Ponley`×5, `HC Sambour`×5, `HC Mean Chey`×5, `HC Baray`×5, `HC Prasat`×4, `HC Chres`×4, `HC Ampil`×4

## 7. Distribution & plausibility

### Facilities per province

| Province | Facilities |
|---|--:|
| Prey Veng | 125 |
| Kandal | 106 |
| Kampong Cham | 105 |
| Siemreap | 102 |
| Takeo | 100 |
| Banteay Meanchey | 97 |
| Battambang | 89 |
| Tboung Khmum | 82 |
| Phnom Penh | 78 |
| Kampot | 71 |
| Kampong Speu | 66 |
| Kampong Thom | 64 |
| Svay Rieng | 58 |
| Kampong Chhnang | 54 |
| Pursat | 52 |
| Kratie | 45 |
| Oddar Meanchey | 41 |
| Ratanak Kiri | 38 |
| Preah Vihear | 32 |
| Mondul Kiri | 30 |
| Koh Kong | 29 |
| Preah Sihanouk | 23 |
| Stung Treng | 19 |
| Pailin | 8 |
| Kep | 6 |
| ? | 1 |

### Facilities per type

- Health Center: 1243
- Referral Hospital: 94
- Health Post: 73
- Health Center with beds: 67
- Provincial Hospital: 23
- National Hospital: 13
- (blank): 6
- Health Cente: 1
- Provincial hospital: 1

## 8. Summary scorecard

| Dimension | Key finding |
|---|---|
| Volume | 1521 records across 25 provinces |
| Primary key (HF_ID) | 100.0% populated — ✅ |
| HF_CODE usable | 1471 (96.7%); 12 duplicates |
| GPS present & in-country | 1496 clean |
| District coverage | 195/197 (2 empty) |
| Commune coverage | 1194/1633 (439 empty) |
| Orphan codes | 8 district, 33 commune |

