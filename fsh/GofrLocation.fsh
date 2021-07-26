Profile:        GofrJurisdiction
Parent:         Location
Id:             gofr-jurisdiction
Title:          "GOFR Jurisdiction"
Description:    "GOFR Profile of Locations to manage jurisdictions."
* type 1..1 MS
* type ^label = "Location Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from GofrJurisdictionType (required)
* name 1..1 MS
* name ^label = "Name"
* alias 0..* MS
* alias ^label = "Nickname"
* status 1..1 MS
* status ^label = "Status"
* partOf 0..1 MS
* partOf only Reference(GofrJurisdiction)
* partOf ^label = "Parent"
* extension contains http://hl7.org/fhir/StructureDefinition/location-boundary-geojson named geojson 0..*

Profile:        GofrMcsdFacilityOrganization
Parent:         MCSDFacilityOrganization
Id:             GOFR.IHE.mCSD.FacilityOrganization
Title:          "GOFR Facility Organization"
Description:    "GOFR Profile of Locations to manage facilities organization."
* name 1..1 MS
* name ^label = "Name"
* type 2..* MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* contact 0..* MS
* contact.purpose MS
* contact.purpose ^label = "Purpose"
* contact.purpose.coding 1..1 MS
* contact.purpose.coding ^label = "Purpose"
* contact.name 1..1 MS
* contact.name ^label = "Contact Person"
* contact.name.use 0..1 MS
* contact.name.use ^label = "Usage"
* contact.name.family 1..1 MS
* contact.name.family ^label = "Family"
* contact.name.given 1..1 MS
* contact.name.given ^label = "Given"
* extension contains GOFRMCSDOrganizationHierarchy named gofr-facility-hierarchy 0..* MS
* extension[gofr-facility-hierarchy] MS
* extension[gofr-facility-hierarchy] ^label = "Attach To Hierarchy"
* extension[gofr-facility-hierarchy].extension[hierarchy-type].valueCodeableConcept MS
* extension[gofr-facility-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding 1..1 MS
* extension[gofr-facility-hierarchy].extension[hierarchy-type].valueCodeableConcept ^label = "Parent Type"
* extension[gofr-facility-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding from OrganizationHierarchyTypeValueSet (required)
* extension[gofr-facility-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding ^label = "Parent Type"
* extension[gofr-facility-hierarchy].extension[part-of].valueReference.reference MS
* extension[gofr-facility-hierarchy].extension[part-of].valueReference ^label = "Parent"

Profile:        GofrFacility
Parent:         MCSDFacilityLocation
Id:             gofr-facility
Title:          "GOFR Facility"
Description:    "GOFR Profile of Locations to manage facilities."
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
* identifier ^constraint[0].key = "ihris-search-identifier"
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
* partOf only Reference(GofrJurisdiction)
* partOf ^label = "Parent"

Extension:      RequestAffectedResource
Id:             request-affected-resource
Title:          "Resource changed/added following this request"
Description:    "Resource changed/added following this request"
* ^context.type = #element
* ^context.expression = "GofrFacilityAddRequest"
* value[x] only Reference
* valueReference 1..1 MS
* valueReference ^label = "Affected Resource"
* valueReference only Reference(GofrFacility)
* valueReference.reference 1..1 MS
* valueReference.reference ^label = "Affected Resource"

Extension:      RequestStatus
Id:             request-status
Title:          "Status of a request to add/update facility"
Description:    "Status of a request to add/update facility"
* ^context.type = #element
* ^context.expression = "GofrFacilityAddRequest"
* value[x] only Coding
* valueCoding 1..1 MS
* valueCoding ^label = "Request Status"
* valueCoding from RequestStatusValueSet (required)

CodeSystem:      OrganizationHierarchyTypeCodeSystem
Id:              gofr-organization-hiearchy-type-codesystem
Title:           "Organization Hierarchy Type"
* ^date = "2021-07-17T08:32:04.362Z"
* ^version = "0.1.0"
* #funder "Funder"
* #operational "Operational"

CodeSystem:      RequestStatusCodeSystem
Id:              request-status-codesystem
Title:           "Request Status"
* ^date = "2021-05-24T11:16:04.362Z"
* ^version = "0.1.0"
* #approved "Approved"
* #rejected "Rejected"
* #pending "Pending"

ValueSet:         OrganizationHierarchyTypeValueSet
Id:               gofr-organization-hiearchy-type-valueset
Title:            "Organization Hierarchy Type ValueSet"
* ^date = "2021-07-17T08:32:04.362Z"
* ^version = "0.1.0"
* codes from system OrganizationHierarchyTypeCodeSystem

ValueSet:         RequestStatusValueSet
Id:               request-status-valueset
Title:            "Request Status ValueSet"
* ^date = "2021-05-24T11:16:04.362Z"
* ^version = "0.1.0"
* codes from system RequestStatusCodeSystem

Profile:        GofrFacilityAddRequest
Parent:         GofrFacility
Id:             gofr-facility-add-request
Title:          "GOFR Facility Add Request"
Description:    "GOFR Profile of Locations to manage requests to add new facilities."
* extension contains
  RequestStatus named requestStatus 1..1 MS and
  RequestAffectedResource named requestAffectedResource 0..1 MS
* extension[requestStatus].valueCoding MS
* extension[requestStatus] ^label = "Affected Resource"
* extension[requestAffectedResource].valueReference MS
* extension[requestAffectedResource] ^label = "Affected Resource"

Profile:        GofrFacilityUpdateRequest
Parent:         GofrFacility
Id:             gofr-facility-update-request
Title:          "GOFR Facility Update Request"
Description:    "GOFR Profile of Locations to manage requests to update facilities."
* extension contains
  RequestStatus named requestStatus 1..1 MS and
  RequestAffectedResource named requestAffectedResource 1..1 MS
* extension[requestStatus].valueCoding MS
* extension[requestStatus] ^label = "Affected Resource"
* extension[requestAffectedResource].valueReference MS
* extension[requestAffectedResource] ^label = "Affected Resource"

ValueSet:         GofrJurisdictionType
Id:               gofr-jurisdiction-type
Title:            "GOFR Jurisdiction Type ValueSet"
* ^date = "2020-11-12T08:41:04.362Z"
* ^version = "0.3.0"
* codes from system GofrJurisdictionType

CodeSystem:      GofrJurisdictionType
Id:              gofr-jurisdiction-type
Title:           "Jurisdiction Type(Country/Region/District/County)"
* ^date = "2020-11-12T08:41:04.362Z"
* ^version = "0.3.0"
* #country "Country" "Country"
* #region "Region" "Region"
* #district "District" "District"
* #county "County" "County"

Instance:       gofr-page-facilityorganization
InstanceOf:     IhrisPage
Title:          "GOFR Organization Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/GOFR.IHE.mCSD.FacilityOrganization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[field][0].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][0].extension[path].valueString = "Organization.name"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"
* extension[section][0].extension[field][1].valueString = "Organization.type"
* extension[section][0].extension[field][2].valueString = "Organization.extension:gofr-facility-hierarchy"

Instance:       gofr-page-facility
InstanceOf:     IhrisPage
Title:          "GOFR Facility Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-facility)
* extension[display].extension[search][0].valueString = "Facility Name|name"
* extension[display].extension[search][1].valueString = "Facility Type|type[1].text"
* extension[display].extension[search][2].valueString = "Facility Physical Type|physicalType.text"
* extension[display].extension[search][3].valueString = "Parent|partOf.reference"
* extension[display].extension[search][4].valueString = "Status|status"
* extension[display].extension[search][5].valueString = "Longitute|position.longitude"
* extension[display].extension[search][6].valueString = "Latitude|position.latitude"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://terminology.hl7.org/CodeSystem/v3-RoleCode"
* extension[display].extension[filter][2].valueString = "Physical Type|physicalType|http://hl7.org/fhir/ValueSet/location-physical-type"
* extension[display].extension[field][0].extension[path].valueString = "position.longitude"
* extension[display].extension[field][1].extension[path].valueString = "position.latitude"
* extension[display].extension[field][2].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][2].extension[path].valueString = "Location.physicalType.coding"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.descriptions"
* extension[section][0].extension[field][3].valueString = "Location.status"
* extension[section][0].extension[field][4].valueString = "Location.type"
* extension[section][0].extension[field][5].valueString = "Location.partOf"
* extension[section][0].extension[field][6].valueString = "Location.description"
* extension[section][0].extension[field][7].valueString = "Location.physicalType"
* extension[section][1].extension[title].valueString = "Geo-Coordinates"
* extension[section][1].extension[description].valueString = "Facility Geo-Coordinates"
* extension[section][1].extension[name].valueString = "Geo-Coordinates"
* extension[section][1].extension[field][0].valueString = "Location.position"
* extension[section][2].extension[title].valueString = "Identifiers"
* extension[section][2].extension[description].valueString = "Facility Identifiers"
* extension[section][2].extension[name].valueString = "Identifiers"
* extension[section][2].extension[field][0].valueString = "Location.identifier"
* extension[section][3].extension[title].valueString = "Contact Details"
* extension[section][3].extension[description].valueString = "Address, email, phone numbers"
* extension[section][3].extension[name].valueString = "contact"
* extension[section][3].extension[field][0].valueString = "Location.telecom"
* extension[section][4].extension[title].valueString = "Address"
* extension[section][4].extension[description].valueString = "Facility Address"
* extension[section][4].extension[name].valueString = "Address"
* extension[section][4].extension[field][0].valueString = "Location.address"
* extension[section][5].extension[title].valueString = "Hours of operation"
* extension[section][5].extension[description].valueString = "Business hours"
* extension[section][5].extension[name].valueString = "hoursOfOperation"
* extension[section][5].extension[field][0].valueString = "Location.hoursOfOperation"

* extension[section][6].extension[title].valueString = "Managing Organization"
* extension[section][6].extension[description].valueString = "Organizations Managing This Facility"
* extension[section][6].extension[name].valueString = "Managing Organization"
* extension[section][6].extension[resource].extension[resource].valueReference = Reference(StructureDefinition/gofr-mcsd-organization)
* extension[section][6].extension[resource].extension[searchfield].valueString = "Location:organization"
* extension[section][6].extension[resource].extension[linkfield].valueString = "Organization.id"
* extension[section][6].extension[resource].extension[column][0].extension[header].valueString = "Organization"
* extension[section][6].extension[resource].extension[column][0].extension[field].valueString = "extension.where(url='http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.OrganizationHierarchy').extension.where(url='part-of').valueReference"
* extension[section][6].extension[resource].extension[column][1].extension[header].valueString = "Organization Type"
* extension[section][6].extension[resource].extension[column][1].extension[field].valueString = "extension.where(url='http://gofr.org/fhir/StructureDefinition/GOFR.IHE.mCSD.OrganizationHierarchy').extension.where(url='hierarchy-type').valueCodeableConcept.coding"
* extension[section][6].extension[resource].extension[column][2].extension[header].valueString = "Actions"
* extension[section][6].extension[resource].extension[column][2].extension[field].valueString = "_action"
* extension[section][6].extension[resource].extension[action][0].extension[link].valueString = "/resource/view/facilityorganization/ITEMID"
* extension[section][6].extension[resource].extension[action][0].extension[text].valueString = "Edit"
* extension[section][6].extension[resource].extension[action][0].extension[row].valueBoolean = true
* extension[section][6].extension[resource].extension[action][0].extension[emptyDisplay].valueBoolean = false
* extension[section][6].extension[resource].extension[action][0].extension[class].valueString = "secondary"

Instance:       gofr-page-facility-add-request
InstanceOf:     IhrisPage
Title:          "GOFR Request Add Facility Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-facility-add-request)
* extension[display].extension[requestUpdatingResource].valueReference = Reference(StructureDefinition/gofr-facility)
* extension[display].extension[search][0].valueString = "Facility Name|name"
* extension[display].extension[search][1].valueString = "Facility Type|type[1].text"
* extension[display].extension[search][2].valueString = "Facility Physical Type|physicalType.text"
* extension[display].extension[search][3].valueString = "Parent|partOf.reference"
* extension[display].extension[search][4].valueString = "Status|status"
* extension[display].extension[search][5].valueString = "Longitute|position.longitude"
* extension[display].extension[search][6].valueString = "Latitude|position.latitude"
* extension[display].extension[search][7].valueString = "Request Status|extension.where(url='http://gofr.org/fhir/StructureDefinition/request-status').valueCoding.display"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://terminology.hl7.org/CodeSystem/v3-RoleCode"
* extension[display].extension[filter][2].valueString = "Physical Type|physicalType|http://hl7.org/fhir/ValueSet/location-physical-type"
* extension[display].extension[filter][3].valueString = "Request Status|requeststatus|request-status-valueset"
* extension[display].extension[field][0].extension[path].valueString = "position.longitude"
* extension[display].extension[field][1].extension[path].valueString = "position.latitude"
* extension[display].extension[field][2].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][2].extension[path].valueString = "Location.physicalType.coding"
* extension[display].extension[field][3].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][3].extension[path].valueString = "Location.extension:requestStatus"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.descriptions"
* extension[section][0].extension[field][3].valueString = "Location.status"
* extension[section][0].extension[field][4].valueString = "Location.type"
* extension[section][0].extension[field][5].valueString = "Location.partOf"
* extension[section][0].extension[field][6].valueString = "Location.description"
* extension[section][0].extension[field][7].valueString = "Location.physicalType"
* extension[section][0].extension[field][8].valueString = "Location.extension:requestStatus"
* extension[section][1].extension[title].valueString = "Geo-Coordinates"
* extension[section][1].extension[description].valueString = "Facility Geo-Coordinates"
* extension[section][1].extension[name].valueString = "Geo-Coordinates"
* extension[section][1].extension[field][0].valueString = "Location.position"
* extension[section][2].extension[title].valueString = "Identifiers"
* extension[section][2].extension[description].valueString = "Facility Identifiers"
* extension[section][2].extension[name].valueString = "Identifiers"
* extension[section][2].extension[field][0].valueString = "Location.identifier"
* extension[section][3].extension[title].valueString = "Address"
* extension[section][3].extension[description].valueString = "Facility Address"
* extension[section][3].extension[name].valueString = "Address"
* extension[section][3].extension[field][0].valueString = "Location.address"

