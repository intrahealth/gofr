// =========================================================================
// GofrFacilityQuestionnaire — CamDHEA Facility Registry
// Sections: Identifiers, Facility Name, Classification, Geographic Location,
//           Physical Location, Administrative, Licensing, Operating Hours,
//           Services, Workforce Summary, Catchment, Sub-Facility, Organization
// =========================================================================
Instance:       GofrFacilityQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "GOFR Facility Questionnaire"
* description = "GOFR Facility initial data entry questionnaire."
* id = "gofr-facility-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-questionnaire"
* name = "gofr-facility-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

// =========================================================================
// item[0] — Identifiers
// =========================================================================
* item[0].linkId = "Location.identifier"
* item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier"
* item[0].text = "Identifiers|Identifiers for the facility"
* item[0].type = #group

// HFID — dedicated, pre-filled system/use, non-repeatable
* item[0].item[0].linkId = "Location.identifier[0]"
* item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier"
* item[0].item[0].text = "HFID (Health Facility ID)"
* item[0].item[0].type = #group
* item[0].item[0].repeats = false
* item[0].item[0].required = true

* item[0].item[0].item[0].linkId = "Location.identifier[0].system"
* item[0].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.system"
* item[0].item[0].item[0].text = "System"
* item[0].item[0].item[0].type = #string
* item[0].item[0].item[0].repeats = false
* item[0].item[0].item[0].required = true
* item[0].item[0].item[0].readOnly = true
* item[0].item[0].item[0].answerOption.valueString = "https://camdhea.gov.kh/ns/hfid"
* item[0].item[0].item[0].answerOption.initialSelected = true

* item[0].item[0].item[1].linkId = "Location.identifier[0].use"
* item[0].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.use"
* item[0].item[0].item[1].text = "Use"
* item[0].item[0].item[1].type = #choice
* item[0].item[0].item[1].repeats = false
* item[0].item[0].item[1].required = true
* item[0].item[0].item[1].readOnly = true
* item[0].item[0].item[1].answerOption[0].valueCoding = http://hl7.org/fhir/identifier-use#official
* item[0].item[0].item[1].answerOption[0].initialSelected = true

* item[0].item[0].item[2].linkId = "Location.identifier[0].value"
* item[0].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.value"
* item[0].item[0].item[2].text = "HFID"
* item[0].item[0].item[2].type = #string
* item[0].item[0].item[2].repeats = false
* item[0].item[0].item[2].required = true

// Other Identifiers — generic, repeatable
* item[0].item[1].linkId = "Location.identifier[1]"
* item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier"
* item[0].item[1].text = "Identifier"
* item[0].item[1].type = #group
* item[0].item[1].repeats = true
* item[0].item[1].required = false

* item[0].item[1].item[0].linkId = "Location.identifier[1].system"
* item[0].item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.system"
* item[0].item[1].item[0].text = "System"
* item[0].item[1].item[0].type = #string
* item[0].item[1].item[0].repeats = false
* item[0].item[1].item[0].required = false

* item[0].item[1].item[1].linkId = "Location.identifier[1].value"
* item[0].item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.value"
* item[0].item[1].item[1].text = "ID Number"
* item[0].item[1].item[1].type = #string
* item[0].item[1].item[1].repeats = false
* item[0].item[1].item[1].required = false

* item[0].item[1].item[2].linkId = "Location.identifier[1].type"
* item[0].item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier.type"
* item[0].item[1].item[2].text = "ID Type"
* item[0].item[1].item[2].type = #choice
* item[0].item[1].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[0].item[1].item[2].repeats = false
* item[0].item[1].item[2].required = false

// =========================================================================
// item[1] — Facility Name
// =========================================================================
* item[1].linkId = "Location"
* item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[1].text = "Facility Name|Facility name and basic identity"
* item[1].type = #group

* item[1].item[0].linkId = "Location.name"
* item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.name"
* item[1].item[0].text = "Facility Name"
* item[1].item[0].type = #string
* item[1].item[0].required = true
* item[1].item[0].repeats = false

* item[1].item[1].linkId = "Location.alias"
* item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.alias"
* item[1].item[1].text = "Alternative/Nick Names"
* item[1].item[1].type = #string
* item[1].item[1].required = false
* item[1].item[1].repeats = true

* item[1].item[2].linkId = "Location.description"
* item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.description"
* item[1].item[2].text = "Description"
* item[1].item[2].type = #text
* item[1].item[2].required = false
* item[1].item[2].repeats = false

* item[1].item[3].linkId = "Location.status"
* item[1].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.status"
* item[1].item[3].text = "Status"
* item[1].item[3].type = #choice
* item[1].item[3].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[1].item[3].repeats = false
* item[1].item[3].required = true

// Hidden: mCSD facility type code (required for conformance)
* item[1].item[4].linkId = "Location.type[1]"
* item[1].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.type"
* item[1].item[4].text = "Facility Types"
* item[1].item[4].type = #choice
* item[1].item[4].repeats = false
* item[1].item[4].readOnly = true
* item[1].item[4].required = true
* item[1].item[4].answerOption.valueCoding = urn:ietf:rfc:3986#urn:ihe:iti:mcsd:2019:facility
* item[1].item[4].answerOption.initialSelected = true

// Hidden: Physical Type (building)
* item[1].item[5].linkId = "Location.physicalType"
* item[1].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.physicalType"
* item[1].item[5].text = "Physical Type"
* item[1].item[5].type = #choice
* item[1].item[5].required = true
* item[1].item[5].repeats = false
* item[1].item[5].readOnly = true
* item[1].item[5].answerOption.valueCoding = http://terminology.hl7.org/CodeSystem/location-physical-type#bu
* item[1].item[5].answerOption.initialSelected = true

* item[1].item[6].linkId = "Location.partOf#tree"
* item[1].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.partOf"
* item[1].item[6].text = "Parent"
* item[1].item[6].type = #reference
* item[1].item[6].repeats = false
* item[1].item[6].required = false

// Hidden: Managing Organization sync
* item[1].item[7].linkId = "Location.managingOrganization"
* item[1].item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.managingOrganization"
* item[1].item[7].text = "Managing Organization"
* item[1].item[7].type = #string
* item[1].item[7].required = true
* item[1].item[7].repeats = false
* item[1].item[7].readOnly = true
* item[1].item[7].answerOption.valueString = "__REPLACE__Organization.id"
* item[1].item[7].answerOption.initialSelected = true

