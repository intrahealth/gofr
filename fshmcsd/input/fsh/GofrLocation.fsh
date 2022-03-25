Profile:      MCSDJurisdictionOrganization
Parent:       MCSDOrganization
Id:           IHE.mCSD.JurisdictionOrganization
Title:        "mCSD Organization for Jurisdictions"
Description:  "A profile on the mCSD Organization for mCSD Jurisdictions"

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization"
* type 2..*
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Jurisdiction 1..1
* type[Jurisdiction].coding 1..1
* type[Jurisdiction].coding.system = "urn:ietf:rfc:3986"
* type[Jurisdiction].coding.code = #urn:ihe:iti:mcsd:2019:jurisdiction
* name 1..1 MS
* name ^label = "Name"

Profile:      MCSDJurisdictionLocation
Parent:       MCSDLocation
Id:           IHE.mCSD.JurisdictionLocation
Title:        "Jurisdictions"
Description:  "A profile on the mCSD Location for mCSD Jurisdictions"

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation"
* type 2..* MS
* type ^label = "Location Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from GofrJurisdictionType (required)
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Jurisdiction 1..1
* type[Jurisdiction].coding 1..1
* type[Jurisdiction].coding.system = "urn:ietf:rfc:3986"
* type[Jurisdiction].coding.code = #urn:ihe:iti:mcsd:2019:jurisdiction
* name 1..1 MS
* name ^label = "Name"
* alias 0..* MS
* alias ^label = "Nickname"
* status 1..1 MS
* status ^label = "Status"
* partOf 0..1 MS
* partOf only Reference(MCSDJurisdictionLocation)
* partOf ^label = "Parent"
* position 0..1 MS
* position ^label = "Co-ordinates"
* position.latitude MS
* position.latitude ^label = "Latitude"
* position.longitude MS
* position.longitude ^label = "Longitude"
* managingOrganization 1..1 MS
* managingOrganization only Reference(MCSDJurisdictionOrganization)
* extension contains http://hl7.org/fhir/StructureDefinition/location-boundary-geojson named boundary 0..* MS
* extension[boundary] MS
* extension[boundary].valueAttachment 1..1 MS
* extension[boundary].valueAttachment.contentType = #application/geo+json
* extension[boundary].valueAttachment.data 1..1 MS

Profile:      MCSDFacilityOrganization
Parent:       MCSDOrganization
Id:           IHE.mCSD.FacilityOrganization
Title:        "mCSD Organization for Facilities"
Description:  "A profile on the mCSD Organization profile for mCSD Facilities."

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization"
* name 1..1 MS
* name ^label = "Name"
* type 2..* MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from 	http://gofr.org/fhir/ValueSet/gofr-location-type-valueset
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

Profile:      MCSDFacilityLocation
Parent:       MCSDLocation
Id:           IHE.mCSD.FacilityLocation
Title:        "Facilities"
Description:  "A profile on the mCSD Location profile for mCSD Facilities."

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation"

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

Extension:      RequestAffectedResource
Id:             request-affected-resource
Title:          "Resource changed/added following this request"
Description:    "Resource changed/added following this request"
* ^context.type = #element
* ^context.expression = "GofrFacilityAddRequest"
* value[x] only Reference
* valueReference 1..1 MS
* valueReference ^label = "Affected Resource"
* valueReference only Reference(MCSDFacilityLocation)
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

CodeSystem:      McsdLocationTypeCodeSystem
Id:              urn-ietf-rfc-398
Title:           "mCSD Location Type"

* ^url = "urn:ietf:rfc:398"
* ^date = "2021-09-30T10:06:04.362Z"
* ^version = "0.1.0"
* #urn:ihe:iti:mcsd:2019:facility "Facility"
* #urn:ihe:iti:mcsd:2019:jurisdiction "Jurisdiction"

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
* ^version = "0.1.0"ServiceDeliveryLocationRoleType
* #approved "Approved"
* #rejected "Rejected"
* #pending "Pending"