Instance:       gofr-page-facility-update-request
InstanceOf:     IhrisPage
Title:          "GOFR Request Update Facility Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-facility-update-request)
* extension[display].extension[search][0].valueString = "Facility Name|name"
* extension[display].extension[search][1].valueString = "Facility Type|type[1].text"
* extension[display].extension[search][2].valueString = "Facility Physical Type|physicalType.text"
* extension[display].extension[search][3].valueString = "Parent|partOf.reference"
* extension[display].extension[search][4].valueString = "Status|status"
* extension[display].extension[search][5].valueString = "Longitute|position.longitude"
* extension[display].extension[search][6].valueString = "Latitude|position.latitude"
* extension[display].extension[search][7].valueString = "Request Status|extension.where(url='http://gofr.org/fhir/StructureDefinition/request-status').valueCoding.display"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://terminology.hl7.org/CodeSystem/v3-RoleCode"
* extension[display].extension[filter][2].valueString = "Physical Type|physicalType|http://hl7.org/fhir/ValueSet/location-physical-type"
* extension[display].extension[filter][3].valueString = "Request Status|requeststatus|request-status-valueset"
* extension[display].extension[field][0].extension[path].valueString = "position.longitude"
* extension[display].extension[field][1].extension[path].valueString = "position.latitude"
* extension[display].extension[field][2].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][2].extension[path].valueString = "Location.physicalType.coding"
* extension[display].extension[field][3].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][3].extension[path].valueString = "Location.extension:requestStatus"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.descriptions"
* extension[section][0].extension[field][3].valueString = "Location.status"
* extension[section][0].extension[field][4].valueString = "Location.type"
* extension[section][0].extension[field][5].valueString = "Location.partOf"
* extension[section][0].extension[field][6].valueString = "Location.description"
* extension[section][0].extension[field][7].valueString = "Location.physicalType"
* extension[section][0].extension[field][8].valueString = "Location.extension:requestStatus"
* extension[section][1].extension[title].valueString = "Geo-Coordinates"
* extension[section][1].extension[description].valueString = "Facility Geo-Coordinates"
* extension[section][1].extension[name].valueString = "Geo-Coordinates"
* extension[section][1].extension[field][0].valueString = "Location.position"
* extension[section][2].extension[title].valueString = "Identifiers"
* extension[section][2].extension[description].valueString = "Facility Identifiers"
* extension[section][2].extension[name].valueString = "Identifiers"
* extension[section][2].extension[field][0].valueString = "Location.identifier"
* extension[section][3].extension[title].valueString = "Address"
* extension[section][3].extension[description].valueString = "Facility Address"
* extension[section][3].extension[name].valueString = "Address"
* extension[section][3].extension[field][0].valueString = "Location.address"

