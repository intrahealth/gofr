Instance:       GofrFacilityQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "Add Facility"
* description = "GOFR Facility initial data entry questionnaire."
* id = "gofr-facility-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-questionnaire"
* name = "gofr-facility-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

* item[0].linkId = "Location"
* item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.name"
* item[0].item[0].text = "Facility Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Location.alias"
* item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.alias"
* item[0].item[1].text = "Alternative/Nick Names"
* item[0].item[1].type = #string
* item[0].item[1].required = false
* item[0].item[1].repeats = true

* item[0].item[2].linkId = "Location.description"
* item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.description"
* item[0].item[2].text = "Description"
* item[0].item[2].type = #text
* item[0].item[2].required = false
* item[0].item[2].repeats = false

* item[0].item[3].linkId = "Location.status"
* item[0].item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.status"
* item[0].item[3].text = "Status"
* item[0].item[3].type = #choice
* item[0].item[3].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[0].item[3].repeats = false
* item[0].item[3].required = true

* item[0].item[4].linkId = "Location.type[0]"
* item[0].item[4].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.type"
* item[0].item[4].text = "Facility Types"
* item[0].item[4].type = #choice
* item[0].item[4].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-location-type-valueset"
* item[0].item[4].repeats = true
* item[0].item[4].required = true

* item[0].item[5].linkId = "Location.type[1]"
* item[0].item[5].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.type"
* item[0].item[5].text = "Facility Types"
* item[0].item[5].type = #choice
* item[0].item[5].repeats = false
* item[0].item[5].readOnly = true
* item[0].item[5].required = true
* item[0].item[5].answerOption.valueCoding = urn:ietf:rfc:3986#urn:ihe:iti:mcsd:2019:facility
* item[0].item[5].answerOption.initialSelected = true

* item[0].item[6].linkId = "Location.physicalType"
* item[0].item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.physicalType"
* item[0].item[6].text = "Physical Type"
* item[0].item[6].type = #choice
* item[0].item[6].required = true
* item[0].item[6].repeats = false
* item[0].item[6].readOnly = true
* item[0].item[6].answerOption.valueCoding = http://terminology.hl7.org/CodeSystem/location-physical-type#bu
* item[0].item[6].answerOption.initialSelected = true

* item[0].item[7].linkId = "Location.partOf#tree"
* item[0].item[7].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.partOf"
* item[0].item[7].text = "Parent"
* item[0].item[7].type = #reference
* item[0].item[7].repeats = false
* item[0].item[7].required = false

* item[0].item[8].linkId = "Location.managingOrganization"
* item[0].item[8].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.managingOrganization"
* item[0].item[8].text = "Managing Organization"
* item[0].item[8].type = #string
* item[0].item[8].required = true
* item[0].item[8].repeats = false
* item[0].item[8].readOnly = true
* item[0].item[8].answerOption.valueString = "__REPLACE__Organization.id"
* item[0].item[8].answerOption.initialSelected = true

* item[1].linkId = "Location.identifier"
* item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.identifier"
* item[1].text = "Identifiers|Identifiers for the facility"
* item[1].type = #group

* item[1].item[0].linkId = "Location.identifier[0]"
* item[1].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.identifier"
* item[1].item[0].text = "Identifier"
* item[1].item[0].type = #group
* item[1].item[0].repeats = true
* item[1].item[0].required = false

* item[1].item[0].item[0].linkId = "Location.identifier[0].system"
* item[1].item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.identifier.system"
* item[1].item[0].item[0].text = "System"
* item[1].item[0].item[0].type = #string
* item[1].item[0].item[0].repeats = false
* item[1].item[0].item[0].required = false

* item[1].item[0].item[1].linkId = "Location.identifier[0].value"
* item[1].item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.identifier.value"
* item[1].item[0].item[1].text = "ID Number"
* item[1].item[0].item[1].type = #string
* item[1].item[0].item[1].repeats = false
* item[1].item[0].item[1].required = false

