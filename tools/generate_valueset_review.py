#!/usr/bin/env python3
"""
Generate CamDHEA Facility Registry – Value Set Validation Workbook
Produces an Excel file suitable for sending to the program team for code / display
name / definition review and sign-off.

Usage:
    python3 generate_valueset_review.py
Output:
    ../datasets/CamDHEA-ValueSet-Validation-<date>.xlsx
"""

import os
from datetime import date
from openpyxl import Workbook
from openpyxl.styles import (
    PatternFill, Font, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

# ── Colour palette ────────────────────────────────────────────────────────────
C_NAVY       = "0D2B55"   # header background
C_TEAL       = "0A7373"   # section header background
C_LIGHT_BLUE = "D9EEF3"   # alternating row A
C_WHITE      = "FFFFFF"
C_AMBER      = "FFF3CD"   # conditional / placeholder
C_GREEN      = "D6F5D6"   # approved
C_RED        = "FADADD"   # reject
C_GREY       = "F5F5F5"   # alternating row B
C_GOLD       = "FFD700"   # index accent

FONT_MAIN    = "Calibri"

# ── Helper styles ─────────────────────────────────────────────────────────────
def hdr_font(size=11, bold=True, color=C_WHITE):
    return Font(name=FONT_MAIN, size=size, bold=bold, color=color)

def body_font(size=10, bold=False, color="000000"):
    return Font(name=FONT_MAIN, size=size, bold=bold, color=color)

def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def thin_border():
    s = Side(style="thin", color="BBBBBB")
    return Border(left=s, right=s, top=s, bottom=s)

def wrap_center():
    return Alignment(wrap_text=True, vertical="top", horizontal="center")

def wrap_left():
    return Alignment(wrap_text=True, vertical="top", horizontal="left")

def apply_header_row(ws, headers, row=1, bg=C_NAVY, fg=C_WHITE,
                     font_size=10, col_start=1):
    for i, h in enumerate(headers, start=col_start):
        c = ws.cell(row=row, column=i, value=h)
        c.font      = Font(name=FONT_MAIN, size=font_size, bold=True, color=fg)
        c.fill      = fill(bg)
        c.alignment = Alignment(wrap_text=True, vertical="center",
                                horizontal="center")
        c.border    = thin_border()

def style_data_row(ws, row_num, col_count, alt=False, col_start=1):
    bg = C_LIGHT_BLUE if alt else C_WHITE
    for col in range(col_start, col_start + col_count):
        c = ws.cell(row=row_num, column=col)
        c.fill      = fill(bg)
        c.font      = body_font()
        c.border    = thin_border()
        c.alignment = wrap_left()

def freeze_and_filter(ws, freeze_cell="A2"):
    ws.freeze_panes = freeze_cell
    ws.auto_filter.ref = ws.dimensions

# ── Value set data ─────────────────────────────────────────────────────────────
# Each VS entry:
#  id, name, description, fhir_system_uri, binding_strength,
#  fields_using, status, codes
#
#  code entry: (code, display, definition, usage_notes, applicable_sector,
#               status, sort_order)

VALUE_SETS = [

    # ── VS-001 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-001",
        "name": "Facility Identifier Type",
        "description": (
            "Type and issuing authority for each linked identifier recorded "
            "against a facility record. Used to qualify identifier entries in "
            "the facility_identifier table. Must be extended as new linked "
            "identifier types are brought into scope."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/facility-identifier-type",
        "fhir_binding": "Location.identifier.type (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "identifier_type",
        "status": "Active",
        "codes": [
            ("LegacyHFID",   "Legacy HFID",
             "H-prefixed 4-digit sequential identifier from the legacy MFL. "
             "Retained during 3-year transition period.",
             "Retired 3 years after facility registry go-live. "
             "System URI: https://camdhea.gov.kh/ns/legacy-hfid",
             "All", "Active", 1),
            ("LegacyHFCode", "Legacy HF Code",
             "6-digit geographic code (province+OD+sequence) from the legacy MFL. "
             "Retained during 3-year transition period.",
             "Retired on same schedule as LegacyHFID. "
             "System URI: https://camdhea.gov.kh/ns/legacy-hfcode",
             "All", "Active", 2),
            ("HSD",          "HSD Facility ID",
             "Facility identifier issued by the Department of Hospital Services "
             "for larger private facilities.",
             "Applicable where ownership_type = Private and licensed via HSD "
             "channel. Mutually exclusive with OWS. "
             "System URI: https://camdhea.gov.kh/ns/hsd-facility-id",
             "Private", "Active", 3),
            ("OWS",          "OWS Registration ID",
             "Facility registration identifier issued via the One Window Service "
             "for smaller private facilities.",
             "Applicable where ownership_type = Private and licensed via OWS "
             "channel. Mutually exclusive with HSD. "
             "System URI: https://camdhea.gov.kh/ns/ows-registration-id",
             "Private", "Active", 4),
            ("MoP",          "Ministry of Planning Code",
             "Ministry of Planning facility code retained as a permanent linked "
             "identifier for cross-ministry data exchange.",
             "Not subject to health sector 3-year retirement timeline. "
             "System URI: https://camdhea.gov.kh/ns/mop-facility-code",
             "All", "Active", 5),
        ],
    },

    # ── VS-002 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-002",
        "name": "Name Use",
        "description": (
            "Indicates the purpose or context of a facility or managing entity "
            "name instance (official current name vs. previous/former name). "
            "Derived from FHIR R4 name use concept."
        ),
        "fhir_system_uri": "http://hl7.org/fhir/name-use",
        "fhir_binding": "Location.name (official) | Location.alias (old/alternate)",
        "binding_strength": "Required",
        "fields_using": "name_use; managing_entity_name_use",
        "status": "Active",
        "codes": [
            ("official", "Official",
             "The current, formal, legally recognised name of the facility.",
             "At minimum one Khmer-script official name is required per facility.",
             "All", "Active", 1),
            ("old", "Former / Previous",
             "A name that was previously used by the facility but is no longer "
             "the official name.",
             "Retained for search disambiguation and historical record. "
             "Stored in Location.alias.",
             "All", "Active", 2),
        ],
    },

    # ── VS-003 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-003",
        "name": "Name Script",
        "description": (
            "Indicates the writing script in which a facility name or managing "
            "entity name instance is recorded. Applied via the HL7 translation "
            "extension to tag language/script on Location.name and Location.alias."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/name-script",
        "fhir_binding": "Extension: http://hl7.org/fhir/StructureDefinition/translation (language tag)",
        "binding_strength": "Required",
        "fields_using": "name_script; managing_entity_name_script",
        "status": "Active",
        "codes": [
            ("Khmer", "Khmer",
             "Name recorded in Khmer script (Unicode Khmer block, km-KH).",
             "Minimum one Khmer-script official name required. "
             "Khmer is the legally authoritative script.",
             "All", "Active", 1),
            ("Latin", "Latin",
             "Name recorded in Latin script (romanisation of Khmer or English "
             "language name, km-Latn or en).",
             "Strongly recommended. Required for English-language reporting and "
             "system display. For private facilities with foreign ownership, "
             "the Latin script name may be the registered legal name.",
             "All", "Active", 2),
        ],
    },

    # ── VS-004 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-004",
        "name": "Facility Type",
        "description": (
            "Type of health facility as defined by the MoH facility classification "
            "framework. Used to determine the applicable service package, "
            "display acronym, and reporting category."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/facility-type",
        "fhir_binding": "Location.type (CodeableConcept, 0..*)",
        "binding_strength": "Required",
        "fields_using": "facility_type; facility_type_acronym (derived display)",
        "status": "Active",
        "codes": [
            ("HealthCenter",            "Health Center (HC)",
             "Primary health care facility delivering the Minimum Package of "
             "Activities (MPA). No in-patient beds.",
             "Most common public sector facility type. MPA service package expected.",
             "Public", "Active", 1),
            ("HealthCenterWithBed",     "Health Center with Bed (HCB)",
             "Health center with limited in-patient beds, typically for "
             "maternity or observation.",
             "Subset of health centers. Beds do not qualify as CPA.",
             "Public", "Active", 2),
            ("DistrictReferralHospital","District Referral Hospital (RH)",
             "District-level referral hospital delivering CPA1 or CPA2 services.",
             "First referral level. Receives referrals from health centers.",
             "Public", "Active", 3),
            ("ProvincialHospital",      "Provincial Hospital (PH)",
             "Provincial-level referral hospital delivering CPA2 or CPA3 services.",
             "Second referral level.",
             "Public", "Active", 4),
            ("NationalHospital",        "National Hospital (NH)",
             "National-level specialised or referral hospital.",
             "Tertiary / specialised care.",
             "Public", "Active", 5),
            ("HealthPost",              "Health Post (HP)",
             "Sub-health center service delivery point in remote or hard-to-reach "
             "areas, typically staffed by a community midwife or health volunteer.",
             "Sub-facility of a health center in many cases.",
             "Public", "Active", 6),
            ("MedicalStore",            "Medical Store (MS)",
             "Storage and distribution facility for medicines and medical supplies.",
             "Does not deliver clinical services.",
             "All", "Active", 7),
            ("Warehouse",               "Warehouse (WH)",
             "Logistics/storage warehouse for health commodities at central or "
             "regional level.",
             "Does not deliver clinical services.",
             "All", "Active", 8),
            ("Laboratory",              "Laboratory (LAB)",
             "Standalone diagnostic laboratory not physically embedded within "
             "another facility.",
             "Embedded labs within a hospital use sub-facility type "
             "EmbeddedLaboratory.",
             "All", "Active", 9),
            ("BloodBank",               "Blood Bank (BB)",
             "Blood collection, processing, and storage facility.",
             "May be standalone or embedded.",
             "All", "Active", 10),
            ("Other",                   "Other",
             "Facility type that does not fit any defined category.",
             "Use sparingly. Record should include a description note. "
             "Review periodically to determine if a new code is warranted.",
             "All", "Active", 11),
        ],
    },

    # ── VS-005 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-005",
        "name": "Facility Level",
        "description": (
            "Service delivery level of the facility as defined by the MoH, "
            "indicating the minimum package of activities the facility is "
            "expected to deliver. Distinct from actual services available "
            "(captured in the services group)."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/facility-level",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/facility-level (CodeableConcept)",
        "binding_strength": "Required (public); Optional (private)",
        "fields_using": "facility_level",
        "status": "Active",
        "codes": [
            ("MPA",          "Minimum Package of Activities",
             "Health center level delivering the national MPA service package.",
             "Required for public sector. MPA includes basic curative, "
             "preventive, and promotive services.",
             "Public", "Active", 1),
            ("CPA1",         "Complementary Package of Activities – Level 1",
             "First level of complementary services, typically a district "
             "referral hospital.",
             "Adds surgical, laboratory, and in-patient services to MPA.",
             "Public", "Active", 2),
            ("CPA2",         "Complementary Package of Activities – Level 2",
             "Second level of complementary services.",
             "Expanded specialist services.",
             "Public", "Active", 3),
            ("CPA3",         "Complementary Package of Activities – Level 3",
             "Third and highest level of complementary services, national "
             "or provincial referral hospitals.",
             "Tertiary specialist services.",
             "Public", "Active", 4),
            ("Specialized",  "Specialized",
             "Specialized facility not classified within the MPA/CPA framework "
             "(e.g. national eye hospital, psychiatric facility).",
             "Use for specialised national facilities with mandates outside the "
             "standard referral hierarchy.",
             "Public", "Active", 5),
            ("NotApplicable","Not Applicable",
             "Facility level classification is not applicable to this facility "
             "type (e.g. medical store, warehouse, private clinic).",
             "Use for non-clinical or private sector facilities.",
             "Private / Other", "Active", 6),
        ],
    },

    # ── VS-006 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-006",
        "name": "Ownership Type",
        "description": (
            "Type of entity that owns or manages the facility. Determines "
            "applicable licensing requirements, governance arrangements, and "
            "reporting lines."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/ownership-type",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/ownership-type (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "ownership_type",
        "status": "Active",
        "codes": [
            ("MOH",               "Ministry of Health",
             "Facility owned and operated by the Ministry of Health.",
             "Public sector. All public health centers, referral hospitals, "
             "and national hospitals.",
             "Public", "Active", 1),
            ("OtherMinistry",     "Other Government Ministry",
             "Facility owned or operated by a government ministry other than MoH "
             "(e.g. Ministry of National Defense, Ministry of Interior).",
             "Includes military hospitals and police clinics.",
             "Public", "Active", 2),
            ("NGO",               "Non-Governmental Organisation",
             "Facility operated by a registered NGO (national or international).",
             "Often partnered with MoH for service delivery. Not subject to "
             "commercial licensing.",
             "NGO", "Active", 3),
            ("FaithBased",        "Faith-Based Organisation",
             "Facility operated by a religious or faith-based organisation.",
             "Includes church-run clinics and Buddhist health facilities.",
             "NGO", "Active", 4),
            ("Private",           "Private Sector",
             "Facility owned and operated by a private individual or commercial "
             "entity for profit.",
             "Subject to HSD or OWS licensing depending on facility size and type.",
             "Private", "Active", 5),
            ("DevelopmentPartner","Development Partner",
             "Facility established and operated by an international development "
             "partner (bilateral or multilateral donor).",
             "Includes UN agency-operated facilities in humanitarian contexts.",
             "NGO", "Active", 6),
            ("Other",             "Other",
             "Ownership type that does not fit any defined category.",
             "Use sparingly. Review periodically for reclassification.",
             "All", "Active", 7),
        ],
    },

    # ── VS-007 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-007",
        "name": "Coordinate Accuracy",
        "description": (
            "Indicates the method and confidence level of the GPS coordinates "
            "recorded for the facility. Qualifies gps_latitude and gps_longitude "
            "for data quality assessment."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/coordinate-accuracy",
        "fhir_binding": "Extension on Location.position (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "coordinate_accuracy",
        "status": "Active",
        "codes": [
            ("GPSDevice",    "GPS Device",
             "Coordinates captured using a dedicated GPS device or smartphone "
             "GPS in the field.",
             "Highest accuracy. Preferred method. Positional error typically "
             "< 5 m.",
             "All", "Active", 1),
            ("MappingTool",  "Mapping Tool",
             "Coordinates selected using a validated mapping tool (e.g. "
             "Google Maps, OpenStreetMap, facility-level satellite imagery).",
             "Acceptable accuracy for most use cases. Should be validated "
             "against satellite imagery.",
             "All", "Active", 2),
            ("Estimated",    "Estimated",
             "Coordinates estimated by the data entry operator without GPS "
             "device or validated tool.",
             "Low confidence. Flag for field verification. Positional error "
             "may exceed 100 m.",
             "All", "Active", 3),
            ("Unknown",      "Unknown",
             "Coordinate capture method is not known.",
             "Flag for field verification. Treat as low-confidence until "
             "re-verified.",
             "All", "Active", 4),
        ],
    },

    # ── VS-008 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-008",
        "name": "Operational Status",
        "description": (
            "Current operational condition of the facility. Maps to both "
            "Location.status (active/suspended/inactive) and "
            "Location.operationalStatus (extended Coding) in FHIR R4."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/operational-status",
        "fhir_binding": "Location.operationalStatus (extensible Coding) + Location.status (active|suspended|inactive)",
        "binding_strength": "Required",
        "fields_using": "operational_status",
        "status": "Active",
        "codes": [
            ("Operational",       "Operational",
             "Facility is open and delivering services as expected.",
             "Maps to Location.status = active.",
             "All", "Active", 1),
            ("Suspended",         "Temporarily Suspended",
             "Facility has temporarily ceased operations (e.g. due to staff "
             "shortage, temporary closure for renovation).",
             "Maps to Location.status = suspended. Expected to resume. "
             "Review after 6 months.",
             "All", "Active", 2),
            ("Pending",           "Pending Opening",
             "Facility is registered but has not yet commenced operations. "
             "Awaiting licence, staffing, or physical completion.",
             "Maps to Location.status = inactive. Record exists for planning "
             "purposes.",
             "All", "Active", 3),
            ("UnderConstruction", "Under Construction",
             "Facility building or infrastructure is under active construction.",
             "Maps to Location.status = inactive. Should transition to "
             "Pending or Operational on construction completion.",
             "All", "Active", 4),
            ("UnderRenovation",   "Under Renovation",
             "Facility is undergoing major renovation and is not delivering "
             "services during renovation.",
             "Maps to Location.status = suspended.",
             "All", "Active", 5),
            ("Closed",            "Closed",
             "Facility has permanently ceased operations.",
             "Maps to Location.status = inactive. Closure date and reason must "
             "be recorded. HFID is never deactivated or reused.",
             "All", "Active", 6),
        ],
    },

    # ── VS-009 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-009",
        "name": "Closure Reason",
        "description": (
            "Reason a facility permanently ceased operations. Required when "
            "operational_status = Closed. Supports longitudinal analysis of "
            "facility network changes."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/closure-reason",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/closure-reason (CodeableConcept)",
        "binding_strength": "Required when Closed",
        "fields_using": "closure_reason",
        "status": "Active",
        "codes": [
            ("MergedWithAnotherFacility", "Merged with Another Facility",
             "This facility was merged into or absorbed by another facility. "
             "Successor facility identified via successor_hfid.",
             "Requires successor_hfid to be populated.",
             "All", "Active", 1),
            ("PermanentlyClosed",         "Permanently Closed",
             "Facility ceased operations permanently without merger or "
             "succession.",
             "No successor HFID.",
             "All", "Active", 2),
            ("LicenceRevoked",            "Licence Revoked",
             "Facility's operating licence was revoked by the licensing "
             "authority.",
             "Applicable to private/NGO/faith-based facilities. "
             "Regulatory action.",
             "Private / NGO", "Active", 3),
            ("NaturalDisaster",           "Natural Disaster",
             "Facility closed due to destruction or damage caused by a natural "
             "disaster.",
             "Flood, earthquake, or similar event. May reopen if rebuilt.",
             "All", "Active", 4),
            ("FundingCeased",             "Funding Ceased",
             "Facility closed because project or programme funding ended.",
             "Common for development partner-operated facilities.",
             "NGO / Development Partner", "Active", 5),
            ("Other",                     "Other",
             "Closure reason does not fit any defined category.",
             "Add a note in the relevant free-text field.",
             "All", "Active", 6),
        ],
    },

    # ── VS-010 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-010",
        "name": "Licence Status",
        "description": (
            "Current licensing status of the facility. Required for all "
            "non-MOH facilities. Determines whether a facility appears on "
            "the active licensed provider list."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/licence-status",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/licence-status (CodeableConcept)",
        "binding_strength": "Required (non-MOH)",
        "fields_using": "licence_status",
        "status": "Active",
        "codes": [
            ("Active",        "Active",
             "Facility holds a current, valid licence.",
             "Licence expiry date is in the future.",
             "Private / NGO", "Active", 1),
            ("Expired",       "Expired",
             "Facility's licence has passed its expiry date and renewal "
             "has not yet been completed.",
             "Facility should be flagged for follow-up. Operations may "
             "continue during grace period depending on authority rules.",
             "Private / NGO", "Active", 2),
            ("Suspended",     "Suspended",
             "Licence has been temporarily suspended by the licensing "
             "authority pending investigation or corrective action.",
             "Facility should not be listed as active on service directories.",
             "Private / NGO", "Active", 3),
            ("Revoked",       "Revoked",
             "Licence has been permanently revoked by the licensing authority.",
             "Triggers closure_reason = LicenceRevoked. Facility is non-operational.",
             "Private / NGO", "Active", 4),
            ("Pending",       "Pending",
             "Licence application has been submitted and is under review "
             "by the licensing authority.",
             "Facility is not yet authorised to operate.",
             "Private / NGO", "Active", 5),
            ("NotApplicable", "Not Applicable",
             "Facility is not subject to external licensing (e.g. MOH-owned "
             "public facilities).",
             "Standard for MOH-owned facilities.",
             "Public", "Active", 6),
        ],
    },

    # ── VS-011 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-011",
        "name": "Licensing Authority",
        "description": (
            "Authority responsible for issuing and renewing the facility licence. "
            "Determines which regulatory body must be contacted for verification "
            "and renewal."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/licensing-authority",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/licensing-authority (CodeableConcept)",
        "binding_strength": "Required (when licence applies)",
        "fields_using": "licensing_authority",
        "status": "Active",
        "codes": [
            ("HSD",           "Department of Hospital Services (HSD)",
             "The Department of Hospital Services under MoH. Licenses larger "
             "private facilities (hospitals, polyclinics).",
             "Mutually exclusive with OWS. Applies to larger private facilities "
             "licensed through the HSD channel.",
             "Private", "Active", 1),
            ("OWS",           "One Window Service (OWS)",
             "The One Window Service licensing channel. Licenses smaller private "
             "facilities (private clinics, dental practices).",
             "Mutually exclusive with HSD. Applies to smaller private facilities.",
             "Private", "Active", 2),
            ("PHD",           "Provincial Health Department (PHD)",
             "Provincial Health Department. Issues licences for certain NGO and "
             "faith-based facilities at provincial level.",
             "Confirm applicable facility categories with MoH regulatory division.",
             "NGO / Faith-Based", "Active", 3),
            ("NotApplicable", "Not Applicable",
             "Licensing authority is not applicable to this facility.",
             "Use for MOH-owned public sector facilities.",
             "Public", "Active", 4),
        ],
    },

    # ── VS-012 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-012",
        "name": "Schedule Type",
        "description": (
            "Type of operating schedule described by an operating hours record. "
            "A facility may have multiple schedule types simultaneously "
            "(e.g. regular outpatient hours and emergency availability)."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/schedule-type",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/schedule-type on Location.hoursOfOperation",
        "binding_strength": "Required",
        "fields_using": "schedule_type",
        "status": "Active",
        "codes": [
            ("Regular",   "Regular Outpatient",
             "Standard outpatient operating hours during normal working days.",
             "Day-of-week flags and open/close times required. Applicable to "
             "all facility types with clinical services.",
             "All", "Active", 1),
            ("Emergency", "Emergency",
             "Hours during which emergency services are available, which may "
             "differ from regular outpatient hours.",
             "For 24/7 emergency services, set open_time=00:00 and leave "
             "close_time null with schedule_notes='24 hours'.",
             "Hospital / HCB", "Active", 2),
            ("OnCall",    "On Call",
             "After-hours on-call availability for non-emergency needs.",
             "No fixed open/close time. Contact number required. "
             "open_time and close_time may be null.",
             "All", "Active", 3),
        ],
    },

    # ── VS-013 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-013",
        "name": "Service Code",
        "description": (
            "Code identifying a specific health service available at the facility. "
            "PLACEHOLDER – full value set to be defined based on the MoH MPA and "
            "CPA national service package definitions. Representative initial "
            "codes are provided below for review."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/service-code",
        "fhir_binding": "HealthcareService.type (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "service_code",
        "status": "DRAFT – PLACEHOLDER",
        "codes": [
            ("ANC",          "Antenatal Care",
             "Antenatal care services for pregnant women.",
             "Part of MPA. Minimum 8 ANC contacts per WHO guidelines.",
             "All", "Draft", 1),
            ("Delivery",     "Delivery / Birth Services",
             "Facility-based delivery services.",
             "Part of MPA (normal delivery) and CPA (complicated delivery).",
             "All", "Draft", 2),
            ("PNC",          "Postnatal Care",
             "Postnatal care for mother and newborn.",
             "Part of MPA.",
             "All", "Draft", 3),
            ("FP",           "Family Planning",
             "Family planning counselling and method provision.",
             "Part of MPA.",
             "All", "Draft", 4),
            ("Immunisation", "Immunisation / EPI",
             "Expanded Programme on Immunisation services.",
             "Part of MPA.",
             "All", "Draft", 5),
            ("OPD",          "Outpatient Consultation",
             "General outpatient diagnosis and treatment.",
             "Part of MPA.",
             "All", "Draft", 6),
            ("IPD",          "Inpatient Admission",
             "In-patient admission and ward care.",
             "Part of CPA1+.",
             "Hospital", "Draft", 7),
            ("Emergency",    "Emergency Services",
             "24-hour emergency care.",
             "Part of CPA1+.",
             "Hospital", "Draft", 8),
            ("Surgery",      "Surgery",
             "Surgical services (emergency and elective).",
             "Part of CPA1+.",
             "Hospital", "Draft", 9),
            ("Lab",          "Laboratory Diagnostics",
             "Clinical laboratory diagnostics.",
             "Part of CPA1+.",
             "Hospital / Lab", "Draft", 10),
            ("BloodTransfusion", "Blood Transfusion",
             "Blood transfusion services.",
             "Part of CPA2+.",
             "Hospital", "Draft", 11),
            ("TBTreatment",  "TB Treatment (DOTS)",
             "Tuberculosis diagnosis and directly-observed treatment.",
             "Part of MPA.",
             "All", "Draft", 12),
            ("MalariaRDT",   "Malaria Testing (RDT)",
             "Rapid diagnostic testing for malaria.",
             "Part of MPA.",
             "All", "Draft", 13),
            ("HIV",          "HIV Testing and Treatment",
             "HIV voluntary counselling, testing, and ART provision.",
             "Part of MPA/CPA depending on ART initiation.",
             "All", "Draft", 14),
            ("Dental",       "Dental Services",
             "Basic and preventive dental care.",
             "Part of CPA1+.",
             "Hospital / Private", "Draft", 15),
            ("MentalHealth", "Mental Health",
             "Mental health assessment, counselling, and treatment.",
             "Part of CPA2+ for specialist services.",
             "Hospital", "Draft", 16),
            ("Rehabilitation","Rehabilitation",
             "Physical, occupational, or speech rehabilitation services.",
             "Part of CPA2+.",
             "Hospital", "Draft", 17),
            ("Pharmacy",     "Pharmacy / Dispensary",
             "Dispensing of medicines and pharmaceuticals.",
             "Part of MPA.",
             "All", "Draft", 18),
        ],
    },

    # ── VS-014 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-014",
        "name": "Service Availability",
        "description": (
            "Current availability status of a specific health service at the "
            "facility. Extends HealthcareService.active (boolean) to express "
            "richer availability states."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/service-availability",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/service-availability (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "service_availability",
        "status": "Active",
        "codes": [
            ("Available",   "Available",
             "Service is currently available at the facility.",
             "HealthcareService.active = true.",
             "All", "Active", 1),
            ("Unavailable", "Unavailable",
             "Service is not currently available (e.g. equipment broken, "
             "no trained staff).",
             "HealthcareService.active = false. Should be reviewed periodically.",
             "All", "Active", 2),
            ("Seasonal",    "Seasonal",
             "Service is available during certain seasons or periods only "
             "(e.g. malaria treatment during high season).",
             "HealthcareService.active = true during season. schedule_notes "
             "should describe the season/period.",
             "All", "Active", 3),
            ("Referral",    "Referral Only",
             "Facility can initiate and manage referral for this service but "
             "does not deliver it directly.",
             "Service is not delivered on-site. Useful for service directory "
             "consumers to know referral pathway is supported.",
             "All", "Active", 4),
        ],
    },

    # ── VS-015 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-015",
        "name": "Emergency Equipment Type",
        "description": (
            "Type of emergency equipment recorded in the facility asset inventory. "
            "PLACEHOLDER – value set to be finalised with reference to MoH "
            "emergency equipment minimum standards. Representative initial codes "
            "are listed below."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/equipment-type",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/equipment-type (CodeableConcept)",
        "binding_strength": "Required",
        "fields_using": "equipment_type",
        "status": "DRAFT – PLACEHOLDER",
        "codes": [
            ("OxygenConcentrator",   "Oxygen Concentrator",
             "Electric oxygen concentrator for continuous oxygen supply.",
             "Key indicator for emergency and maternal care readiness.",
             "All", "Draft", 1),
            ("OxygenCylinder",       "Oxygen Cylinder",
             "Compressed oxygen cylinder for emergency and procedural use.",
             "Should be counted separately from concentrators.",
             "All", "Draft", 2),
            ("Pulse Oximeter",       "Pulse Oximeter",
             "Device to measure blood oxygen saturation (SpO2).",
             "Essential emergency monitoring equipment.",
             "All", "Draft", 3),
            ("Suction",              "Suction Machine",
             "Electric or manual suction device for airway management.",
             "Key for obstetric and neonatal emergency care.",
             "All", "Draft", 4),
            ("Defibrillator",        "Defibrillator (AED/Manual)",
             "Automated or manual defibrillator for cardiac resuscitation.",
             "Required for CPA2+ hospitals.",
             "Hospital", "Draft", 5),
            ("Resuscitator",         "Bag-Valve-Mask Resuscitator",
             "Manual ventilation device (adult and/or neonatal).",
             "Essential for emergency and delivery rooms.",
             "All", "Draft", 6),
            ("Glucometer",           "Glucometer",
             "Point-of-care blood glucose testing device.",
             "Part of diabetes and emergency care readiness.",
             "All", "Draft", 7),
            ("Ultrasound",           "Ultrasound Machine",
             "Diagnostic ultrasound device.",
             "ANC and emergency obstetric care indicator.",
             "Hospital / HCB", "Draft", 8),
            ("AmbulanceVehicle",     "Ambulance Vehicle",
             "Motorised vehicle equipped for patient transport.",
             "Used for referral transport.",
             "Hospital", "Draft", 9),
            ("RefrigeratorVaccine",  "Vaccine Refrigerator",
             "Cold-chain refrigerator for vaccine storage.",
             "Essential cold-chain indicator for EPI.",
             "All", "Draft", 10),
            ("Generator",            "Generator",
             "Backup power generator.",
             "Electricity reliability indicator.",
             "All", "Draft", 11),
        ],
    },

    # ── VS-016 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-016",
        "name": "Cadre Category",
        "description": (
            "Health workforce cadre category used for facility-level aggregate "
            "headcount reporting. PLACEHOLDER – value set to be defined in "
            "alignment with the health worker registry cadre classification "
            "once finalised."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/cadre-category",
        "fhir_binding": "PractitionerRole.code (CodeableConcept) | Extension on Location (summary shortcut)",
        "binding_strength": "Required",
        "fields_using": "cadre_category",
        "status": "DRAFT – PLACEHOLDER",
        "codes": [
            ("Physician",              "Physician / Medical Doctor",
             "Qualified medical doctor (MD/MBBS or equivalent).",
             "Includes general practitioners and specialists.",
             "All", "Draft", 1),
            ("Nurse",                  "Nurse",
             "Registered or enrolled nurse.",
             "Includes primary and secondary level nurses.",
             "All", "Draft", 2),
            ("Midwife",                "Midwife",
             "Qualified midwife.",
             "Including community midwives deployed to health posts.",
             "All", "Draft", 3),
            ("Dentist",                "Dentist",
             "Qualified dental practitioner.",
             "",
             "All", "Draft", 4),
            ("Pharmacist",             "Pharmacist",
             "Qualified pharmacist or pharmacy technician.",
             "",
             "All", "Draft", 5),
            ("AlliedHealth",           "Allied Health Professional",
             "Health professionals other than doctors, nurses, midwives, "
             "dentists, or pharmacists (e.g. lab technicians, physiotherapists, "
             "radiographers).",
             "Review with HWR team for sub-classification requirements.",
             "All", "Draft", 6),
            ("CommunityHealthWorker",  "Community Health Worker",
             "Village health support unit (VHSU) member or equivalent "
             "community-level health volunteer.",
             "May be partially salaried or volunteer.",
             "All", "Draft", 7),
            ("AdministrativeSupport",  "Administrative / Support Staff",
             "Non-clinical administrative, management, or support staff "
             "formally assigned to the facility.",
             "Include only staff on the health sector payroll or formal "
             "assignment.",
             "All", "Draft", 8),
        ],
    },

    # ── VS-017 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-017",
        "name": "Catchment Computation Method",
        "description": (
            "Method used to compute the catchment population count for a facility, "
            "indicating how the figure should be interpreted for planning purposes."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/computation-method",
        "fhir_binding": "Extension: http://camdhea.gov.kh/fhir/StructureDefinition/catchment-population (complex, computationMethod element)",
        "binding_strength": "Required when catchment_population_count is populated",
        "fields_using": "catchment_computation_method",
        "status": "Active",
        "codes": [
            ("RegisteredPatients",   "Registered Patients",
             "Count of active Health ID (HID) records in the client registry "
             "with a residential address matching one of the facility's "
             "catchment villages.",
             "Under-represents actual population where CR coverage is incomplete. "
             "Most precise method when CR coverage is high.",
             "All", "Active", 1),
            ("EstimatedFromCensus",  "Estimated from Census",
             "Population projected from national census data using village-level "
             "population estimates for the facility's catchment villages.",
             "Used where CR coverage is too low to be reliable. Census data "
             "should note reference year.",
             "All", "Active", 2),
            ("Combined",             "Combined",
             "Both RegisteredPatients and EstimatedFromCensus methods used, "
             "with registered patients as the primary figure and census "
             "estimate as a cross-check.",
             "Preferred when both CR data and census estimates are available "
             "and coverage is moderate.",
             "All", "Active", 3),
        ],
    },

    # ── VS-018 ─────────────────────────────────────────────────────────────────
    {
        "id": "VS-018",
        "name": "Sub-Facility Type",
        "description": (
            "Type classification for a facility record representing a service "
            "delivery point within or dependent on a parent facility "
            "(is_sub_facility = true)."
        ),
        "fhir_system_uri": "https://camdhea.gov.kh/fhir/CodeSystem/sub-facility-type",
        "fhir_binding": "Location.type (second CodeableConcept entry with distinct coding system slice)",
        "binding_strength": "Required when is_sub_facility = true",
        "fields_using": "sub_facility_type",
        "status": "Active",
        "codes": [
            ("Ward",                 "Ward",
             "In-patient ward within a hospital or health center with beds.",
             "E.g. maternity ward, paediatric ward, surgical ward.",
             "Hospital / HCB", "Active", 1),
            ("IsolationUnit",        "Isolation Unit",
             "Isolation room or ward for infectious disease management.",
             "Includes dedicated TB, COVID, or other isolation facilities.",
             "Hospital", "Active", 2),
            ("EmbeddedLaboratory",   "Embedded Laboratory",
             "Diagnostic laboratory physically located within a hospital or "
             "health center.",
             "Distinct from standalone Laboratory facility type.",
             "Hospital / HC", "Active", 3),
            ("MobileClinic",         "Mobile Clinic",
             "Mobile health unit delivering outreach services from a parent "
             "fixed facility.",
             "GPS coordinates may change. Parent facility HFID required.",
             "All", "Active", 4),
            ("TemporaryServicePoint","Temporary Service Point",
             "Temporary or seasonal service delivery point (e.g. dry-season "
             "outreach clinic).",
             "Expected to have a defined operational period.",
             "All", "Active", 5),
            ("BloodCollectionPoint", "Blood Collection Point",
             "Blood collection point associated with a parent facility or "
             "blood bank.",
             "",
             "All", "Active", 6),
            ("Other",                "Other",
             "Sub-facility type that does not fit any defined category.",
             "Review periodically for reclassification.",
             "All", "Active", 7),
        ],
    },
]