Instance:       gofr-request-status
InstanceOf:     SearchParameter
Title:          "Search for the request status of a request to add/update facilities"
Usage:          #definition
* url = "http://gofr.org/fhir/StructureDefinition/search-parameter-request-status"
* name = "Search for the request status of a request to add/update facilities"
* description = "Search for the request status of a request to add/update facilities"
* status = #active
* experimental = false
* code = #requeststatus
* base[0] = #Location
* type = #token
* expression = "Location.extension('http://gofr.org/fhir/StructureDefinition/request-status').valueCoding"
* target[0] = #Location

Instance:       gofr-page-jurisdiction
InstanceOf:     IhrisPage
Title:          "GOFR Jurisdiction Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-jurisdiction)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[search][1].valueString = "Type|type.coding.code"
* extension[display].extension[search][2].valueString = "Physical Type|physicalType.text"
* extension[display].extension[search][3].valueString = "Jurisdiction|partOf.reference"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://gofr.org/fhir/ValueSet/gofr-jurisdiction-type"
* extension[display].extension[filter][2].valueString = "Jurisdiction|partOf"
* extension[section][0].extension[title].valueString = "Details"
* extension[section][0].extension[description].valueString = "Jurisdiction details"
* extension[section][0].extension[name].valueString = "Geographical Location"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.type"
* extension[section][0].extension[field][3].valueString = "Location.partOf"
* extension[section][0].extension[field][4].valueString = "Location.status"