// =========================================================================
// item[2] — Classification
// =========================================================================
* item[2].linkId = "Location.extension:classification"
* item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[2].text = "Classification|Facility classification details"
* item[2].type = #group

* item[2].item[0].linkId = "Location.type[0]"
* item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.type"
* item[2].item[0].text = "Facility Type"
* item[2].item[0].type = #choice
* item[2].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-type"
* item[2].item[0].repeats = true
* item[2].item[0].required = true

* item[2].item[1].linkId = "Location.extension[16]"
* item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:facilityTypeAcronym.value[x]:valueString"
* item[2].item[1].text = "Facility Type Acronym"
* item[2].item[1].type = #string
* item[2].item[1].required = false
* item[2].item[1].repeats = false

* item[2].item[2].linkId = "Location.extension[0]"
* item[2].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:facilityLevel.value[x]:valueCodeableConcept"
* item[2].item[2].text = "Facility Level"
* item[2].item[2].type = #choice
* item[2].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-level"
* item[2].item[2].required = false
* item[2].item[2].repeats = false

* item[2].item[3].linkId = "Location.extension[1]"
* item[2].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:ownershipType.value[x]:valueCodeableConcept"
* item[2].item[3].text = "Ownership Type"
* item[2].item[3].type = #choice
* item[2].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-ownership-type"
* item[2].item[3].required = false
* item[2].item[3].repeats = false

* item[2].item[4].linkId = "Location.extension[17]"
* item[2].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:managingEntityNameUse.value[x]:valueString"
* item[2].item[4].text = "Managing Entity Name Use"
* item[2].item[4].type = #string
* item[2].item[4].required = false
* item[2].item[4].repeats = false

* item[2].item[5].linkId = "Location.extension[18]"
* item[2].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:managingEntityNameScript.value[x]:valueCodeableConcept"
* item[2].item[5].text = "Managing Entity Name Script"
* item[2].item[5].type = #choice
* item[2].item[5].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-name-script"
* item[2].item[5].required = false
* item[2].item[5].repeats = false

* item[2].item[6].linkId = "Location.extension[19]"
* item[2].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:managingEntityName.value[x]:valueString"
* item[2].item[6].text = "Managing Entity Name"
* item[2].item[6].type = #string
* item[2].item[6].required = false
* item[2].item[6].repeats = false

// =========================================================================
// item[3] — Geographic Location
// =========================================================================
* item[3].linkId = "Location.extension:administrativeLocation"
* item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation"
* item[3].text = "Geographic Location|Administrative boundary codes"
* item[3].type = #group

* item[3].item[0].linkId = "Location.extension[11].extension[0]"
* item[3].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation.extension:province.value[x]:valueString"
* item[3].item[0].text = "Province Code"
* item[3].item[0].type = #string
* item[3].item[0].required = true
* item[3].item[0].repeats = false

* item[3].item[1].linkId = "Location.extension[11].extension[1]"
* item[3].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation.extension:district.value[x]:valueString"
* item[3].item[1].text = "District Code"
* item[3].item[1].type = #string
* item[3].item[1].required = true
* item[3].item[1].repeats = false

* item[3].item[2].linkId = "Location.extension[11].extension[2]"
* item[3].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation.extension:od.value[x]:valueString"
* item[3].item[2].text = "Operational District Code"
* item[3].item[2].type = #string
* item[3].item[2].required = false
* item[3].item[2].repeats = false

* item[3].item[3].linkId = "Location.extension[11].extension[3]"
* item[3].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation.extension:commune.value[x]:valueString"
* item[3].item[3].text = "Commune Code"
* item[3].item[3].type = #string
* item[3].item[3].required = true
* item[3].item[3].repeats = false

* item[3].item[4].linkId = "Location.extension[11].extension[4]"
* item[3].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:administrativeLocation.extension:village.value[x]:valueString"
* item[3].item[4].text = "Village Code"
* item[3].item[4].type = #string
* item[3].item[4].required = true
* item[3].item[4].repeats = false

// =========================================================================
// item[4] — Physical Location
// =========================================================================
* item[4].linkId = "Location.position"
* item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.position"
* item[4].text = "Physical Location|Geo-coordinates and physical details"
* item[4].type = #group

* item[4].item[0].linkId = "Location.position.longitude"
* item[4].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.position.longitude"
* item[4].item[0].text = "Longitude"
* item[4].item[0].type = #string
* item[4].item[0].repeats = false
* item[4].item[0].required = false

* item[4].item[1].linkId = "Location.position.latitude"
* item[4].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.position.latitude"
* item[4].item[1].text = "Latitude"
* item[4].item[1].type = #string
* item[4].item[1].repeats = false
* item[4].item[1].required = false

* item[4].item[2].linkId = "Location.position.altitude"
* item[4].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.position.altitude"
* item[4].item[2].text = "Altitude"
* item[4].item[2].type = #string
* item[4].item[2].repeats = false
* item[4].item[2].required = false

* item[4].item[3].linkId = "Location.extension[2]"
* item[4].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:coordinateAccuracy.value[x]:valueCode"
* item[4].item[3].text = "Coordinate Accuracy"
* item[4].item[3].type = #choice
* item[4].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-coordinate-accuracy"
* item[4].item[3].required = false
* item[4].item[3].repeats = false

* item[4].item[4].linkId = "Location.extension[3]"
* item[4].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:googleMapsLink.value[x]:valueUrl"
* item[4].item[4].text = "Google Maps Link"
* item[4].item[4].type = #url
* item[4].item[4].required = false
* item[4].item[4].repeats = false

// =========================================================================
// item[5] — Administrative
// =========================================================================
* item[5].linkId = "Location.extension:administrative"
* item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[5].text = "Administrative|Administrative details"
* item[5].type = #group

* item[5].item[0].linkId = "Location.operationalStatus"
* item[5].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.operationalStatus"
* item[5].item[0].text = "Operational Status"
* item[5].item[0].type = #choice
* item[5].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-operational-status"
* item[5].item[0].required = false
* item[5].item[0].repeats = false

