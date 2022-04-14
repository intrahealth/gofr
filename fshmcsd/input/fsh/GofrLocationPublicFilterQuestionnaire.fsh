Profile:      PublicFilterFacilityLocation
Parent:       Location
Id:           PublicFilterFacilityLocation
Title:        "Facilities"
Description:  "A profile on the mCSD Location profile for mCSD Facilities."

* ^url = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation"

* status 0..1 MS
* status ^label = "Status"
* identifier 0..* MS
* identifier ^label = "Identifier"
* identifier ^constraint[0].key = "gofr-search-identifier"
* identifier ^constraint[0].severity = #error
* identifier ^constraint[0].expression = "'Location' | 'identifier' | iif(system.exists(), system & '|' & value, value)"
* identifier ^constraint[0].human = "The identifier must be unique and another record has this identifier"
* identifier.use MS
* identifier.use ^label = "Use"
* identifier.type MS
* identifier.type ^label = "Type"
* identifier.type.coding 1..1 MS
* identifier.type.coding ^label = "Type"
* identifier.system MS
* identifier.system ^label = "System"
* identifier.value MS
* identifier.value ^label = "Value"
* type 0..* MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from 	http://gofr.org/fhir/ValueSet/gofr-location-type-valueset
* partOf 0..1 MS
* partOf only Reference(MCSDJurisdictionLocation)
* partOf ^label = "Parent"


Instance:       gofr-page-facility-public-filter
InstanceOf:     GofrPage
Title:          "GOFR Facility Public Filter Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Exclude From Public View Facility With Below Values"
* extension[display].extension[partition].valueString = "DEFAULT"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/PublicFilterFacilityLocation)
* extension[display].extension[search][0].valueString = "Status|status"
* extension[section][0].extension[title].valueString = "Exclude Facilities Of"
* extension[section][0].extension[description].valueString = "Exclude Facilities Of"
* extension[section][0].extension[name].valueString = "Location"
* extension[section][0].extension[field][0].valueString = "Location.status"
* extension[section][0].extension[field][1].valueString = "Location.identifier"
* extension[section][0].extension[field][2].valueString = "Location.type"
* extension[section][0].extension[field][3].valueString = "Location.partOf"

Instance: facility-public-filter
InstanceOf: PublicFilterFacilityLocation
Usage: #example

Extension:      GofrPublicAccess
Id:             gofr-public-access
Title:          "iHRIS Practitioner Marital Status"
Description:    "iHRIS extension for Practitioner marital status."
* ^context.type = #element
* ^context.expression = "Location"
* value[x] only boolean
* valueBoolean 1..1 MS
* valueBoolean ^label = "Accessible in Public"

Extension:      GofrLocationType
Id:             gofr-location-type
Title:          "iHRIS Practitioner Marital Status"
Description:    "iHRIS extension for Practitioner marital status."
* ^context.type = #element
* ^context.expression = "Location"
* value[x] only Coding
* valueCoding 1..1 MS
* valueCoding ^label = "Location Type"
* valueCoding from LocationTypeValueSet (required)

CodeSystem:      LocationTypeCodeSystem
Id:              location-type-codesystem
Title:           "Hali ya ndoa"
* ^date = "2022-02-26T18:39:04.362Z"
* ^version = "0.2.0"
* #healthcenter "Health Center" "Health Center"
* #hospital "Hospital" "Hospital"
* #dispensary "Dispensary" "Dispensary"

ValueSet:         LocationTypeValueSet
Id:               location-type-valueset
Title:            "ITSF Hali ya ndoa"
* ^date = "2022-01-29T09:05:04.362Z"
* ^version = "0.1.0"
* codes from system LocationTypeCodeSystem