* item[1].item[0].item[2].linkId = "Location.identifier[0].type"
* item[1].item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.identifier.type"
* item[1].item[0].item[2].text = "ID Type"
* item[1].item[0].item[2].type = #choice
* item[1].item[0].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[1].item[0].item[2].repeats = false
* item[1].item[0].item[2].required = false

* item[2].linkId = "Location.position"
* item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.position"
* item[2].text = "Geo-Coordinates|Geo-coordinates for the facility"
* item[2].type = #group

* item[2].item[0].linkId = "Location.position.longitude"
* item[2].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.position.longitude"
* item[2].item[0].text = "Longitude"
* item[2].item[0].type = #string
* item[2].item[0].repeats = false
* item[2].item[0].required = false

* item[2].item[1].linkId = "Location.position.latitude"
* item[2].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.position.latitude"
* item[2].item[1].text = "Latitude"
* item[2].item[1].type = #string
* item[2].item[1].repeats = false
* item[2].item[1].required = false

* item[2].item[2].linkId = "Location.position.altitude"
* item[2].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.position.altitude"
* item[2].item[2].text = "Altitude"
* item[2].item[2].type = #string
* item[2].item[2].repeats = false
* item[2].item[2].required = false

* item[3].linkId = "Location.telecom"
* item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.telecom"
* item[3].text = "Contacts|Contacts for the facility"
* item[3].type = #group

* item[3].item[0].linkId = "Location.telecom[0]"
* item[3].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.telecom"
* item[3].item[0].text = "Office Contacts"
* item[3].item[0].type = #group
* item[3].item[0].repeats = true
* item[3].item[0].required = false

* item[3].item[0].item[0].linkId = "Location.telecom[0].system"
* item[3].item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.telecom.system"
* item[3].item[0].item[0].text = "Contact Type"
* item[3].item[0].item[0].type = #choice
* item[3].item[0].item[0].answerValueSet = "http://hl7.org/fhir/contact-point-system"
* item[3].item[0].item[0].required = true
* item[3].item[0].item[0].repeats = false

* item[3].item[0].item[1].linkId = "Location.telecom[0].value"
* item[3].item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.telecom.value"
* item[3].item[0].item[1].text = "Value"
* item[3].item[0].item[1].type = #string
* item[3].item[0].item[1].required = true
* item[3].item[0].item[1].repeats = false

* item[3].item[0].item[2].linkId = "Location.telecom[0].use"
* item[3].item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.telecom.use"
* item[3].item[0].item[2].text = "Contact Use"
* item[3].item[0].item[2].type = #choice
* item[3].item[0].item[2].required = true
* item[3].item[0].item[2].repeats = false
* item[3].item[0].item[2].readOnly = true
* item[3].item[0].item[2].answerOption.valueCoding = http://hl7.org/fhir/address-use#work
* item[3].item[0].item[2].answerOption.initialSelected = true

* item[4].linkId = "Location.address"
* item[4].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address"
* item[4].text = "Address"
* item[4].type = #group
* item[4].repeats = false

* item[4].item[0].linkId = "Location.address.use"
* item[4].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.use"
* item[4].item[0].text = "Address Use"
* item[4].item[0].type = #choice
* item[4].item[0].required = false
* item[4].item[0].repeats = false
* item[4].item[0].readOnly = false
* item[4].item[0].answerValueSet = "http://hl7.org/fhir/address-use"

* item[4].item[1].linkId = "Location.address.type"
* item[4].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.type"
* item[4].item[1].text = "Address Type"
* item[4].item[1].type = #choice
* item[4].item[1].answerValueSet = "http://hl7.org/fhir/address-type"
* item[4].item[1].required = false
* item[4].item[1].repeats = false

* item[4].item[2].linkId = "Location.address.line"
* item[4].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.line"
* item[4].item[2].text = "Street Address"
* item[4].item[2].type = #string
* item[4].item[2].required = false
* item[4].item[2].repeats = false

* item[4].item[3].linkId = "Location.address.city"
* item[4].item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.city"
* item[4].item[3].text = "City"
* item[4].item[3].type = #string
* item[4].item[3].required = false
* item[4].item[3].repeats = false