* item[5].item[1].linkId = "Location.extension[4]"
* item[5].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:facilityHead.value[x]:valueString"
* item[5].item[1].text = "Facility Head HWID"
* item[5].item[1].type = #string
* item[5].item[1].required = false
* item[5].item[1].repeats = false

* item[5].item[2].linkId = "Location.extension[9]"
* item[5].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:operationalPeriod.value[x]:valuePeriod"
* item[5].item[2].text = "Establishment Date"
* item[5].item[2].type = #date
* item[5].item[2].required = false
* item[5].item[2].repeats = false

* item[5].item[3].linkId = "Location.extension[5]"
* item[5].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:closureReason.value[x]:valueCode"
* item[5].item[3].text = "Closure Reason"
* item[5].item[3].type = #choice
* item[5].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-closure-reason"
* item[5].item[3].required = false
* item[5].item[3].repeats = false

* item[5].item[4].linkId = "Location.extension[6]"
* item[5].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:successorHfid.value[x]:valueReference"
* item[5].item[4].text = "Successor Facility"
* item[5].item[4].type = #reference
* item[5].item[4].required = false
* item[5].item[4].repeats = false

// =========================================================================
// item[6] — Licensing
// =========================================================================
* item[6].linkId = "Location.extension:licensing"
* item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[6].text = "Licensing|Facility licence information"
* item[6].type = #group

* item[6].item[0].linkId = "Location.extension[7]"
* item[6].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:licenceStatus.value[x]:valueCode"
* item[6].item[0].text = "Licence Status"
* item[6].item[0].type = #choice
* item[6].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licence-status"
* item[6].item[0].required = false
* item[6].item[0].repeats = false

* item[6].item[1].linkId = "Location.identifier:licenceNumber"
* item[6].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.identifier"
* item[6].item[1].text = "Licence Number"
* item[6].item[1].type = #string
* item[6].item[1].required = false
* item[6].item[1].repeats = false

* item[6].item[2].linkId = "Location.extension[8]"
* item[6].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:licensingAuthority.value[x]:valueCode"
* item[6].item[2].text = "Licensing Authority"
* item[6].item[2].type = #choice
* item[6].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licensing-authority"
* item[6].item[2].required = false
* item[6].item[2].repeats = false

* item[6].item[3].linkId = "Location.extension[10].extension[0]"
* item[6].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:licenceDates.extension:issueDate.value[x]:valueDate"
* item[6].item[3].text = "Licence Issue Date"
* item[6].item[3].type = #date
* item[6].item[3].required = false
* item[6].item[3].repeats = false

* item[6].item[4].linkId = "Location.extension[10].extension[1]"
* item[6].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:licenceDates.extension:expiryDate.value[x]:valueDate"
* item[6].item[4].text = "Licence Expiry Date"
* item[6].item[4].type = #date
* item[6].item[4].required = false
* item[6].item[4].repeats = false

// =========================================================================
// item[7] — Operating Hours
// =========================================================================
* item[7].linkId = "Location.hoursOfOperation"
* item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation"
* item[7].text = "Operating Hours|Facility availability"
* item[7].type = #group

* item[7].item[0].linkId = "Location.hoursOfOperation[0]"
* item[7].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation"
* item[7].item[0].text = "Availability"
* item[7].item[0].type = #group
* item[7].item[0].repeats = true
* item[7].item[0].required = false

* item[7].item[0].item[0].linkId = "Location.hoursOfOperation[0].daysOfWeek"
* item[7].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation[0].daysOfWeek"
* item[7].item[0].item[0].text = "Days of week"
* item[7].item[0].item[0].type = #choice
* item[7].item[0].item[0].answerValueSet = "http://hl7.org/fhir/ValueSet/days-of-week"
* item[7].item[0].item[0].required = true
* item[7].item[0].item[0].repeats = true

* item[7].item[0].item[1].linkId = "Location.hoursOfOperation[0].allDay"
* item[7].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation[0].allDay"
* item[7].item[0].item[1].text = "All day"
* item[7].item[0].item[1].type = #boolean
* item[7].item[0].item[1].required = false
* item[7].item[0].item[1].repeats = false

* item[7].item[0].item[2].linkId = "Location.hoursOfOperation[0].openingTime"
* item[7].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation[0].openingTime"
* item[7].item[0].item[2].text = "Opening time"
* item[7].item[0].item[2].type = #time
* item[7].item[0].item[2].required = false
* item[7].item[0].item[2].repeats = false

* item[7].item[0].item[3].linkId = "Location.hoursOfOperation[0].closingTime"
* item[7].item[0].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.hoursOfOperation[0].closingTime"
* item[7].item[0].item[3].text = "Closing time"
* item[7].item[0].item[3].type = #time
* item[7].item[0].item[3].required = false
* item[7].item[0].item[3].repeats = false

// =========================================================================
// item[8] — Services (placeholder)
// =========================================================================
* item[8].linkId = "Location.extension:services"
* item[8].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[8].text = "Services|Facility service offerings"
* item[8].type = #group

* item[8].item[0].linkId = "Location.extension:services.placeholder"
* item[8].item[0].text = "Services data entry will be available in a future release."
* item[8].item[0].type = #display

// =========================================================================
// item[9] — Workforce Summary
// =========================================================================
* item[9].linkId = "Location.extension:workforceSummary"
* item[9].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:workforceSummary"
* item[9].text = "Workforce Summary|Health worker summary (derived from HWR)"
* item[9].type = #group

* item[9].item[0].linkId = "Location.extension[13]"
* item[9].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:workforceSummary"
* item[9].item[0].text = "Workforce Record"
* item[9].item[0].type = #group
* item[9].item[0].repeats = true
* item[9].item[0].required = false

* item[9].item[0].item[0].linkId = "Location.extension[13].extension[0]"
* item[9].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:workforceSummary.extension:cadre.value[x]:valueCodeableConcept"
* item[9].item[0].item[0].text = "Cadre Category"
* item[9].item[0].item[0].type = #choice
* item[9].item[0].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-cadre-category"
* item[9].item[0].item[0].required = false
* item[9].item[0].item[0].repeats = false

