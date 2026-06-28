// =============================================================================
// CamDHEA Facility Registry — Extension Definitions
// FHIR R4 Extensions for the CamDHEA Data Dictionary
// =============================================================================

// =============================================================================
// SIMPLE EXTENSIONS (single value)
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Facility Level
// -----------------------------------------------------------------------------
Extension:      CamDHEAFacilityLevel
Id:             camdhea-facility-level
Title:          "Facility Level"
Description:    "Service delivery level of the facility (MPA, CPA1-3, Specialized)."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/facility-level"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only CodeableConcept
* valueCodeableConcept 1..1 MS
* valueCodeableConcept ^label = "Facility Level"
* valueCodeableConcept from CamDHEAFacilityLevelValueSet (required)

// -----------------------------------------------------------------------------
// 2. Ownership Type
// -----------------------------------------------------------------------------
Extension:      CamDHEAOwnershipType
Id:             camdhea-ownership-type
Title:          "Ownership Type"
Description:    "Type of entity that owns or manages the facility."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/ownership-type"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only CodeableConcept
* valueCodeableConcept 1..1 MS
* valueCodeableConcept ^label = "Ownership Type"
* valueCodeableConcept from CamDHEAOwnershipTypeValueSet (required)

// -----------------------------------------------------------------------------
// 3. Coordinate Accuracy
// -----------------------------------------------------------------------------
Extension:      CamDHEACoordinateAccuracy
Id:             camdhea-coordinate-accuracy
Title:          "Coordinate Accuracy"
Description:    "Method and confidence level of the GPS coordinates recorded."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/coordinate-accuracy"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only code
* valueCode 1..1 MS
* valueCode ^label = "Coordinate Accuracy"
* valueCode from CamDHEACoordinateAccuracyValueSet (required)

// -----------------------------------------------------------------------------
// 4. Google Maps Link
// -----------------------------------------------------------------------------
Extension:      CamDHEAGoogleMapsLink
Id:             camdhea-google-maps-link
Title:          "Google Maps Link"
Description:    "URL to the facility location on Google Maps. Supplementary to GPS coordinates."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/google-maps-link"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only url
* valueUrl 1..1 MS
* valueUrl ^label = "Google Maps Link"

// -----------------------------------------------------------------------------
// 5. Facility Head
// -----------------------------------------------------------------------------
Extension:      CamDHEAFacilityHead
Id:             camdhea-facility-head
Title:          "Facility Head"
Description:    "HWID of the health worker currently serving as facility head. References the health worker registry."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/facility-head"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Facility Head HWID"

// -----------------------------------------------------------------------------
// 6. Closure Reason
// -----------------------------------------------------------------------------
Extension:      CamDHEAClosureReason
Id:             camdhea-closure-reason
Title:          "Closure Reason"
Description:    "Reason the facility ceased operations."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/closure-reason"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only code
* valueCode 1..1 MS
* valueCode ^label = "Closure Reason"
* valueCode from CamDHEAClosureReasonValueSet (required)

// -----------------------------------------------------------------------------
// 7. Successor HFID
// -----------------------------------------------------------------------------
Extension:      CamDHEASuccessorHfid
Id:             camdhea-successor-hfid
Title:          "Successor HFID"
Description:    "HFID of the facility that replaced or absorbed this facility following closure or merger."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/successor-hfid"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only Reference(Location)
* valueReference 1..1 MS
* valueReference ^label = "Successor Facility"

// -----------------------------------------------------------------------------
// 8. Licence Status
// -----------------------------------------------------------------------------
Extension:      CamDHEALicenceStatus
Id:             camdhea-licence-status
Title:          "Licence Status"
Description:    "Current licensing status of the facility."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/licence-status"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only code
* valueCode 1..1 MS
* valueCode ^label = "Licence Status"
* valueCode from CamDHEALicenceStatusValueSet (required)

// -----------------------------------------------------------------------------
// 9. Licensing Authority
// -----------------------------------------------------------------------------
Extension:      CamDHEALicensingAuthority
Id:             camdhea-licensing-authority
Title:          "Licensing Authority"
Description:    "Authority responsible for issuing and renewing the facility licence."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/licensing-authority"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only code
* valueCode 1..1 MS
* valueCode ^label = "Licensing Authority"
* valueCode from CamDHEALicensingAuthorityValueSet (required)

// =============================================================================
// COMPLEX EXTENSIONS (multiple sub-extensions or structured values)
// =============================================================================

// -----------------------------------------------------------------------------
// 10. Operational Period (start_date + closure_date)
// -----------------------------------------------------------------------------
Extension:      CamDHEAOperationalPeriod
Id:             camdhea-operational-period
Title:          "Operational Period"
Description:    "Period during which the facility was or is operational. start = establishment date, end = closure date."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/operational-period"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only Period
* valuePeriod 1..1 MS
* valuePeriod ^label = "Operational Period"