* item[4].item[4].linkId = "Location.address.district"
* item[4].item[4].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.district"
* item[4].item[4].text = "District"
* item[4].item[4].type = #string
* item[4].item[4].required = false
* item[4].item[4].repeats = false

* item[4].item[5].linkId = "Location.address.state"
* item[4].item[5].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.state"
* item[4].item[5].text = "State"
* item[4].item[5].type = #string
* item[4].item[5].required = false
* item[4].item[5].repeats = false

* item[4].item[6].linkId = "Location.address.postalCode"
* item[4].item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.postalCode"
* item[4].item[6].text = "Postal Code"
* item[4].item[6].type = #string
* item[4].item[6].required = false
* item[4].item[6].repeats = false

* item[4].item[7].linkId = "Location.address.country"
* item[4].item[7].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.address.country"
* item[4].item[7].text = "Country"
* item[4].item[7].type = #string
* item[4].item[7].required = false
* item[4].item[7].repeats = false

* item[5].linkId = "Location.hoursOfOperation"
* item[5].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation"
* item[5].text = "Hours of operation|Facility availability"
* item[5].type = #group

* item[5].item[0].linkId = "Location.hoursOfOperation[0]"
* item[5].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation"
* item[5].item[0].text = "Availability"
* item[5].item[0].type = #group
* item[5].item[0].repeats = true
* item[5].item[0].required = false

* item[5].item[0].item[0].linkId = "Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].text = "Days of week"
* item[5].item[0].item[0].type = #choice
* item[5].item[0].item[0].answerValueSet = "http://hl7.org/fhir/ValueSet/days-of-week"
* item[5].item[0].item[0].required = true
* item[5].item[0].item[0].repeats = true

* item[5].item[0].item[1].linkId = "Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].text = "All day"
* item[5].item[0].item[1].type = #boolean
* item[5].item[0].item[1].required = false
* item[5].item[0].item[1].repeats = false

* item[5].item[0].item[2].linkId = "Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].text = "Opening time"
* item[5].item[0].item[2].type = #time
* item[5].item[0].item[2].required = false
* item[5].item[0].item[2].repeats = false

* item[5].item[0].item[3].linkId = "Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].text = "Closing time"
* item[5].item[0].item[3].type = #time
* item[5].item[0].item[3].required = false
* item[5].item[0].item[3].repeats = false

// * item[6].linkId = "HealthcareService"
// * item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.HealthcareService"
// * item[6].text = "Services Offered"
// * item[6].type = #group

// * item[6].item[0].linkId = "HealthcareService.location"
// * item[6].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.HealthcareService#HealthcareService.location"
// * item[6].item[0].text = "HealthcareService"
// * item[6].item[0].type = #string
// * item[6].item[0].required = true
// * item[6].item[0].repeats = true
// * item[6].item[0].readOnly = true
// * item[6].item[0].answerOption.valueString = "__REPLACE__Location"
// * item[6].item[0].answerOption.initialSelected = true

* item[6].linkId = "Organization"
* item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization"
* item[6].text = "Organization"
* item[6].type = #group

* item[6].item[0].linkId = "Organization.name"
* item[6].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.name"
* item[6].item[0].text = "Organization Names"
* item[6].item[0].type = #string
* item[6].item[0].repeats = false
* item[6].item[0].required = true
* item[6].item[0].readOnly = true
* item[6].item[0].answerOption.valueString = "__REPLACE__Location.name"
* item[6].item[0].answerOption.initialSelected = true

* item[6].item[1].linkId = "Organization.type"
* item[6].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.type"
* item[6].item[1].text = "Organization Type"
* item[6].item[1].type = #string
* item[6].item[1].repeats = false
* item[6].item[1].required = true
* item[6].item[1].readOnly = true
* item[6].item[1].answerOption.valueString = "__REPLACE__Location.type"
* item[6].item[1].answerOption.initialSelected = true

* item[6].item[2].linkId = "Organization.extension[0]"
* item[6].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.extension:hierarchy"
* item[6].item[2].text = "Managing Organization"
* item[6].item[2].type = #group
* item[6].item[2].repeats = true