* item[9].item[0].item[1].linkId = "Location.extension[13].extension[1]"
* item[9].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:workforceSummary.extension:headcount.value[x]:valueInteger"
* item[9].item[0].item[1].text = "Headcount"
* item[9].item[0].item[1].type = #integer
* item[9].item[0].item[1].required = false
* item[9].item[0].item[1].repeats = false

* item[9].item[0].item[2].linkId = "Location.extension[13].extension[2]"
* item[9].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:workforceSummary.extension:lastUpdated.value[x]:valueDateTime"
* item[9].item[0].item[2].text = "Last Updated"
* item[9].item[0].item[2].type = #dateTime
* item[9].item[0].item[2].required = false
* item[9].item[0].item[2].repeats = false

// =========================================================================
// item[10] — Catchment
// =========================================================================
* item[10].linkId = "Location.extension:catchment"
* item[10].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[10].text = "Catchment|Catchment villages and population"
* item[10].type = #group

* item[10].item[0].linkId = "Location.extension[14]"
* item[10].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentVillage"
* item[10].item[0].text = "Catchment Village"
* item[10].item[0].type = #group
* item[10].item[0].repeats = true
* item[10].item[0].required = false

* item[10].item[0].item[0].linkId = "Location.extension[14].extension[0]"
* item[10].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentVillage.extension:villageCode.value[x]:valueString"
* item[10].item[0].item[0].text = "Village Code"
* item[10].item[0].item[0].type = #string
* item[10].item[0].item[0].required = true
* item[10].item[0].item[0].repeats = false

* item[10].item[0].item[1].linkId = "Location.extension[14].extension[1]"
* item[10].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentVillage.extension:dateAdded.value[x]:valueDate"
* item[10].item[0].item[1].text = "Date Added"
* item[10].item[0].item[1].type = #date
* item[10].item[0].item[1].required = true
* item[10].item[0].item[1].repeats = false

* item[10].item[0].item[2].linkId = "Location.extension[14].extension[2]"
* item[10].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentVillage.extension:dateRemoved.value[x]:valueDate"
* item[10].item[0].item[2].text = "Date Removed"
* item[10].item[0].item[2].type = #date
* item[10].item[0].item[2].required = false
* item[10].item[0].item[2].repeats = false

* item[10].item[1].linkId = "Location.extension[15]"
* item[10].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentPopulation"
* item[10].item[1].text = "Catchment Population"
* item[10].item[1].type = #group
* item[10].item[1].repeats = false

* item[10].item[1].item[0].linkId = "Location.extension[15].extension[0]"
* item[10].item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentPopulation.extension:count.value[x]:valueInteger"
* item[10].item[1].item[0].text = "Population Count"
* item[10].item[1].item[0].type = #integer
* item[10].item[1].item[0].required = false
* item[10].item[1].item[0].repeats = false

* item[10].item[1].item[1].linkId = "Location.extension[15].extension[1]"
* item[10].item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentPopulation.extension:computationDate.value[x]:valueDateTime"
* item[10].item[1].item[1].text = "Computation Date"
* item[10].item[1].item[1].type = #dateTime
* item[10].item[1].item[1].required = false
* item[10].item[1].item[1].repeats = false

* item[10].item[1].item[2].linkId = "Location.extension[15].extension[2]"
* item[10].item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.extension:catchmentPopulation.extension:computationMethod.value[x]:valueCode"
* item[10].item[1].item[2].text = "Computation Method"
* item[10].item[1].item[2].type = #choice
* item[10].item[1].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-catchment-computation-method"
* item[10].item[1].item[2].required = false
* item[10].item[1].item[2].repeats = false

// =========================================================================
// item[11] — Sub-Facility
// =========================================================================
* item[11].linkId = "Location.extension:subFacility"
* item[11].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility"
* item[11].text = "Sub-Facility|Sub-facility classification"
* item[11].type = #group

* item[11].item[0].linkId = "Location.partOf:subFacility"
* item[11].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.partOf"
* item[11].item[0].text = "Parent Facility (HFID)"
* item[11].item[0].type = #reference
* item[11].item[0].required = false
* item[11].item[0].repeats = false

* item[11].item[1].linkId = "Location.type:subFacilityType"
* item[11].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility#Location.type"
* item[11].item[1].text = "Sub-Facility Type"
* item[11].item[1].type = #choice
* item[11].item[1].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-sub-facility-type"
* item[11].item[1].required = false
* item[11].item[1].repeats = false

// =========================================================================
// item[12] — Organization (kept at end)
// =========================================================================
* item[12].linkId = "Organization"
* item[12].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization"
* item[12].text = "Organization"
* item[12].type = #group

* item[12].item[0].linkId = "Organization.name"
* item[12].item[0].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.name"
* item[12].item[0].text = "Oranization Names"
* item[12].item[0].type = #string
* item[12].item[0].repeats = false
* item[12].item[0].required = true
* item[12].item[0].readOnly = true
* item[12].item[0].answerOption.valueString = "__REPLACE__Location.name"
* item[12].item[0].answerOption.initialSelected = true

* item[12].item[1].linkId = "Organization.type"
* item[12].item[1].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.type"
* item[12].item[1].text = "Oranization Type"
* item[12].item[1].type = #string
* item[12].item[1].repeats = false
* item[12].item[1].required = true
* item[12].item[1].readOnly = true
* item[12].item[1].answerOption.valueString = "__REPLACE__Location.type"
* item[12].item[1].answerOption.initialSelected = true

* item[12].item[2].linkId = "Organization.extension[0]"
* item[12].item[2].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy"
* item[12].item[2].text = "Managing Organization"
* item[12].item[2].type = #group
* item[12].item[2].repeats = true

* item[12].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[12].item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy.extension:part-of.value[x]:valueReference"
* item[12].item[2].item[0].text = "Organization"
* item[12].item[2].item[0].type = #reference
* item[12].item[2].item[0].repeats = false
* item[12].item[2].item[0].required = true

* item[12].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[12].item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[12].item[2].item[1].text = "Type"
* item[12].item[2].item[1].type = #choice
* item[12].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[12].item[2].item[1].repeats = false
* item[12].item[2].item[1].required = false