// -----------------------------------------------------------------------------
// 11. Licence Dates (issue + expiry)
// -----------------------------------------------------------------------------
Extension:      CamDHEALicenceDates
Id:             camdhea-licence-dates
Title:          "Licence Dates"
Description:    "Issue and expiry dates of the facility licence."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/licence-dates"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    issueDate 0..1 MS and
    expiryDate 0..1 MS
* extension[issueDate].value[x] only date
* extension[issueDate].valueDate ^label = "Licence Issue Date"
* extension[expiryDate].value[x] only date
* extension[expiryDate].valueDate ^label = "Licence Expiry Date"

// -----------------------------------------------------------------------------
// 12. Administrative Location (province/district/OD/commune/village codes)
// -----------------------------------------------------------------------------
Extension:      CamDHEAAdministrativeLocation
Id:             camdhea-administrative-location
Title:          "Administrative Location"
Description:    "Administrative location codes (province, district, OD, commune, village) per the national boundary reference."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/administrative-location"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    province 0..1 MS and
    district 0..1 MS and
    od 0..1 MS and
    commune 0..1 MS and
    village 0..1 MS
* extension[province].value[x] only string
* extension[province].valueString ^label = "Province Code"
* extension[district].value[x] only string
* extension[district].valueString ^label = "District Code"
* extension[od].value[x] only string
* extension[od].valueString ^label = "Operational District Code"
* extension[commune].value[x] only string
* extension[commune].valueString ^label = "Commune Code"
* extension[village].value[x] only string
* extension[village].valueString ^label = "Village Code"

// -----------------------------------------------------------------------------
// 13. Schedule Type (on hoursOfOperation)
// -----------------------------------------------------------------------------
Extension:      CamDHEAScheduleType
Id:             camdhea-schedule-type
Title:          "Schedule Type"
Description:    "Type of schedule this operating hours record describes (Regular, Emergency, OnCall)."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/schedule-type"
* ^context[0].type = #element
* ^context[0].expression = "Location.hoursOfOperation"
* value[x] only code
* valueCode 1..1 MS
* valueCode ^label = "Schedule Type"
* valueCode from CamDHEAScheduleTypeValueSet (required)

// -----------------------------------------------------------------------------
// 14. Schedule Notes (on hoursOfOperation)
// -----------------------------------------------------------------------------
Extension:      CamDHEAScheduleNotes
Id:             camdhea-schedule-notes
Title:          "Schedule Notes"
Description:    "Free text notes qualifying the operating hours record."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/schedule-notes"
* ^context[0].type = #element
* ^context[0].expression = "Location.hoursOfOperation"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Schedule Notes"

// =============================================================================
// REPEATING COMPLEX EXTENSIONS
// =============================================================================

// -----------------------------------------------------------------------------
// 15. Emergency Equipment (repeating)
// -----------------------------------------------------------------------------
Extension:      CamDHEAEmergencyEquipment
Id:             camdhea-emergency-equipment
Title:          "Emergency Equipment"
Description:    "Emergency equipment record with type, quantity, last verified date, and source system flag."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/emergency-equipment"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    equipmentType 1..1 MS and
    quantity 1..1 MS and
    lastVerified 0..1 MS and
    sourceSystemVerified 0..1 MS
* extension[equipmentType].value[x] only code
* extension[equipmentType].valueCode ^label = "Equipment Type"
* extension[equipmentType].valueCode from CamDHEAEmergencyEquipmentTypeValueSet (required)
* extension[quantity].value[x] only integer
* extension[quantity].valueInteger ^label = "Quantity"
* extension[lastVerified].value[x] only date
* extension[lastVerified].valueDate ^label = "Last Verified Date"
* extension[sourceSystemVerified].value[x] only boolean
* extension[sourceSystemVerified].valueBoolean ^label = "Source System Verified"

// -----------------------------------------------------------------------------
// 16. Workforce Summary (repeating, read-only)
// -----------------------------------------------------------------------------
Extension:      CamDHEAWorkforceSummary
Id:             camdhea-workforce-summary
Title:          "Workforce Summary"
Description:    "Aggregate workforce summary per cadre category. Derived from the health worker registry."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/workforce-summary"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    cadre 1..1 MS and
    headcount 1..1 MS and
    lastUpdated 0..1 MS
* extension[cadre].value[x] only CodeableConcept
* extension[cadre].valueCodeableConcept ^label = "Cadre Category"
* extension[cadre].valueCodeableConcept from CamDHEACadreCategoryValueSet (required)
* extension[headcount].value[x] only integer
* extension[headcount].valueInteger ^label = "Headcount"
* extension[lastUpdated].value[x] only dateTime
* extension[lastUpdated].valueDateTime ^label = "Last Updated"