* item[6].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[6].item[2].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.extension:hierarchy.extension:part-of.value[x]:valueReference"
* item[6].item[2].item[0].text = "Organization"
* item[6].item[2].item[0].type = #reference
* item[6].item[2].item[0].repeats = false
* item[6].item[2].item[0].required = true

* item[6].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[6].item[2].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.extension:hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[6].item[2].item[1].text = "Type"
* item[6].item[2].item[1].type = #choice
* item[6].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[6].item[2].item[1].repeats = false
* item[6].item[2].item[1].required = false

* item[3].item[1].linkId = "Organization.contact[0]"
* item[3].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact"
* item[3].item[1].text = "Contact Person"
* item[3].item[1].type = #group
* item[3].item[1].repeats = true
* item[3].item[1].required = false

* item[3].item[1].item[0].linkId = "Organization.contact[0].purpose"
* item[3].item[1].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.purpose"
* item[3].item[1].item[0].text = "Purpose"
* item[3].item[1].item[0].type = #choice
* item[3].item[1].item[0].answerValueSet = "http://terminology.hl7.org/CodeSystem/contactentity-type"
* item[3].item[1].item[0].required = false
* item[3].item[1].item[0].repeats = false

* item[3].item[1].item[1].linkId = "Organization.contact[0].name.given[0]"
* item[3].item[1].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.name.given"
* item[3].item[1].item[1].text = "Given Name"
* item[3].item[1].item[1].type = #string
* item[3].item[1].item[1].required = true
* item[3].item[1].item[1].repeats = false

* item[3].item[1].item[2].linkId = "Organization.contact[0].name.family"
* item[3].item[1].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.name.family"
* item[3].item[1].item[2].text = "Family Name"
* item[3].item[1].item[2].type = #string
* item[3].item[1].item[2].required = true
* item[3].item[1].item[2].repeats = false

* item[3].item[1].item[3].linkId = "Organization.contact[0].telecom[0].use"
* item[3].item[1].item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.use"
* item[3].item[1].item[3].text = "Telecom Use"
* item[3].item[1].item[3].type = #choice
* item[3].item[1].item[3].required = true
* item[3].item[1].item[3].repeats = false
* item[3].item[1].item[3].readOnly = true
* item[3].item[1].item[3].answerOption.valueCoding = http://hl7.org/fhir/contact-point-use#mobile
* item[3].item[1].item[3].answerOption.initialSelected = true

* item[3].item[1].item[4].linkId = "Organization.contact[0].telecom[0].system"
* item[3].item[1].item[4].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.system"
* item[3].item[1].item[4].text = "Telecom System"
* item[3].item[1].item[4].type = #choice
* item[3].item[1].item[4].required = true
* item[3].item[1].item[4].repeats = false
* item[3].item[1].item[4].readOnly = true
* item[3].item[1].item[4].answerOption.valueCoding = http://hl7.org/fhir/contact-point-system#phone
* item[3].item[1].item[4].answerOption.initialSelected = true

* item[3].item[1].item[5].linkId = "Organization.contact[0].telecom[0].value"
* item[3].item[1].item[5].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.value"
* item[3].item[1].item[5].text = "Mobile Phone"
* item[3].item[1].item[5].type = #string
* item[3].item[1].item[5].required = true
* item[3].item[1].item[5].repeats = false

* item[3].item[1].item[6].linkId = "Organization.contact[0].telecom[1].use"
* item[3].item[1].item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.use"
* item[3].item[1].item[6].text = "Telecom Use"
* item[3].item[1].item[6].type = #choice
* item[3].item[1].item[6].required = true
* item[3].item[1].item[6].repeats = false
* item[3].item[1].item[6].readOnly = true
* item[3].item[1].item[6].answerOption.valueCoding = http://hl7.org/fhir/contact-point-use#work
* item[3].item[1].item[6].answerOption.initialSelected = true