// #################################################################
// GofrFacilityAddRequestQuestionnaire — structured to mirror GofrFacilityQuestionnaire
// Sections: Identifiers, Facility Name, Classification, Geographic Location,
//           Physical Location, Administrative, Licensing, Operating Hours,
//           Services, Workforce Summary, Catchment, Sub-Facility, Organization
// #################################################################
Instance:       GofrFacilityAddRequestQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "GOFR Facility Add Request Questionnaire"
* description = "GOFR Questionnaire For Request To Add Facility."
* id = "gofr-facility-add-request-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-add-request-questionnaire"
* name = "gofr-facility-add-request-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

// =========================================================================
// item[0] — Identifiers
// =========================================================================
* item[0].linkId = "Location.identifier"
* item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[0].text = "Identifiers|Identifiers for the facility"
* item[0].type = #group

// HFID — dedicated, pre-filled system/use, non-repeatable
* item[0].item[0].linkId = "Location.identifier[0]"
* item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[0].item[0].text = "HFID (Health Facility ID)"
* item[0].item[0].type = #group
* item[0].item[0].repeats = false
* item[0].item[0].required = true

* item[0].item[0].item[0].linkId = "Location.identifier[0].system"
* item[0].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.system"
* item[0].item[0].item[0].text = "System"
* item[0].item[0].item[0].type = #string
* item[0].item[0].item[0].repeats = false
* item[0].item[0].item[0].required = true
* item[0].item[0].item[0].readOnly = true
* item[0].item[0].item[0].answerOption.valueString = "https://camdhea.gov.kh/ns/hfid"
* item[0].item[0].item[0].answerOption.initialSelected = true

* item[0].item[0].item[1].linkId = "Location.identifier[0].use"
* item[0].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.use"
* item[0].item[0].item[1].text = "Use"
* item[0].item[0].item[1].type = #choice
* item[0].item[0].item[1].repeats = false
* item[0].item[0].item[1].required = true
* item[0].item[0].item[1].readOnly = true
* item[0].item[0].item[1].answerOption[0].valueCoding = http://hl7.org/fhir/identifier-use#official
* item[0].item[0].item[1].answerOption[0].initialSelected = true

* item[0].item[0].item[2].linkId = "Location.identifier[0].value"
* item[0].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.value"
* item[0].item[0].item[2].text = "HFID"
* item[0].item[0].item[2].type = #string
* item[0].item[0].item[2].repeats = false
* item[0].item[0].item[2].required = true

// Other Identifiers — generic, repeatable
* item[0].item[1].linkId = "Location.identifier[1]"
* item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[0].item[1].text = "Identifier"
* item[0].item[1].type = #group
* item[0].item[1].repeats = true
* item[0].item[1].required = false

* item[0].item[1].item[0].linkId = "Location.identifier[1].system"
* item[0].item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.system"
* item[0].item[1].item[0].text = "System"
* item[0].item[1].item[0].type = #string
* item[0].item[1].item[0].repeats = false
* item[0].item[1].item[0].required = false

* item[0].item[1].item[1].linkId = "Location.identifier[1].value"
* item[0].item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.value"
* item[0].item[1].item[1].text = "ID Number"
* item[0].item[1].item[1].type = #string
* item[0].item[1].item[1].repeats = false
* item[0].item[1].item[1].required = false

* item[0].item[1].item[2].linkId = "Location.identifier[1].type"
* item[0].item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.type"
* item[0].item[1].item[2].text = "ID Type"
* item[0].item[1].item[2].type = #choice
* item[0].item[1].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[0].item[1].item[2].repeats = false
* item[0].item[1].item[2].required = false

// =========================================================================
// item[1] — Facility Name
// =========================================================================
* item[1].linkId = "Location"
* item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[1].text = "Facility Name|Facility name and basic identity"
* item[1].type = #group

* item[1].item[0].linkId = "Location.name"
* item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.name"
* item[1].item[0].text = "Facility Name"
* item[1].item[0].type = #string
* item[1].item[0].required = true
* item[1].item[0].repeats = false

* item[1].item[1].linkId = "Location.alias"
* item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.alias"
* item[1].item[1].text = "Alternative/Nick Names"
* item[1].item[1].type = #string
* item[1].item[1].required = false
* item[1].item[1].repeats = true

* item[1].item[2].linkId = "Location.description"
* item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.description"
* item[1].item[2].text = "Description"
* item[1].item[2].type = #text
* item[1].item[2].required = false
* item[1].item[2].repeats = false

* item[1].item[3].linkId = "Location.status"
* item[1].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.status"
* item[1].item[3].text = "Status"
* item[1].item[3].type = #choice
* item[1].item[3].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[1].item[3].repeats = false
* item[1].item[3].required = true

// Hidden: mCSD facility type code (required for conformance)
* item[1].item[4].linkId = "Location.type[1]"
* item[1].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.type"
* item[1].item[4].text = "Facility Types"
* item[1].item[4].type = #choice
* item[1].item[4].repeats = false
* item[1].item[4].readOnly = true
* item[1].item[4].required = true
* item[1].item[4].answerOption.valueCoding = urn:ietf:rfc:3986#urn:ihe:iti:mcsd:2019:facility
* item[1].item[4].answerOption.initialSelected = true

// Hidden: Physical Type (building)
* item[1].item[5].linkId = "Location.physicalType"
* item[1].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.physicalType"
* item[1].item[5].text = "Physical Type"
* item[1].item[5].type = #choice
* item[1].item[5].required = true
* item[1].item[5].repeats = false
* item[1].item[5].readOnly = true
* item[1].item[5].answerOption.valueCoding = http://terminology.hl7.org/CodeSystem/location-physical-type#bu
* item[1].item[5].answerOption.initialSelected = true

* item[1].item[6].linkId = "Location.partOf#tree"
* item[1].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.partOf"
* item[1].item[6].text = "Parent"
* item[1].item[6].type = #reference
* item[1].item[6].repeats = false
* item[1].item[6].required = false

// Hidden: Request Status (auto-set to pending)
// extension[20] = requestStatus (GofrFacilityAddRequest adds this after the 20 inherited gofr-facility extensions [0-19])
* item[1].item[7].linkId = "Location.extension[20]"
* item[1].item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:requestStatus.value[x]:valueCoding"
* item[1].item[7].text = "Request Status"
* item[1].item[7].type = #choice
* item[1].item[7].required = true
* item[1].item[7].repeats = false
* item[1].item[7].readOnly = true
* item[1].item[7].answerOption.valueCoding = http://gofr.org/fhir/StructureDefinition/request-status-codesystem#pending "Pending"
* item[1].item[7].answerOption.initialSelected = true

