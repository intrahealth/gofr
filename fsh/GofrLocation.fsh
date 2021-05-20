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

Profile:        GofrFacility
Parent:         Location
Id:             gofr-facility
Title:          "GOFR Facility"
Description:    "GOFR Profile of Locations to manage facilities."
* name 1..1 MS
* name ^label = "Name"
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
* type 1..* MS
* type ^label = "Facilty Service Type"
* type.coding 1..1 MS
* type.coding ^label = "Facilty Service Type"
* physicalType 1..1 MS
* physicalType ^label = "Facilty Physical Type"
* position 0..1 MS
* position ^label = "Co-ordinates"
* position.latitude MS
* position.latitude ^label = "Latitude"
* position.longitude MS
* position.longitude ^label = "Longitude"
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
* partOf 1..1 MS
* partOf only Reference(GofrJurisdiction)
* partOf ^label = "Parent"

Profile:        GofrFacilityService
Parent:         HealthcareService
Id:             gofr-facility-service
Title:          "GOFR Facility Service"
Description:    "GOFR Profile of facilities service."
* name 1..1 MS
* name ^label = "Name"
* comment 0..1 MS
* comment ^label = "Comment about this service"
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
* telecom 0..* MS
* telecom ^label = "Telecom"
* telecom.system MS
* telecom.system ^label = "Contact Type"
* telecom.use MS
* telecom.use ^label = "Use"
* telecom.value MS
* telecom.value ^label = "Value"
* type 0..* MS
* type ^label = "Type of Service"
* type.coding 1..1 MS
* type.coding ^label = "Type of Service"
* type.coding from ServiceType (required)
* category 0..* MS
* category ^label = "Broad Category of Service"
* category.coding 1..1 MS
* category.coding ^label = "Broad Category of Service"
* category.coding from ServiceCategory (required)
* referralMethod 0..* MS
* referralMethod ^label = "Referral Methods"
* referralMethod.coding 1..1 MS
* referralMethod.coding ^label = "Referral Methods"
* referralMethod.coding from ReferralMethod (required)
* specialty 0..* MS
* specialty ^label = "Specialty"
* specialty.coding 1..1 MS
* specialty.coding ^label = "Specialty"
* specialty.coding from PracticeSettingCodeValueSet (required)
* eligibility 0..* MS
* eligibility ^label = "Eligibility"
* eligibility.code 1..1 MS
* eligibility.code ^label = "Eligibility"
* eligibility.code.coding 1..1 MS
* eligibility.code.coding ^label = "Eligibility"
* eligibility.code.coding from SNOMEDCTClinicalFindings (required)
* communication 0..* MS
* communication ^label = "Communication Language"
* communication.coding 1..1 MS
* communication.coding ^label = "Communication Language"
* communication.coding from CommonLanguages (required)
* program 0..* MS
* program ^label = "Programs"
* program.coding 1..1 MS
* program.coding ^label = "Programs"
* program.coding from Program (required)
* serviceProvisionCode 0..* MS
* serviceProvisionCode ^label = "Service Provision Condition"
* serviceProvisionCode.coding 1..1 MS
* serviceProvisionCode.coding ^label = "Service Provision Condition"
* serviceProvisionCode.coding from ServiceProvisionConditions (required)
* availableTime 0..* MS
* availableTime ^label = "Service Time Availability"
* availableTime.daysOfWeek MS
* availableTime.daysOfWeek ^label = "Days of week"
* availableTime.allDay MS
* availableTime.allDay ^label = "Available all day"
* availableTime.availableStartTime MS
* availableTime.availableStartTime ^label = "Opening Time"
* availableTime.availableEndTime MS
* availableTime.availableEndTime ^label = "Closing Time"
* notAvailable 0..* MS
* notAvailable ^label = "Service Unavailability"
* notAvailable.description 1..1 MS
* notAvailable.description ^label = "Description"
* notAvailable.during 1..1 MS
* notAvailable.during ^label = "Dates Unavailable"
* notAvailable.during.start 1..1 MS
* notAvailable.during.start ^label = "Start Date"
* notAvailable.during.end 1..1 MS
* notAvailable.during.end ^label = "End Date"
* appointmentRequired 0..1 MS
* appointmentRequired ^label = "Appointment Required"
* active 0..1 MS
* active ^label = "Active"

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

Instance:       gofr-page-facility
InstanceOf:     IhrisPage
Title:          "GOFR Facility Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/Practitioner)
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
* extension[section][0].extension[title].valueString = "Facility"
* extension[section][0].extension[description].valueString = "Facility details"
* extension[section][0].extension[name].valueString = "Facility"
* extension[section][0].extension[field][0].valueString = "Location.name"

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
* extension[display].extension[filter][1].valueString = "Type|type|http://ihris.org/fhir/ValueSet/gofr-jurisdiction-type"
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
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[section][0].extension[title].valueString = "Details"
* extension[section][0].extension[description].valueString = "Healthcare service details"
* extension[section][0].extension[name].valueString = "Healthcare service"
* extension[section][0].extension[field][0].valueString = "HealthcareService.name"
* extension[section][0].extension[field][1].valueString = "HealthcareService.comment"
* extension[section][0].extension[field][2].valueString = "HealthcareService.identifier"
* extension[section][0].extension[field][3].valueString = "HealthcareService.telecom"
* extension[section][0].extension[field][4].valueString = "HealthcareService.type"