* item[3].item[1].item[7].linkId = "Organization.contact[0].telecom[1].system"
* item[3].item[1].item[7].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.system"
* item[3].item[1].item[7].text = "Telecom System"
* item[3].item[1].item[7].type = #choice
* item[3].item[1].item[7].required = true
* item[3].item[1].item[7].repeats = false
* item[3].item[1].item[7].readOnly = true
* item[3].item[1].item[7].answerOption.valueCoding = http://hl7.org/fhir/contact-point-system#email
* item[3].item[1].item[7].answerOption.initialSelected = true

* item[3].item[1].item[8].linkId = "Organization.contact[0].telecom[1].value"
* item[3].item[1].item[8].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityOrganization#Organization.contact.telecom.value"
* item[3].item[1].item[8].text = "Work Email"
* item[3].item[1].item[8].type = #string
* item[3].item[1].item[8].required = false
* item[3].item[1].item[8].repeats = false

Instance:       GofrJurisdictionQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "Add Jurisdiction"
* description = "GOFR Jurisdiction initial data entry questionnaire."
* id = "gofr-jurisdiction-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-jurisdiction-questionnaire"
* name = "gofr-jurisdiction-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for jurisdictions."

* item[0].linkId = "Location"
* item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.name"
* item[0].item[0].text = "Jurisdiction Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Location.alias"
* item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.alias"
* item[0].item[1].text = "Alternative/Nick Names"
* item[0].item[1].type = #string
* item[0].item[1].required = false
* item[0].item[1].repeats = true

* item[0].item[2].linkId = "Location.status"
* item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.status"
* item[0].item[2].text = "Status"
* item[0].item[2].type = #choice
* item[0].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[0].item[2].repeats = false
* item[0].item[2].required = true

* item[0].item[3].linkId = "Location.type[0]"
* item[0].item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.type"
* item[0].item[3].text = "Jurisdiction Type"
* item[0].item[3].type = #choice
* item[0].item[3].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-jurisdiction-type"
* item[0].item[3].repeats = true
* item[0].item[3].required = true

* item[0].item[4].linkId = "Location.type[1]"
* item[0].item[4].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.type"
* item[0].item[4].text = "Jurisdiction Type"
* item[0].item[4].type = #choice
* item[0].item[4].repeats = false
* item[0].item[4].readOnly = true
* item[0].item[4].required = true
* item[0].item[4].answerOption.valueCoding = urn:ietf:rfc:3986#urn:ihe:iti:mcsd:2019:jurisdiction
* item[0].item[4].answerOption.initialSelected = true

* item[0].item[5].linkId = "Location.partOf#tree"
* item[0].item[5].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.partOf"
* item[0].item[5].text = "Parent"
* item[0].item[5].type = #reference
* item[0].item[5].repeats = false
* item[0].item[5].required = false

* item[0].item[6].linkId = "Location.managingOrganization"
* item[0].item[6].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.managingOrganization"
* item[0].item[6].text = "Managing Organization"
* item[0].item[6].type = #string
* item[0].item[6].required = true
* item[0].item[6].repeats = false
* item[0].item[6].readOnly = true
* item[0].item[6].answerOption.valueString = "__REPLACE__Organization.id"
* item[0].item[6].answerOption.initialSelected = true

* item[1].linkId = "Organization"
* item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization"
* item[1].text = "Organization"
* item[1].type = #group

* item[1].item[0].linkId = "Organization.name"
* item[1].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization#Organization.name"
* item[1].item[0].text = "Oranization Names"
* item[1].item[0].type = #string
* item[1].item[0].repeats = false
* item[1].item[0].required = true
* item[1].item[0].readOnly = true
* item[1].item[0].answerOption.valueString = "__REPLACE__Location.name"
* item[1].item[0].answerOption.initialSelected = true

* item[1].item[1].linkId = "Organization.type"
* item[1].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization#Organization.type"
* item[1].item[1].text = "Oranization Type"
* item[1].item[1].type = #string
* item[1].item[1].repeats = false
* item[1].item[1].required = true
* item[1].item[1].readOnly = true
* item[1].item[1].answerOption.valueString = "__REPLACE__Location.type"
* item[1].item[1].answerOption.initialSelected = true