// -----------------------------------------------------------------------------
// 17. Catchment Village (repeating)
// -----------------------------------------------------------------------------
Extension:      CamDHEACatchmentVillage
Id:             camdhea-catchment-village
Title:          "Catchment Village"
Description:    "A village within the facility catchment area with period of inclusion."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/catchment-village"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    villageCode 1..1 MS and
    dateAdded 1..1 MS and
    dateRemoved 0..1 MS
* extension[villageCode].value[x] only string
* extension[villageCode].valueString ^label = "Village Code"
* extension[dateAdded].value[x] only date
* extension[dateAdded].valueDate ^label = "Date Added"
* extension[dateRemoved].value[x] only date
* extension[dateRemoved].valueDate ^label = "Date Removed"

// -----------------------------------------------------------------------------
// 18. Catchment Population (single complex, read-only)
// -----------------------------------------------------------------------------
Extension:      CamDHEACatchmentPopulation
Id:             camdhea-catchment-population
Title:          "Catchment Population"
Description:    "Derived catchment population count from the client registry."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/catchment-population"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] 0..0
* extension contains
    count 0..1 MS and
    computationDate 0..1 MS and
    computationMethod 0..1 MS
* extension[count].value[x] only integer
* extension[count].valueInteger ^label = "Population Count"
* extension[computationDate].value[x] only dateTime
* extension[computationDate].valueDateTime ^label = "Computation Date"
* extension[computationMethod].value[x] only code
* extension[computationMethod].valueCode ^label = "Computation Method"
* extension[computationMethod].valueCode from CamDHEACatchmentComputationMethodValueSet (required)

// =============================================================================
// HEALTHCARESERVICE EXTENSIONS
// =============================================================================

// -----------------------------------------------------------------------------
// 19. Service Availability
// -----------------------------------------------------------------------------
Extension:      CamDHEAServiceAvailability
Id:             camdhea-service-availability
Title:          "Service Availability"
Description:    "Current availability status of a service (Available, Unavailable, Seasonal, Referral)."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/service-availability"
* ^context[0].type = #element
* ^context[0].expression = "HealthcareService"
* value[x] only CodeableConcept
* valueCodeableConcept 1..1 MS
* valueCodeableConcept ^label = "Service Availability"
* valueCodeableConcept from CamDHEAServiceAvailabilityValueSet (required)

// -----------------------------------------------------------------------------
// 20. Service Last Verified Date
// -----------------------------------------------------------------------------
Extension:      CamDHEAServiceLastVerifiedDate
Id:             camdhea-service-last-verified-date
Title:          "Service Last Verified Date"
Description:    "Date this service availability record was last verified."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/service-last-verified-date"
* ^context[0].type = #element
* ^context[0].expression = "HealthcareService"
* value[x] only date
* valueDate 1..1 MS
* valueDate ^label = "Last Verified Date"

// =============================================================================
// CLASSIFICATION EXTENSIONS (new)
// =============================================================================

// -----------------------------------------------------------------------------
// 21. Facility Type Acronym
// -----------------------------------------------------------------------------
Extension:      CamDHEAFacilityTypeAcronym
Id:             camdhea-facility-type-acronym
Title:          "Facility Type Acronym"
Description:    "Abbreviated form of the facility type."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/facility-type-acronym"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Facility Type Acronym"

// -----------------------------------------------------------------------------
// 22. Managing Entity Name Use
// -----------------------------------------------------------------------------
Extension:      CamDHEAManagingEntityNameUse
Id:             camdhea-managing-entity-name-use
Title:          "Managing Entity Name Use"
Description:    "The use context for the managing entity name (e.g. official, usual)."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/managing-entity-name-use"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Managing Entity Name Use"

// -----------------------------------------------------------------------------
// 23. Managing Entity Name Script
// -----------------------------------------------------------------------------
Extension:      CamDHEAManagingEntityNameScript
Id:             camdhea-managing-entity-name-script
Title:          "Managing Entity Name Script"
Description:    "Script in which the managing entity name is recorded (Latin, Khmer)."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/managing-entity-name-script"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only CodeableConcept
* valueCodeableConcept 1..1 MS
* valueCodeableConcept ^label = "Managing Entity Name Script"
* valueCodeableConcept from CamDHEANameScriptValueSet (required)

// -----------------------------------------------------------------------------
// 24. Managing Entity Name
// -----------------------------------------------------------------------------
Extension:      CamDHEAManagingEntityName
Id:             camdhea-managing-entity-name
Title:          "Managing Entity Name"
Description:    "Name of the managing entity or organization."
* ^url = "http://camdhea.gov.kh/fhir/StructureDefinition/managing-entity-name"
* ^context[0].type = #element
* ^context[0].expression = "Location"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Managing Entity Name"