# ── Build workbook ─────────────────────────────────────────────────────────────

def col_widths(ws, widths):
    """Apply column widths list (1-based)."""
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def build_index(wb):
    ws = wb.active
    ws.title = "Index"

    # ── Title block
    ws.merge_cells("A1:L1")
    title_cell = ws["A1"]
    title_cell.value = "CamDHEA Facility Registry – Value Set Validation Workbook"
    title_cell.font  = Font(name=FONT_MAIN, size=14, bold=True, color=C_WHITE)
    title_cell.fill  = fill(C_NAVY)
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    ws.merge_cells("A2:L2")
    sub = ws["A2"]
    sub.value = (
        f"Prepared for program team validation  |  Generated: {date.today().isoformat()}  |  "
        "System: CamDHEA v1.0  |  Standard: FHIR R4"
    )
    sub.font      = Font(name=FONT_MAIN, size=10, italic=True, color="444444")
    sub.fill      = fill("E8EEF4")
    sub.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 18

    ws.merge_cells("A3:L3")
    instr = ws["A3"]
    instr.value = (
        "INSTRUCTIONS: Review each value set tab. For each code: confirm Approved, "
        "select Modify (and fill Suggested Change / Comments), or select Reject. "
        "Return completed workbook to the data management team."
    )
    instr.font      = Font(name=FONT_MAIN, size=9, italic=True, color="5C3317")
    instr.fill      = fill("FFF3CD")
    instr.alignment = Alignment(wrap_text=True, horizontal="left", vertical="center")
    ws.row_dimensions[3].height = 26

    # ── Column headers
    headers = [
        "VS ID", "Value Set Name", "Description", "Fields Using This Value Set",
        "FHIR Binding Element", "FHIR Binding Strength",
        "System URI (CodeSystem)", "# Codes", "Status", "Sheet Link",
        "Validation Complete?", "Notes"
    ]
    apply_header_row(ws, headers, row=4, bg=C_TEAL)
    ws.row_dimensions[4].height = 32

    # ── Data rows
    for r, vs in enumerate(VALUE_SETS, start=5):
        alt = (r % 2 == 0)
        bg  = C_LIGHT_BLUE if alt else C_WHITE
        row_data = [
            vs["id"],
            vs["name"],
            vs["description"],
            vs["fields_using"],
            vs["fhir_binding"],
            vs["binding_strength"],
            vs["fhir_system_uri"],
            len(vs["codes"]),
            vs["status"],
            f'=HYPERLINK("#\'{vs["name"]}\'!A1", "Go to sheet")',
            "",   # validation complete – filled by program team
            "",   # notes
        ]
        for col, val in enumerate(row_data, start=1):
            c = ws.cell(row=r, column=col, value=val)
            c.fill      = fill(bg)
            c.font      = body_font()
            c.border    = thin_border()
            c.alignment = wrap_left()
            if col == 8:   # # codes – center
                c.alignment = Alignment(horizontal="center", vertical="top")
            if col == 10:  # hyperlink
                c.font = Font(name=FONT_MAIN, size=10, color="0563C1",
                              underline="single")
        # status highlight
        status_cell = ws.cell(row=r, column=9)
        if "DRAFT" in vs["status"] or "PLACEHOLDER" in vs["status"]:
            status_cell.fill = fill(C_AMBER)
            status_cell.font = Font(name=FONT_MAIN, size=10, bold=True,
                                    color="7B4F00")
        ws.row_dimensions[r].height = 48

    col_widths(ws, [8, 28, 52, 36, 44, 18, 54, 9, 22, 14, 20, 30])
    freeze_and_filter(ws, "A5")

    # ── Validation dropdown
    dv = DataValidation(type="list",
                        formula1='"Yes,In Progress,No"',
                        allow_blank=True)
    ws.add_data_validation(dv)
    for r in range(5, 5 + len(VALUE_SETS)):
        dv.sqref = f"K{r}"