* item[1].item[2].linkId = "Organization.extension[0]"
* item[1].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization#Organization.extension:hierarchy"
* item[1].item[2].text = "Managing Organization"
* item[1].item[2].type = #group
* item[1].item[2].repeats = true

* item[1].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[1].item[2].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization#Organization.extension:hierarchy.extension:part-of.value[x]:valueReference"
* item[1].item[2].item[0].text = "Organization"
* item[1].item[2].item[0].type = #reference
* item[1].item[2].item[0].repeats = false
* item[1].item[2].item[0].required = true

* item[1].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[1].item[2].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization#Organization.extension:hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[1].item[2].item[1].text = "Type"
* item[1].item[2].item[1].type = #choice
* item[1].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[1].item[2].item[1].repeats = false
* item[1].item[2].item[1].required = false

* item[2].linkId = "Location.position"
* item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.position"
* item[2].text = "Geo-Coordinates|Geo-coordinates for the jurisdiction"
* item[2].type = #group

* item[2].item[0].linkId = "Location.position.longitude"
* item[2].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.position.longitude"
* item[2].item[0].text = "Longitude"
* item[2].item[0].type = #string
* item[2].item[0].repeats = false
* item[2].item[0].required = false

* item[2].item[1].linkId = "Location.position.latitude"
* item[2].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.position.latitude"
* item[2].item[1].text = "Latitude"
* item[2].item[1].type = #string
* item[2].item[1].repeats = false
* item[2].item[1].required = false

* item[2].item[2].linkId = "Location.position.altitude"
* item[2].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.position.altitude"
* item[2].item[2].text = "Altitude"
* item[2].item[2].type = #string
* item[2].item[2].repeats = false
* item[2].item[2].required = false

* item[3].linkId = "Location.extension"
* item[3].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.extension:boundary"
* item[3].text = "Boundaries"
* item[3].type = #group

* item[3].item[0].linkId = "Location.extension:boundary"
* item[3].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation#Location.extension:boundary.value[x]:valueAttachment"
* item[3].item[0].text = "Boundary"
* item[3].item[0].type = #attachment
* item[3].item[0].required = false
* item[3].item[0].repeats = false


Instance:       GofrFacilityAddRequestQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "Request Addition of New Facility"
* description = "GOFR Questionnaire For Request To Add Facility."
* id = "gofr-facility-add-request-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-add-request-questionnaire"
* name = "gofr-facility-add-request-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

* item[0].linkId = "Location"
* item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.name"
* item[0].item[0].text = "Facility Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Location.alias"
* item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.alias"
* item[0].item[1].text = "Alternative/Nick Names"
* item[0].item[1].type = #string
* item[0].item[1].required = false
* item[0].item[1].repeats = true

* item[0].item[2].linkId = "Location.description"
* item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.description"
* item[0].item[2].text = "Description"
* item[0].item[2].type = #text
* item[0].item[2].required = false
* item[0].item[2].repeats = false

* item[0].item[3].linkId = "Location.status"
* item[0].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.status"
* item[0].item[3].text = "Status"
* item[0].item[3].type = #choice
* item[0].item[3].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[0].item[3].repeats = false
* item[0].item[3].required = true

* item[0].item[4].linkId = "Location.type"
* item[0].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.type"
* item[0].item[4].text = "Facility Types"
* item[0].item[4].type = #choice
* item[0].item[4].answerValueSet = "http://terminology.hl7.org/ValueSet/v3-ServiceDeliveryLocationRoleType"
* item[0].item[4].repeats = true
* item[0].item[4].required = true

* item[0].item[5].linkId = "Location.physicalType"
* item[0].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.physicalType"
* item[0].item[5].text = "Physical Type"
* item[0].item[5].type = #choice
* item[0].item[5].required = true
* item[0].item[5].repeats = false
* item[0].item[5].readOnly = true
* item[0].item[5].answerOption.valueCoding = http://terminology.hl7.org/CodeSystem/location-physical-type#bu "Building"
* item[0].item[5].answerOption.initialSelected = true

