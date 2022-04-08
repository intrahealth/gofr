Instance:       GofrFacilityPublicFilterQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "Exclude From Public View Facility With Below Details"
* description = "GOFR Facility initial data entry questionnaire."
* id = "gofr-facility-public-filter-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-public-filter-questionnaire"
* name = "gofr-facility-public-filter-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

* item[0].linkId = "Location"
* item[0].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.name"
* item[0].item[0].text = "Facility Name"
* item[0].item[0].type = #string
* item[0].item[0].required = false
* item[0].item[0].repeats = true

* item[0].item[1].linkId = "Location.status"
* item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.status"
* item[0].item[1].text = "Status"
* item[0].item[1].type = #choice
* item[0].item[1].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[0].item[1].repeats = true
* item[0].item[1].required = false

* item[0].item[2].linkId = "Location.type"
* item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.type"
* item[0].item[2].text = "Facility Types"
* item[0].item[2].type = #choice
* item[0].item[2].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-location-type-valueset"
* item[0].item[2].repeats = true
* item[0].item[2].required = false

* item[0].item[3].linkId = "Location.physicalType"
* item[0].item[3].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.physicalType"
* item[0].item[3].text = "Physical Type"
* item[0].item[3].type = #choice
* item[0].item[3].required = false
* item[0].item[3].repeats = true
* item[0].item[3].readOnly = true
* item[0].item[3].answerOption.valueCoding = http://terminology.hl7.org/CodeSystem/location-physical-type#bu
* item[0].item[3].answerOption.initialSelected = true

* item[0].item[4].linkId = "Location.partOf#tree"
* item[0].item[4].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.partOf"
* item[0].item[4].text = "Parent"
* item[0].item[4].type = #reference
* item[0].item[4].repeats = true
* item[0].item[4].required = false

* item[0].item[5].linkId = "Location.extension[0]"
* item[0].item[5].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.extension:locationtype.value[x]:valueCoding"
* item[0].item[5].text = "Facility Type"
* item[0].item[5].type = #choice
* item[0].item[5].answerValueSet = "http://gofr.org/fhir/ValueSet/location-type-valueset"
* item[0].item[5].required = false
* item[0].item[5].repeats = true

* item[0].item[6].linkId = "Location.extension[1]"
* item[0].item[6].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.extension:publicaccess.value[x]:valueBoolean"
* item[0].item[6].text = "Exclude Accessible in Public"
* item[0].item[6].type = #boolean
* item[0].item[6].required = false
* item[0].item[6].repeats = false

* item[1].linkId = "Location.identifier"
* item[1].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.identifier"
* item[1].text = "Identifiers|Identifiers for the facility"
* item[1].type = #group

* item[1].item[0].linkId = "Location.identifier[0]"
* item[1].item[0].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.identifier"
* item[1].item[0].text = "Identifier"
* item[1].item[0].type = #group
* item[1].item[0].repeats = true
* item[1].item[0].required = false

* item[1].item[0].item[0].linkId = "Location.identifier[0].system"
* item[1].item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.identifier.system"
* item[1].item[0].item[0].text = "System"
* item[1].item[0].item[0].type = #string
* item[1].item[0].item[0].repeats = false
* item[1].item[0].item[0].required = false

* item[1].item[0].item[1].linkId = "Location.identifier[0].value"
* item[1].item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.identifier.value"
* item[1].item[0].item[1].text = "ID Number"
* item[1].item[0].item[1].type = #string
* item[1].item[0].item[1].repeats = false
* item[1].item[0].item[1].required = false

* item[1].item[0].item[2].linkId = "Location.identifier[0].type"
* item[1].item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation#Location.identifier.type"
* item[1].item[0].item[2].text = "ID Type"
* item[1].item[0].item[2].type = #choice
* item[1].item[0].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[1].item[0].item[2].repeats = false
* item[1].item[0].item[2].required = false


Profile:      MCSDFacilityPublicFilterLocation
Parent:       MCSDFacilityLocation
Id:           PublicFilterFacilityLocation
Title:        "Facilities"
Description:  "A profile on the mCSD Location profile for mCSD Facilities."

* ^url = "http://ihe.net/fhir/StructureDefinition/PublicFilterFacilityLocation"

* name 1..1 MS
* name ^label = "Name"
* physicalType 1..1 MS
* physicalType ^label = "Physical Type"
* physicalType.coding 1..1 MS
* physicalType.coding ^label = "Physical Type"
* physicalType.coding from 	http://hl7.org/fhir/ValueSet/location-physical-type
* description 0..1 MS
* description ^label = "Description"
* alias 0..* MS
* alias ^label = "Nickname"
* status 1..1 MS
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
* type 2..* MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from 	http://gofr.org/fhir/ValueSet/gofr-location-type-valueset
* position 0..1 MS
* position ^label = "Co-ordinates"
* position.latitude MS
* position.latitude ^label = "Latitude"
* position.longitude MS
* position.longitude ^label = "Longitude"
* managingOrganization 1..1 MS
* managingOrganization only Reference(MCSDFacilityOrganization)
* telecom 0..* MS
* telecom ^label = "Telecom"
* telecom.system MS
* telecom.system ^label = "Contact Type"
* telecom.use MS
* telecom.use ^label = "Use"
* telecom.value MS
* telecom.value ^label = "Value"
* address 0..1 MS
* address ^label = "Address"
* address.use MS
* address.use ^label = "Use"
* address.type MS
* address.type ^label = "Type"
* address.line 0..1 MS
* address.line ^label = "Line"
* address.city MS
* address.city ^label = "City"
* address.district MS
* address.district ^label = "District"
* address.state MS
* address.state ^label = "State"
* address.postalCode MS
* address.postalCode ^label = "Postal Code"
* address.country MS
* address.country ^label = "Country"
* hoursOfOperation 0..* MS
* hoursOfOperation ^label = "Hours of operation"
* hoursOfOperation.daysOfWeek MS
* hoursOfOperation.daysOfWeek ^label = "Days of week"
* hoursOfOperation.allDay MS
* hoursOfOperation.allDay ^label = "Open all day"
* hoursOfOperation.openingTime MS
* hoursOfOperation.openingTime ^label = "Time that the facility is open"
* hoursOfOperation.closingTime MS
* hoursOfOperation.closingTime ^label = "Time that the facility closes"
* partOf 0..1 MS
* partOf only Reference(MCSDJurisdictionLocation)
* partOf ^label = "Parent"
* extension contains
    GofrPublicAccess named publicaccess 0..1 MS and
    GofrLocationType named locationtype 0..* MS
* extension[publicaccess].valueBoolean ^label = "Accessible in Public"
* extension[publicaccess].valueBoolean 1..1 MS
* extension[locationtype].valueCoding ^label = "Facility Type"
* extension[locationtype].valueCoding 1..1 MS

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