ValueSet:         McsdLocationTypeValueSet
Id:               gofr-location-type-valueset
Title:            "Location Type ValueSet"
* ^date = "2021-09-30T10:06:04.362Z"
* ^version = "0.1.0"
* include codes from system McsdLocationTypeCodeSystem
* include codes from system http://terminology.hl7.org/CodeSystem/v3-RoleCode

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
Parent:         MCSDFacilityLocation
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
Parent:         MCSDFacilityLocation
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
* include codes from system McsdLocationTypeCodeSystem

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
InstanceOf:     GofrPage
Title:          "GOFR Organization Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Update Organization"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.FacilityOrganization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[field][0].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][0].extension[path].valueString = "Organization.name"
* extension[display].extension[field][1].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][1].extension[path].valueString = "Organization.type.where(system='urn:ietf:rfc:3986')"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"
* extension[section][0].extension[field][1].valueString = "Organization.type"
* extension[section][0].extension[field][2].valueString = "Organization.extension:hierarchy"

Instance:       gofr-page-jurisdictionorganization
InstanceOf:     GofrPage
Title:          "GOFR Organization Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Update Organization"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.JurisdictionOrganization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[field][0].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][0].extension[path].valueString = "Organization.name"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"
* extension[section][0].extension[field][1].valueString = "Organization.type"
* extension[section][0].extension[field][2].valueString = "Organization.extension:hierarchy"

Instance:       gofr-page-facility
InstanceOf:     GofrPage
Title:          "GOFR Facility Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Create Change Request"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.FacilityLocation)
* extension[display].extension[search][0].valueString = "Facility Name|name"
* extension[display].extension[search][1].valueString = "Facility Type|type[0].text"
* extension[display].extension[search][2].valueString = "Location|partOf.reference"
* extension[display].extension[search][3].valueString = "Status|status"
* extension[display].extension[search][4].valueString = "Longitute|position.longitude"
* extension[display].extension[search][5].valueString = "Latitude|position.latitude"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://terminology.hl7.org/CodeSystem/v3-RoleCode"
* extension[display].extension[filter][2].valueString = "Physical Type|physicalType|http://hl7.org/fhir/ValueSet/location-physical-type"
* extension[display].extension[field][0].extension[path].valueString = "position.longitude"
* extension[display].extension[field][1].extension[path].valueString = "position.latitude"
* extension[display].extension[field][2].extension[readOnlyIfSet].valueBoolean = true
* extension[display].extension[field][2].extension[path].valueString = "Location.managingOrganization"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.status"
* extension[section][0].extension[field][3].valueString = "Location.type"
* extension[section][0].extension[field][4].valueString = "Location.partOf"
* extension[section][0].extension[field][5].valueString = "Location.description"
* extension[section][0].extension[field][6].valueString = "Location.physicalType"
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
* extension[section][6].extension[resource].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.Organization)
* extension[section][6].extension[resource].extension[searchfield].valueString = "Location:organization"
* extension[section][6].extension[resource].extension[linkfield].valueString = "Organization.id"
* extension[section][6].extension[resource].extension[column][0].extension[header].valueString = "Organization"
* extension[section][6].extension[resource].extension[column][0].extension[field].valueString = "extension.where(url='http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension').extension.where(url='part-of').valueReference"
* extension[section][6].extension[resource].extension[column][1].extension[header].valueString = "Organization Type"
* extension[section][6].extension[resource].extension[column][1].extension[field].valueString = "extension.where(url='http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension').extension.where(url='hierarchy-type').valueCodeableConcept.coding"
* extension[section][6].extension[resource].extension[column][2].extension[header].valueString = "Actions"
* extension[section][6].extension[resource].extension[column][2].extension[field].valueString = "_action"
* extension[section][6].extension[resource].extension[action][0].extension[link].valueString = "/resource/view/facilityorganization/ITEMID"
* extension[section][6].extension[resource].extension[action][0].extension[text].valueString = "Edit"
* extension[section][6].extension[resource].extension[action][0].extension[row].valueBoolean = true
* extension[section][6].extension[resource].extension[action][0].extension[emptyDisplay].valueBoolean = false
* extension[section][6].extension[resource].extension[action][0].extension[class].valueString = "secondary"