def build_vs_sheet(wb, vs):
    ws = wb.create_sheet(title=vs["name"])

    # ── Header banner
    TOTAL_COLS = 12
    ws.merge_cells(f"A1:{get_column_letter(TOTAL_COLS)}1")
    h1 = ws["A1"]
    h1.value = f"{vs['id']}  –  {vs['name']}"
    h1.font  = Font(name=FONT_MAIN, size=13, bold=True, color=C_WHITE)
    h1.fill  = fill(C_NAVY)
    h1.alignment = Alignment(horizontal="left", vertical="center",
                              indent=1)
    ws.row_dimensions[1].height = 28

    # ── Meta block (rows 2-6)
    meta_labels = ["Description:", "FHIR Binding Element:",
                   "Binding Strength:", "CodeSystem URI:", "Status:"]
    meta_values = [vs["description"], vs["fhir_binding"],
                   vs["binding_strength"], vs["fhir_system_uri"], vs["status"]]
    for i, (lbl, val) in enumerate(zip(meta_labels, meta_values), start=2):
        ws.merge_cells(f"A{i}:B{i}")
        lc = ws.cell(row=i, column=1, value=lbl)
        lc.font = Font(name=FONT_MAIN, size=9, bold=True, color="444444")
        lc.fill = fill("E8EEF4")
        lc.alignment = Alignment(horizontal="right", vertical="center")
        ws.merge_cells(f"C{i}:{get_column_letter(TOTAL_COLS)}{i}")
        vc = ws.cell(row=i, column=3, value=val)
        vc.font = body_font(size=9)
        vc.fill = fill(C_AMBER if ("DRAFT" in str(val) or
                                    "PLACEHOLDER" in str(val)) else "F9FAFB")
        vc.alignment = Alignment(wrap_text=True, vertical="center")
        ws.row_dimensions[i].height = 18

    # ── Instructions row
    ws.merge_cells(f"A7:{get_column_letter(TOTAL_COLS)}7")
    ic = ws["A7"]
    ic.value = (
        "► Review columns A–G (system data). ► For each code fill H (Approved / Modify / Reject / Pending). "
        "► If Modify: fill I (suggested code) and/or J (suggested display). ► Add free-text in K. "
        "► Sign off in L."
    )
    ic.font      = Font(name=FONT_MAIN, size=9, italic=True, color="5C3317")
    ic.fill      = fill("FFF3CD")
    ic.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[7].height = 22

    # ── Column headers (row 8)
    code_headers = [
        "Sort",             # A
        "Code",             # B
        "Display Name",     # C
        "Definition",       # D
        "Usage Guidance / Notes",  # E
        "Applicable Sector",       # F
        "Current Status",          # G
        # ── Program team fill-in ────
        "Validation\n(Approved / Modify / Reject / Pending)",  # H
        "Suggested Code Change",   # I
        "Suggested Display Change",# J
        "Comments",                # K
        "Validated By / Date",     # L
    ]
    apply_header_row(ws, code_headers, row=8, bg=C_TEAL, font_size=9)
    ws.row_dimensions[8].height = 38

    # ── Code rows
    for r_idx, code_entry in enumerate(vs["codes"], start=9):
        sort_order, code, display, definition, usage, sector, status, *_ = \
            code_entry + (None,) * max(0, 7 - len(code_entry))
        # unpack the 7-tuple properly
        (code, display, definition, usage, sector, status, sort_order) = code_entry

        alt = (r_idx % 2 == 0)
        bg  = C_LIGHT_BLUE if alt else C_WHITE

        row_data = [sort_order, code, display, definition,
                    usage, sector, status,
                    "Pending", "", "", "", ""]
        for col, val in enumerate(row_data, start=1):
            c = ws.cell(row=r_idx, column=col, value=val)
            c.fill   = fill(bg)
            c.font   = body_font(size=9)
            c.border = thin_border()
            c.alignment = wrap_left()
            if col == 1:  # sort order – center
                c.alignment = Alignment(horizontal="center", vertical="top")
        # Status cell colour
        status_c = ws.cell(row=r_idx, column=7)
        if status == "Draft":
            status_c.fill = fill(C_AMBER)
        elif status == "Deprecated":
            status_c.fill = fill(C_RED)

        # Validation col – light grey pending
        ws.cell(row=r_idx, column=8).fill = fill("F0F0F0")
        ws.row_dimensions[r_idx].height = 36

    # ── Data validation dropdown on column H
    last_row = 8 + len(vs["codes"])
    dv = DataValidation(
        type="list",
        formula1='"Approved,Modify,Reject,Pending"',
        allow_blank=False,
        showDropDown=False
    )
    ws.add_data_validation(dv)
    dv.sqref = f"H9:H{last_row}"

    # ── Conditional fill via openpyxl (manual – can't use rule-based here)
    # We leave as-is; program team selects from dropdown.

    # ── Column widths
    col_widths(ws, [6, 26, 28, 52, 52, 18, 14, 22, 24, 24, 36, 24])

    # ── Freeze panes below header + meta
    ws.freeze_panes = "A9"
    # ── Auto-filter on code columns
    ws.auto_filter.ref = f"A8:{get_column_letter(TOTAL_COLS)}{last_row}"

    # ── Return to index hyperlink
    ws.cell(row=last_row + 2, column=1,
            value='=HYPERLINK("#Index!A1","◄ Back to Index")').font = Font(
        name=FONT_MAIN, size=9, color="0563C1", underline="single"
    )