* item[0].item[6].linkId = "Location.partOf#tree"
* item[0].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.partOf"
* item[0].item[6].text = "Parent"
* item[0].item[6].type = #reference
* item[0].item[6].repeats = false
* item[0].item[6].required = false

* item[0].item[7].linkId = "Location.extension[0]"
* item[0].item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.extension:requestStatus.value[x]:valueCoding"
* item[0].item[7].text = "Request Status"
* item[0].item[7].type = #choice
* item[0].item[7].required = true
* item[0].item[7].repeats = false
* item[0].item[7].readOnly = true
* item[0].item[7].answerOption.valueCoding = http://gofr.org/fhir/StructureDefinition/request-status-codesystem#pending "Pending"
* item[0].item[7].answerOption.initialSelected = true

* item[1].linkId = "Location.identifier"
* item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[1].text = "Identifiers|Identifiers for the facility"
* item[1].type = #group

* item[1].item[0].linkId = "Location.identifier[0]"
* item[1].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier"
* item[1].item[0].text = "Identifier"
* item[1].item[0].type = #group
* item[1].item[0].repeats = true
* item[1].item[0].required = false

* item[1].item[0].item[0].linkId = "Location.identifier[0].system"
* item[1].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.system"
* item[1].item[0].item[0].text = "System"
* item[1].item[0].item[0].type = #string
* item[1].item[0].item[0].repeats = false
* item[1].item[0].item[0].required = false

* item[1].item[0].item[1].linkId = "Location.identifier[0].value"
* item[1].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.value"
* item[1].item[0].item[1].text = "ID Number"
* item[1].item[0].item[1].type = #string
* item[1].item[0].item[1].repeats = false
* item[1].item[0].item[1].required = false

* item[1].item[0].item[2].linkId = "Location.identifier[0].type"
* item[1].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.identifier.type"
* item[1].item[0].item[2].text = "ID Type"
* item[1].item[0].item[2].type = #choice
* item[1].item[0].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[1].item[0].item[2].repeats = false
* item[1].item[0].item[2].required = false

* item[2].linkId = "Location.position"
* item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position"
* item[2].text = "Geo-Coordinates|Geo-coordinates for the facility"
* item[2].type = #group

* item[2].item[0].linkId = "Location.position.longitude"
* item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.longitude"
* item[2].item[0].text = "Longitude"
* item[2].item[0].type = #string
* item[2].item[0].repeats = false
* item[2].item[0].required = false

* item[2].item[1].linkId = "Location.position.latitude"
* item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.latitude"
* item[2].item[1].text = "Latitude"
* item[2].item[1].type = #string
* item[2].item[1].repeats = false
* item[2].item[1].required = false

* item[2].item[2].linkId = "Location.position.altitude"
* item[2].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.position.altitude"
* item[2].item[2].text = "Altitude"
* item[2].item[2].type = #string
* item[2].item[2].repeats = false
* item[2].item[2].required = false

* item[3].linkId = "Location.telecom"
* item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.telecom"
* item[3].text = "Contacts|Contacts for the facility"
* item[3].type = #group

* item[3].item[0].linkId = "Location.telecom[0]"
* item[3].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.telecom"
* item[3].item[0].text = "Contacts"
* item[3].item[0].type = #group
* item[3].item[0].repeats = true
* item[3].item[0].required = false

* item[3].item[0].item[0].linkId = "Location.telecom[0].system"
* item[3].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.telecom.system"
* item[3].item[0].item[0].text = "Contact Type"
* item[3].item[0].item[0].type = #choice
* item[3].item[0].item[0].answerValueSet = "http://hl7.org/fhir/contact-point-system"
* item[3].item[0].item[0].required = true
* item[3].item[0].item[0].repeats = false

* item[3].item[0].item[1].linkId = "Location.telecom[0].value"
* item[3].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.telecom.value"
* item[3].item[0].item[1].text = "Value"
* item[3].item[0].item[1].type = #string
* item[3].item[0].item[1].required = true
* item[3].item[0].item[1].repeats = false