// =========================================================================
// item[2] — Classification
// =========================================================================
* item[2].linkId = "Location.extension:classification"
* item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[2].text = "Classification|Facility classification details"
* item[2].type = #group

* item[2].item[0].linkId = "Location.type[0]"
* item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.type"
* item[2].item[0].text = "Facility Type"
* item[2].item[0].type = #choice
* item[2].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-type"
* item[2].item[0].repeats = true
* item[2].item[0].required = true

* item[2].item[1].linkId = "Location.extension[16]"
* item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:facilityTypeAcronym.value[x]:valueString"
* item[2].item[1].text = "Facility Type Acronym"
* item[2].item[1].type = #string
* item[2].item[1].required = false
* item[2].item[1].repeats = false

* item[2].item[2].linkId = "Location.extension[0]"
* item[2].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:facilityLevel.value[x]:valueCodeableConcept"
* item[2].item[2].text = "Facility Level"
* item[2].item[2].type = #choice
* item[2].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-level"
* item[2].item[2].required = false
* item[2].item[2].repeats = false

* item[2].item[3].linkId = "Location.extension[1]"
* item[2].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:ownershipType.value[x]:valueCodeableConcept"
* item[2].item[3].text = "Ownership Type"
* item[2].item[3].type = #choice
* item[2].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-ownership-type"
* item[2].item[3].required = false
* item[2].item[3].repeats = false

* item[2].item[4].linkId = "Location.extension[17]"
* item[2].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:managingEntityNameUse.value[x]:valueString"
* item[2].item[4].text = "Managing Entity Name Use"
* item[2].item[4].type = #string
* item[2].item[4].required = false
* item[2].item[4].repeats = false

* item[2].item[5].linkId = "Location.extension[18]"
* item[2].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:managingEntityNameScript.value[x]:valueCodeableConcept"
* item[2].item[5].text = "Managing Entity Name Script"
* item[2].item[5].type = #choice
* item[2].item[5].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-name-script"
* item[2].item[5].required = false
* item[2].item[5].repeats = false

* item[2].item[6].linkId = "Location.extension[19]"
* item[2].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:managingEntityName.value[x]:valueString"
* item[2].item[6].text = "Managing Entity Name"
* item[2].item[6].type = #string
* item[2].item[6].required = false
* item[2].item[6].repeats = false

// =========================================================================
// item[3] — Geographic Location
// =========================================================================
* item[3].linkId = "Location.extension:administrativeLocation"
* item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation"
* item[3].text = "Geographic Location|Administrative boundary codes"
* item[3].type = #group

* item[3].item[0].linkId = "Location.extension[11].extension[0]"
* item[3].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation.extension:province.value[x]:valueString"
* item[3].item[0].text = "Province Code"
* item[3].item[0].type = #string
* item[3].item[0].required = true
* item[3].item[0].repeats = false

* item[3].item[1].linkId = "Location.extension[11].extension[1]"
* item[3].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation.extension:district.value[x]:valueString"
* item[3].item[1].text = "District Code"
* item[3].item[1].type = #string
* item[3].item[1].required = true
* item[3].item[1].repeats = false

* item[3].item[2].linkId = "Location.extension[11].extension[2]"
* item[3].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation.extension:od.value[x]:valueString"
* item[3].item[2].text = "Operational District Code"
* item[3].item[2].type = #string
* item[3].item[2].required = false
* item[3].item[2].repeats = false

* item[3].item[3].linkId = "Location.extension[11].extension[3]"
* item[3].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation.extension:commune.value[x]:valueString"
* item[3].item[3].text = "Commune Code"
* item[3].item[3].type = #string
* item[3].item[3].required = true
* item[3].item[3].repeats = false

* item[3].item[4].linkId = "Location.extension[11].extension[4]"
* item[3].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:administrativeLocation.extension:village.value[x]:valueString"
* item[3].item[4].text = "Village Code"
* item[3].item[4].type = #string
* item[3].item[4].required = true
* item[3].item[4].repeats = false

// =========================================================================
// item[4] — Physical Location
// =========================================================================
* item[4].linkId = "Location.position"
* item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position"
* item[4].text = "Physical Location|Geo-coordinates and physical details"
* item[4].type = #group

* item[4].item[0].linkId = "Location.position.longitude"
* item[4].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.longitude"
* item[4].item[0].text = "Longitude"
* item[4].item[0].type = #string
* item[4].item[0].repeats = false
* item[4].item[0].required = false

* item[4].item[1].linkId = "Location.position.latitude"
* item[4].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.latitude"
* item[4].item[1].text = "Latitude"
* item[4].item[1].type = #string
* item[4].item[1].repeats = false
* item[4].item[1].required = false

* item[4].item[2].linkId = "Location.position.altitude"
* item[4].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.altitude"
* item[4].item[2].text = "Altitude"
* item[4].item[2].type = #string
* item[4].item[2].repeats = false
* item[4].item[2].required = false

* item[4].item[3].linkId = "Location.extension[2]"
* item[4].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:coordinateAccuracy.value[x]:valueCode"
* item[4].item[3].text = "Coordinate Accuracy"
* item[4].item[3].type = #choice
* item[4].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-coordinate-accuracy"
* item[4].item[3].required = false
* item[4].item[3].repeats = false

* item[4].item[4].linkId = "Location.extension[3]"
* item[4].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:googleMapsLink.value[x]:valueUrl"
* item[4].item[4].text = "Google Maps Link"
* item[4].item[4].type = #url
* item[4].item[4].required = false
* item[4].item[4].repeats = false

// =========================================================================
// item[5] — Administrative
// =========================================================================
* item[5].linkId = "Location.extension:administrative"
* item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[5].text = "Administrative|Administrative details"
* item[5].type = #group