def build_notes_sheet(wb):
    ws = wb.create_sheet(title="Guidance Notes")

    ws.merge_cells("A1:G1")
    t = ws["A1"]
    t.value = "Guidance Notes for Program Team Reviewers"
    t.font  = Font(name=FONT_MAIN, size=13, bold=True, color=C_WHITE)
    t.fill  = fill(C_NAVY)
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    guidance = [
        ("Purpose",
         "This workbook lists all coded value sets used in the CamDHEA Facility Registry "
         "data model. Each value set tab contains the proposed codes, display names, "
         "definitions, and usage guidance. Program team reviewers should validate each "
         "entry and provide feedback using the structured response columns."),
        ("Validation Column (H)",
         "Select one of the following for each code row:\n"
         "  • Approved – Code, display name, and definition are accepted as proposed.\n"
         "  • Modify   – Accept the code concept but changes to code, display name, or "
         "definition are needed. Fill columns I, J, or K as appropriate.\n"
         "  • Reject   – Code should be removed from the value set. Explain in Comments (K).\n"
         "  • Pending  – Default. Review not yet completed."),
        ("Adding New Codes",
         "If additional codes are needed that are not listed, please add new rows at the "
         "bottom of the relevant sheet. Fill columns A–G with the proposed values and "
         "set column H to 'Modify' with a comment 'NEW CODE' in column K."),
        ("Draft / Placeholder Value Sets",
         "Value sets marked DRAFT – PLACEHOLDER (VS-013 Service Code, VS-015 Equipment "
         "Type, VS-016 Cadre Category) contain indicative codes only. Full value set "
         "definition requires program team input. These sheets require the most "
         "substantive review."),
        ("Code Conventions",
         "Codes use PascalCase (e.g. HealthCenter) or ALL-CAPS abbreviations (e.g. MPA, "
         "HC). Display names are sentence-cased human-readable labels. Codes are "
         "immutable once assigned – display names and definitions can be updated."),
        ("FHIR Binding Strengths",
         "Required = only codes in this value set may be used.\n"
         "Extensible = codes in this value set should be used; other codes allowed if no match.\n"
         "Preferred = recommended but not enforced."),
        ("Sensitivity",
         "All fields in this value set workbook are internal/non-PII. No patient-level "
         "data is included. The workbook may be shared within the health sector programme team."),
        ("Contact",
         "Return completed workbook to the CamDHEA data management team. "
         "Queries: data-standards@camdhea.gov.kh (placeholder address)."),
    ]

    row = 3
    apply_header_row(ws, ["Topic", "Guidance"], row=row, bg=C_TEAL)
    ws.row_dimensions[row].height = 22
    row += 1
    for topic, text in guidance:
        ws.cell(row=row, column=1, value=topic).font = Font(
            name=FONT_MAIN, size=10, bold=True)
        ws.cell(row=row, column=1).fill = fill(C_LIGHT_BLUE if row%2==0 else C_WHITE)
        ws.cell(row=row, column=1).border = thin_border()
        ws.cell(row=row, column=1).alignment = Alignment(vertical="top",
                                                          wrap_text=True)
        tc = ws.cell(row=row, column=2, value=text)
        tc.font      = body_font()
        tc.fill      = fill(C_LIGHT_BLUE if row%2==0 else C_WHITE)
        tc.border    = thin_border()
        tc.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[row].height = max(36, 15 * text.count("\n") + 24)
        row += 1

    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 90
    ws.freeze_panes = "A4"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    wb = Workbook()

    build_index(wb)
    for vs in VALUE_SETS:
        build_vs_sheet(wb, vs)
    build_notes_sheet(wb)

    out_dir  = os.path.join(os.path.dirname(__file__), "..", "datasets")
    out_path = os.path.join(out_dir,
               f"CamDHEA-ValueSet-Validation-{date.today().isoformat()}.xlsx")
    wb.save(out_path)
    print(f"Saved: {os.path.abspath(out_path)}")


if __name__ == "__main__":
    main()