* item[3].item[0].item[2].linkId = "Location.telecom[0].use"
* item[3].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.telecom.use"
* item[3].item[0].item[2].text = "Contact Use"
* item[3].item[0].item[2].type = #choice
* item[3].item[0].item[2].required = true
* item[3].item[0].item[2].repeats = false
* item[3].item[0].item[2].readOnly = true
* item[3].item[0].item[2].answerOption.valueCoding = http://hl7.org/fhir/address-use#work
* item[3].item[0].item[2].answerOption.initialSelected = true

* item[4].linkId = "Location.address"
* item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address"
* item[4].text = "Address"
* item[4].type = #group
* item[4].repeats = false

* item[4].item[0].linkId = "Location.address.use"
* item[4].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.use"
* item[4].item[0].text = "Address Use"
* item[4].item[0].type = #choice
* item[4].item[0].required = false
* item[4].item[0].repeats = false
* item[4].item[0].readOnly = true
* item[4].item[0].answerOption.valueCoding = http://hl7.org/fhir/address-use#work
* item[4].item[0].answerOption.initialSelected = true

* item[4].item[1].linkId = "Location.address.type"
* item[4].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.type"
* item[4].item[1].text = "Address Type"
* item[4].item[1].type = #choice
* item[4].item[1].answerValueSet = "http://hl7.org/fhir/address-type"
* item[4].item[1].required = false
* item[4].item[1].repeats = false

* item[4].item[2].linkId = "Location.address.line"
* item[4].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.line"
* item[4].item[2].text = "Street Address"
* item[4].item[2].type = #string
* item[4].item[2].required = false
* item[4].item[2].repeats = false

* item[4].item[3].linkId = "Location.address.city"
* item[4].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.city"
* item[4].item[3].text = "City"
* item[4].item[3].type = #string
* item[4].item[3].required = false
* item[4].item[3].repeats = false

* item[4].item[4].linkId = "Location.address.district"
* item[4].item[4].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.district"
* item[4].item[4].text = "District"
* item[4].item[4].type = #string
* item[4].item[4].required = false
* item[4].item[4].repeats = false

* item[4].item[5].linkId = "Location.address.state"
* item[4].item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.state"
* item[4].item[5].text = "State"
* item[4].item[5].type = #string
* item[4].item[5].required = false
* item[4].item[5].repeats = false

* item[4].item[6].linkId = "Location.address.postalCode"
* item[4].item[6].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.postalCode"
* item[4].item[6].text = "Postal Code"
* item[4].item[6].type = #string
* item[4].item[6].required = false
* item[4].item[6].repeats = false

* item[4].item[7].linkId = "Location.address.country"
* item[4].item[7].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.address.country"
* item[4].item[7].text = "Country"
* item[4].item[7].type = #string
* item[4].item[7].required = false
* item[4].item[7].repeats = false

* item[5].linkId = "Location.hoursOfOperation"
* item[5].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation"
* item[5].text = "Hours of operation|Facility availability"
* item[5].type = #group

* item[5].item[0].linkId = "Location.hoursOfOperation[0]"
* item[5].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation"
* item[5].item[0].text = "Availability"
* item[5].item[0].type = #group
* item[5].item[0].repeats = true
* item[5].item[0].required = false

* item[5].item[0].item[0].linkId = "Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].text = "Days of week"
* item[5].item[0].item[0].type = #choice
* item[5].item[0].item[0].answerValueSet = "http://hl7.org/fhir/ValueSet/days-of-week"
* item[5].item[0].item[0].required = true
* item[5].item[0].item[0].repeats = true

* item[5].item[0].item[1].linkId = "Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].text = "All day"
* item[5].item[0].item[1].type = #boolean
* item[5].item[0].item[1].required = false
* item[5].item[0].item[1].repeats = false

* item[5].item[0].item[2].linkId = "Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].text = "Opening time"
* item[5].item[0].item[2].type = #time
* item[5].item[0].item[2].required = false
* item[5].item[0].item[2].repeats = false

* item[5].item[0].item[3].linkId = "Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].definition = "http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request#Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].text = "Closing time"
* item[5].item[0].item[3].type = #time
* item[5].item[0].item[3].required = false
* item[5].item[0].item[3].repeats = false