Instance:       gofr-page-service
InstanceOf:     IhrisPage
Title:          "GOFR Facility Service Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-facility-service)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[search][1].valueString = "Active|active"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Active|active"
* extension[section][0].extension[title].valueString = "Details"
* extension[section][0].extension[description].valueString = "Healthcare service details"
* extension[section][0].extension[name].valueString = "Healthcare service"
* extension[section][0].extension[field][0].valueString = "HealthcareService.name"
* extension[section][0].extension[field][1].valueString = "HealthcareService.comment"
* extension[section][0].extension[field][2].valueString = "HealthcareService.identifier"
* extension[section][0].extension[field][3].valueString = "HealthcareService.telecom"
* extension[section][0].extension[field][4].valueString = "HealthcareService.type"
* extension[section][0].extension[field][5].valueString = "HealthcareService.category"
* extension[section][0].extension[field][6].valueString = "HealthcareService.specialty"
* extension[section][0].extension[field][7].valueString = "HealthcareService.referralMethod"
* extension[section][0].extension[field][8].valueString = "HealthcareService.communication"
* extension[section][0].extension[field][9].valueString = "HealthcareService.program"
* extension[section][0].extension[field][10].valueString = "HealthcareService.eligibility"
* extension[section][0].extension[field][11].valueString = "HealthcareService.serviceProvisionCode"
* extension[section][0].extension[field][12].valueString = "HealthcareService.availableTime"
* extension[section][0].extension[field][13].valueString = "HealthcareService.notAvailable"
* extension[section][0].extension[field][14].valueString = "HealthcareService.appointmentRequired"
* extension[section][0].extension[field][15].valueString = "HealthcareService.active"
* extension[section][1].extension[title].valueString = "Facilities Service Is Offered"
* extension[section][1].extension[description].valueString = "Facilities Service Is Offered"
* extension[section][1].extension[name].valueString = "Facilities Service Is Offered"
* extension[section][1].extension[field][0].valueString = "HealthcareService.location"