* item[5].item[0].linkId = "Location.operationalStatus"
* item[5].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.operationalStatus"
* item[5].item[0].text = "Operational Status"
* item[5].item[0].type = #choice
* item[5].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-operational-status"
* item[5].item[0].required = false
* item[5].item[0].repeats = false

* item[5].item[1].linkId = "Location.extension[4]"
* item[5].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:facilityHead.value[x]:valueString"
* item[5].item[1].text = "Facility Head HWID"
* item[5].item[1].type = #string
* item[5].item[1].required = false
* item[5].item[1].repeats = false

* item[5].item[2].linkId = "Location.extension[9]"
* item[5].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:operationalPeriod.value[x]:valuePeriod"
* item[5].item[2].text = "Establishment Date"
* item[5].item[2].type = #date
* item[5].item[2].required = false
* item[5].item[2].repeats = false

* item[5].item[3].linkId = "Location.extension[5]"
* item[5].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:closureReason.value[x]:valueCode"
* item[5].item[3].text = "Closure Reason"
* item[5].item[3].type = #choice
* item[5].item[3].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-closure-reason"
* item[5].item[3].required = false
* item[5].item[3].repeats = false

* item[5].item[4].linkId = "Location.extension[6]"
* item[5].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:successorHfid.value[x]:valueReference"
* item[5].item[4].text = "Successor Facility"
* item[5].item[4].type = #reference
* item[5].item[4].required = false
* item[5].item[4].repeats = false

// =========================================================================
// item[6] — Licensing
// =========================================================================
* item[6].linkId = "Location.extension:licensing"
* item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[6].text = "Licensing|Facility licence information"
* item[6].type = #group

* item[6].item[0].linkId = "Location.extension[7]"
* item[6].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:licenceStatus.value[x]:valueCode"
* item[6].item[0].text = "Licence Status"
* item[6].item[0].type = #choice
* item[6].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licence-status"
* item[6].item[0].required = false
* item[6].item[0].repeats = false

* item[6].item[1].linkId = "Location.identifier:licenceNumber"
* item[6].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[6].item[1].text = "Licence Number"
* item[6].item[1].type = #string
* item[6].item[1].required = false
* item[6].item[1].repeats = false

* item[6].item[2].linkId = "Location.extension[8]"
* item[6].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:licensingAuthority.value[x]:valueCode"
* item[6].item[2].text = "Licensing Authority"
* item[6].item[2].type = #choice
* item[6].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licensing-authority"
* item[6].item[2].required = false
* item[6].item[2].repeats = false

* item[6].item[3].linkId = "Location.extension[10].extension[0]"
* item[6].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:licenceDates.extension:issueDate.value[x]:valueDate"
* item[6].item[3].text = "Licence Issue Date"
* item[6].item[3].type = #date
* item[6].item[3].required = false
* item[6].item[3].repeats = false

* item[6].item[4].linkId = "Location.extension[10].extension[1]"
* item[6].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:licenceDates.extension:expiryDate.value[x]:valueDate"
* item[6].item[4].text = "Licence Expiry Date"
* item[6].item[4].type = #date
* item[6].item[4].required = false
* item[6].item[4].repeats = false

// =========================================================================
// item[7] — Operating Hours
// =========================================================================
* item[7].linkId = "Location.hoursOfOperation"
* item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation"
* item[7].text = "Operating Hours|Facility availability"
* item[7].type = #group

* item[7].item[0].linkId = "Location.hoursOfOperation[0]"
* item[7].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation"
* item[7].item[0].text = "Availability"
* item[7].item[0].type = #group
* item[7].item[0].repeats = true
* item[7].item[0].required = false

* item[7].item[0].item[0].linkId = "Location.hoursOfOperation[0].daysOfWeek"
* item[7].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].daysOfWeek"
* item[7].item[0].item[0].text = "Days of week"
* item[7].item[0].item[0].type = #choice
* item[7].item[0].item[0].answerValueSet = "http://hl7.org/fhir/ValueSet/days-of-week"
* item[7].item[0].item[0].required = true
* item[7].item[0].item[0].repeats = true

* item[7].item[0].item[1].linkId = "Location.hoursOfOperation[0].allDay"
* item[7].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].allDay"
* item[7].item[0].item[1].text = "All day"
* item[7].item[0].item[1].type = #boolean
* item[7].item[0].item[1].required = false
* item[7].item[0].item[1].repeats = false

* item[7].item[0].item[2].linkId = "Location.hoursOfOperation[0].openingTime"
* item[7].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].openingTime"
* item[7].item[0].item[2].text = "Opening time"
* item[7].item[0].item[2].type = #time
* item[7].item[0].item[2].required = false
* item[7].item[0].item[2].repeats = false

* item[7].item[0].item[3].linkId = "Location.hoursOfOperation[0].closingTime"
* item[7].item[0].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].closingTime"
* item[7].item[0].item[3].text = "Closing time"
* item[7].item[0].item[3].type = #time
* item[7].item[0].item[3].required = false
* item[7].item[0].item[3].repeats = false

// =========================================================================
// item[8] — Services (placeholder)
// =========================================================================
* item[8].linkId = "Location.extension:services"
* item[8].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[8].text = "Services|Facility service offerings"
* item[8].type = #group

* item[8].item[0].linkId = "Location.extension:services.placeholder"
* item[8].item[0].text = "Services data entry will be available in a future release."
* item[8].item[0].type = #display

// =========================================================================
// item[9] — Workforce Summary
// =========================================================================
* item[9].linkId = "Location.extension:workforceSummary"
* item[9].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:workforceSummary"
* item[9].text = "Workforce Summary|Health worker summary (derived from HWR)"
* item[9].type = #group

* item[9].item[0].linkId = "Location.extension[13]"
* item[9].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:workforceSummary"
* item[9].item[0].text = "Workforce Record"
* item[9].item[0].type = #group
* item[9].item[0].repeats = true
* item[9].item[0].required = false

* item[9].item[0].item[0].linkId = "Location.extension[13].extension[0]"
* item[9].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:workforceSummary.extension:cadre.value[x]:valueCodeableConcept"
* item[9].item[0].item[0].text = "Cadre Category"
* item[9].item[0].item[0].type = #choice
* item[9].item[0].item[0].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-cadre-category"
* item[9].item[0].item[0].required = false
* item[9].item[0].item[0].repeats = false

