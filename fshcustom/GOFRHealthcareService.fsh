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
* location 1..* MS
* location only Reference(GofrFacility)
* location ^label = "Facility Service Is Provided"

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