Instance:       gofr-page-facility-add-request
InstanceOf:     GofrPage
Title:          "GOFR Request Add Facility Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Request Adding Facility"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-facility-add-request)
* extension[display].extension[requestUpdatingResource].valueReference = Reference(StructureDefinition/IHE.mCSD.FacilityLocation)
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
InstanceOf:     GofrPage
Title:          "GOFR Request Update Facility Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Request Updating Facility"
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
InstanceOf:     GofrPage
Title:          "GOFR Jurisdiction Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Update Jurisdiction"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.JurisdictionLocation)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[search][1].valueString = "Type|type.coding.display"
* extension[display].extension[search][2].valueString = "Physical Type|physicalType.text"
* extension[display].extension[search][3].valueString = "Parent|partOf.reference"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[display].extension[filter][1].valueString = "Type|type|http://gofr.org/fhir/ValueSet/gofr-jurisdiction-type"
* extension[display].extension[filter][2].valueString = "Parent|partOf"
* extension[section][0].extension[title].valueString = "Details"
* extension[section][0].extension[description].valueString = "Jurisdiction details"
* extension[section][0].extension[name].valueString = "Geographical Location"
* extension[section][0].extension[field][0].valueString = "Location.name"
* extension[section][0].extension[field][1].valueString = "Location.alias"
* extension[section][0].extension[field][2].valueString = "Location.type"
* extension[section][0].extension[field][3].valueString = "Location.partOf"
* extension[section][0].extension[field][4].valueString = "Location.status"

* extension[section][1].extension[title].valueString = "Managing Organization"
* extension[section][1].extension[description].valueString = "Organizations Managing This Jurisdiction"
* extension[section][1].extension[name].valueString = "Managing Organization"
* extension[section][1].extension[resource].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.Organization)
* extension[section][1].extension[resource].extension[searchfield].valueString = "Location:organization"
* extension[section][1].extension[resource].extension[linkfield].valueString = "Organization.id"
* extension[section][1].extension[resource].extension[column][0].extension[header].valueString = "Organization"
* extension[section][1].extension[resource].extension[column][0].extension[field].valueString = "extension.where(url='http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension').extension.where(url='part-of').valueReference"
* extension[section][1].extension[resource].extension[column][1].extension[header].valueString = "Organization Type"
* extension[section][1].extension[resource].extension[column][1].extension[field].valueString = "extension.where(url='http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension').extension.where(url='hierarchy-type').valueCodeableConcept.coding"
* extension[section][1].extension[resource].extension[column][2].extension[header].valueString = "Actions"
* extension[section][1].extension[resource].extension[column][2].extension[field].valueString = "_action"
* extension[section][1].extension[resource].extension[action][0].extension[link].valueString = "/resource/view/jurisdictionorganization/ITEMID"
* extension[section][1].extension[resource].extension[action][0].extension[text].valueString = "Edit"
* extension[section][1].extension[resource].extension[action][0].extension[row].valueBoolean = true
* extension[section][1].extension[resource].extension[action][0].extension[emptyDisplay].valueBoolean = false
* extension[section][1].extension[resource].extension[action][0].extension[class].valueString = "secondary"

* extension[section][2].extension[title].valueString = "Geo-Coordinates"
* extension[section][2].extension[description].valueString = "Facility Geo-Coordinates"
* extension[section][2].extension[name].valueString = "Geo-Coordinates"
* extension[section][2].extension[field][0].valueString = "Location.position"