* item[9].item[0].item[1].linkId = "Location.extension[13].extension[1]"
* item[9].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:workforceSummary.extension:headcount.value[x]:valueInteger"
* item[9].item[0].item[1].text = "Headcount"
* item[9].item[0].item[1].type = #integer
* item[9].item[0].item[1].required = false
* item[9].item[0].item[1].repeats = false

* item[9].item[0].item[2].linkId = "Location.extension[13].extension[2]"
* item[9].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:workforceSummary.extension:lastUpdated.value[x]:valueDateTime"
* item[9].item[0].item[2].text = "Last Updated"
* item[9].item[0].item[2].type = #dateTime
* item[9].item[0].item[2].required = false
* item[9].item[0].item[2].repeats = false

// =========================================================================
// item[10] — Catchment
// =========================================================================
* item[10].linkId = "Location.extension:catchment"
* item[10].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[10].text = "Catchment|Catchment villages and population"
* item[10].type = #group

* item[10].item[0].linkId = "Location.extension[14]"
* item[10].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentVillage"
* item[10].item[0].text = "Catchment Village"
* item[10].item[0].type = #group
* item[10].item[0].repeats = true
* item[10].item[0].required = false

* item[10].item[0].item[0].linkId = "Location.extension[14].extension[0]"
* item[10].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentVillage.extension:villageCode.value[x]:valueString"
* item[10].item[0].item[0].text = "Village Code"
* item[10].item[0].item[0].type = #string
* item[10].item[0].item[0].required = true
* item[10].item[0].item[0].repeats = false

* item[10].item[0].item[1].linkId = "Location.extension[14].extension[1]"
* item[10].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentVillage.extension:dateAdded.value[x]:valueDate"
* item[10].item[0].item[1].text = "Date Added"
* item[10].item[0].item[1].type = #date
* item[10].item[0].item[1].required = true
* item[10].item[0].item[1].repeats = false

* item[10].item[0].item[2].linkId = "Location.extension[14].extension[2]"
* item[10].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentVillage.extension:dateRemoved.value[x]:valueDate"
* item[10].item[0].item[2].text = "Date Removed"
* item[10].item[0].item[2].type = #date
* item[10].item[0].item[2].required = false
* item[10].item[0].item[2].repeats = false

* item[10].item[1].linkId = "Location.extension[15]"
* item[10].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentPopulation"
* item[10].item[1].text = "Catchment Population"
* item[10].item[1].type = #group
* item[10].item[1].repeats = false

* item[10].item[1].item[0].linkId = "Location.extension[15].extension[0]"
* item[10].item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentPopulation.extension:count.value[x]:valueInteger"
* item[10].item[1].item[0].text = "Population Count"
* item[10].item[1].item[0].type = #integer
* item[10].item[1].item[0].required = false
* item[10].item[1].item[0].repeats = false

* item[10].item[1].item[1].linkId = "Location.extension[15].extension[1]"
* item[10].item[1].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentPopulation.extension:computationDate.value[x]:valueDateTime"
* item[10].item[1].item[1].text = "Computation Date"
* item[10].item[1].item[1].type = #dateTime
* item[10].item[1].item[1].required = false
* item[10].item[1].item[1].repeats = false

* item[10].item[1].item[2].linkId = "Location.extension[15].extension[2]"
* item[10].item[1].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:catchmentPopulation.extension:computationMethod.value[x]:valueCode"
* item[10].item[1].item[2].text = "Computation Method"
* item[10].item[1].item[2].type = #choice
* item[10].item[1].item[2].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-catchment-computation-method"
* item[10].item[1].item[2].required = false
* item[10].item[1].item[2].repeats = false

// =========================================================================
// item[11] — Sub-Facility
// =========================================================================
* item[11].linkId = "Location.extension:subFacility"
* item[11].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[11].text = "Sub-Facility|Sub-facility classification"
* item[11].type = #group

* item[11].item[0].linkId = "Location.partOf:subFacility"
* item[11].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.partOf"
* item[11].item[0].text = "Parent Facility (HFID)"
* item[11].item[0].type = #reference
* item[11].item[0].required = false
* item[11].item[0].repeats = false

* item[11].item[1].linkId = "Location.type:subFacilityType"
* item[11].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.type"
* item[11].item[1].text = "Sub-Facility Type"
* item[11].item[1].type = #choice
* item[11].item[1].answerValueSet = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-sub-facility-type"
* item[11].item[1].required = false
* item[11].item[1].repeats = false

// =========================================================================
// item[12] — Organization (kept at end)
// =========================================================================
* item[12].linkId = "Organization"
* item[12].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization"
* item[12].text = "Organization"
* item[12].type = #group

* item[12].item[0].linkId = "Organization.name"
* item[12].item[0].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.name"
* item[12].item[0].text = "Oranization Names"
* item[12].item[0].type = #string
* item[12].item[0].repeats = false
* item[12].item[0].required = true
* item[12].item[0].readOnly = true
* item[12].item[0].answerOption.valueString = "__REPLACE__Location.name"
* item[12].item[0].answerOption.initialSelected = true

* item[12].item[1].linkId = "Organization.type"
* item[12].item[1].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.type"
* item[12].item[1].text = "Oranization Type"
* item[12].item[1].type = #string
* item[12].item[1].repeats = false
* item[12].item[1].required = true
* item[12].item[1].readOnly = true
* item[12].item[1].answerOption.valueString = "__REPLACE__Location.type"
* item[12].item[1].answerOption.initialSelected = true

* item[12].item[2].linkId = "Organization.extension[0]"
* item[12].item[2].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy"
* item[12].item[2].text = "Managing Organization"
* item[12].item[2].type = #group
* item[12].item[2].repeats = true

* item[12].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[12].item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy.extension:part-of.value[x]:valueReference"
* item[12].item[2].item[0].text = "Organization"
* item[12].item[2].item[0].type = #reference
* item[12].item[2].item[0].repeats = false
* item[12].item[2].item[0].required = true

* item[12].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[12].item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization#Organization.extension:gofr-facility-hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[12].item[2].item[1].text = "Type"
* item[12].item[2].item[1].type = #choice
* item[12].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[12].item[2].item[1].repeats = false
* item[12].item[2].item[1].required = false
