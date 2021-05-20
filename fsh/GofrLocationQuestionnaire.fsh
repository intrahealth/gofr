Instance:       GofrFacilityQuestionnaire
InstanceOf:     IhrisQuestionnaire
Usage:          #definition
* title = "GOFR Facility Questionnaire"
* description = "iHRIS Facility initial data entry questionnaire."
* id = "gofr-facility-questionnaire"
* url = "http://ihris.org/fhir/Questionnaire/gofr-facility-questionnaire"
* name = "gofr-facility-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

* item[0].linkId = "Location"
* item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.name"
* item[0].item[0].text = "Facility Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Location.alias"
* item[0].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.alias"
* item[0].item[1].text = "Alternative/Nick Names"
* item[0].item[1].type = #string
* item[0].item[1].required = false
* item[0].item[1].repeats = true

* item[0].item[2].linkId = "Location.description"
* item[0].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.description"
* item[0].item[2].text = "Description"
* item[0].item[2].type = #text
* item[0].item[2].required = false
* item[0].item[2].repeats = false

* item[0].item[3].linkId = "Location.status"
* item[0].item[3].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.status"
* item[0].item[3].text = "Status"
* item[0].item[3].type = #choice
* item[0].item[3].answerValueSet = "http://hl7.org/fhir/ValueSet/location-status"
* item[0].item[3].repeats = false
* item[0].item[3].required = true

* item[0].item[4].linkId = "Location.type"
* item[0].item[4].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.type"
* item[0].item[4].text = "Facility Types"
* item[0].item[4].type = #choice
* item[0].item[4].answerValueSet = "http://terminology.hl7.org/ValueSet/v3-ServiceDeliveryLocationRoleType"
* item[0].item[4].repeats = true
* item[0].item[4].required = true

* item[0].item[5].linkId = "Location.partOf#tree"
* item[0].item[5].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.partOf"
* item[0].item[5].text = "Parent"
* item[0].item[5].type = #reference
* item[0].item[5].repeats = false
* item[0].item[5].required = false

* item[1].linkId = "Location.identifier"
* item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.identifier"
* item[1].text = "Identifiers|Identifiers for the facility"
* item[1].type = #group

* item[1].item[0].linkId = "Location.identifier[0]"
* item[1].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.identifier"
* item[1].item[0].text = "Identifier"
* item[1].item[0].type = #group
* item[1].item[0].repeats = true
* item[1].item[0].required = false

* item[1].item[0].item[0].linkId = "Location.identifier[0].system"
* item[1].item[0].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.identifier.system"
* item[1].item[0].item[0].text = "System"
* item[1].item[0].item[0].type = #string
* item[1].item[0].item[0].repeats = false
* item[1].item[0].item[0].required = false

* item[1].item[0].item[1].linkId = "Location.identifier[0].value"
* item[1].item[0].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.identifier.value"
* item[1].item[0].item[1].text = "ID Number"
* item[1].item[0].item[1].type = #string
* item[1].item[0].item[1].repeats = false
* item[1].item[0].item[1].required = false

* item[1].item[0].item[2].linkId = "Location.identifier[0].type"
* item[1].item[0].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.identifier.type"
* item[1].item[0].item[2].text = "ID Type"
* item[1].item[0].item[2].type = #choice
* item[1].item[0].item[2].answerValueSet = "http://hl7.org/fhir/ValueSet/identifier-type"
* item[1].item[0].item[2].repeats = false
* item[1].item[0].item[2].required = false

* item[2].linkId = "Location.position"
* item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.position"
* item[2].text = "Geo-Coordinates|Geo-coordinates for the facility"
* item[2].type = #group

* item[2].item[0].linkId = "Location.position.longitude"
* item[2].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.position.longitude"
* item[2].item[0].text = "Longitude"
* item[2].item[0].type = #string
* item[2].item[0].repeats = false
* item[2].item[0].required = false

* item[2].item[1].linkId = "Location.position.latitude"
* item[2].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.position.latitude"
* item[2].item[1].text = "Latitude"
* item[2].item[1].type = #string
* item[2].item[1].repeats = false
* item[2].item[1].required = false

* item[2].item[2].linkId = "Location.position.altitude"
* item[2].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.position.altitude"
* item[2].item[2].text = "Altitude"
* item[2].item[2].type = #string
* item[2].item[2].repeats = false
* item[2].item[2].required = false

* item[3].linkId = "Location.telecom"
* item[3].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.telecom"
* item[3].text = "Contacts|Contacts for the facility"
* item[3].type = #group

* item[3].item[0].linkId = "Location.telecom[0]"
* item[3].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.telecom"
* item[3].item[0].text = "Contacts"
* item[3].item[0].type = #group
* item[3].item[0].repeats = true
* item[3].item[0].required = false

* item[3].item[0].item[0].linkId = "Location.telecom[0].system"
* item[3].item[0].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.telecom.system"
* item[3].item[0].item[0].text = "Contact Type"
* item[3].item[0].item[0].type = #choice
* item[3].item[0].item[0].answerValueSet = "http://hl7.org/fhir/contact-point-system"
* item[3].item[0].item[0].required = true
* item[3].item[0].item[0].repeats = false

* item[3].item[0].item[1].linkId = "Location.telecom[0].value"
* item[3].item[0].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.telecom.value"
* item[3].item[0].item[1].text = "Value"
* item[3].item[0].item[1].type = #string
* item[3].item[0].item[1].required = true
* item[3].item[0].item[1].repeats = false

* item[3].item[0].item[2].linkId = "Location.telecom[0].use"
* item[3].item[0].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.telecom.use"
* item[3].item[0].item[2].text = "Contact Use"
* item[3].item[0].item[2].type = #choice
* item[3].item[0].item[2].required = true
* item[3].item[0].item[2].repeats = false
* item[3].item[0].item[2].readOnly = true
* item[3].item[0].item[2].answerOption.valueCoding = http://hl7.org/fhir/address-use#work
* item[3].item[0].item[2].answerOption.initialSelected = true

* item[4].linkId = "Location.address"
* item[4].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address"
* item[4].text = "Address"
* item[4].type = #group
* item[4].repeats = false

* item[4].item[0].linkId = "Location.address.use"
* item[4].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.use"
* item[4].item[0].text = "Address Use"
* item[4].item[0].type = #choice
* item[4].item[0].required = true
* item[4].item[0].repeats = false
* item[4].item[0].readOnly = true
* item[4].item[0].answerOption.valueCoding = http://hl7.org/fhir/address-use#work
* item[4].item[0].answerOption.initialSelected = true

* item[4].item[1].linkId = "Location.address.type"
* item[4].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.type"
* item[4].item[1].text = "Address Type"
* item[4].item[1].type = #choice
* item[4].item[1].answerValueSet = "http://hl7.org/fhir/address-type"
* item[4].item[1].required = true
* item[4].item[1].repeats = false

* item[4].item[2].linkId = "Location.address.line"
* item[4].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.line"
* item[4].item[2].text = "Street Address"
* item[4].item[2].type = #string
* item[4].item[2].required = true
* item[4].item[2].repeats = false

* item[4].item[3].linkId = "Location.address.city"
* item[4].item[3].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.city"
* item[4].item[3].text = "City"
* item[4].item[3].type = #string
* item[4].item[3].required = false
* item[4].item[3].repeats = false

* item[4].item[4].linkId = "Location.address.district"
* item[4].item[4].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.district"
* item[4].item[4].text = "District"
* item[4].item[4].type = #string
* item[4].item[4].required = false
* item[4].item[4].repeats = false

* item[4].item[5].linkId = "Location.address.state"
* item[4].item[5].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.state"
* item[4].item[5].text = "State"
* item[4].item[5].type = #string
* item[4].item[5].required = false
* item[4].item[5].repeats = false

* item[4].item[6].linkId = "Location.address.postalCode"
* item[4].item[6].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.postalCode"
* item[4].item[6].text = "Postal Code"
* item[4].item[6].type = #string
* item[4].item[6].required = false
* item[4].item[6].repeats = false

* item[4].item[7].linkId = "Location.address.country"
* item[4].item[7].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.address.country"
* item[4].item[7].text = "Country"
* item[4].item[7].type = #string
* item[4].item[7].required = false
* item[4].item[7].repeats = false

* item[5].linkId = "Location.hoursOfOperation"
* item[5].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation"
* item[5].text = "Hours of operation|Facility availability"
* item[5].type = #group

* item[5].item[0].linkId = "Location.hoursOfOperation[0]"
* item[5].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation"
* item[5].item[0].text = "Availability"
* item[5].item[0].type = #group
* item[5].item[0].repeats = true
* item[5].item[0].required = false

* item[5].item[0].item[0].linkId = "Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation[0].daysOfWeek"
* item[5].item[0].item[0].text = "Days of week"
* item[5].item[0].item[0].type = #choice
* item[5].item[0].item[0].answerValueSet = "http://hl7.org/fhir/ValueSet/days-of-week"
* item[5].item[0].item[0].required = true
* item[5].item[0].item[0].repeats = true

* item[5].item[0].item[1].linkId = "Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation[0].allDay"
* item[5].item[0].item[1].text = "All day"
* item[5].item[0].item[1].type = #boolean
* item[5].item[0].item[1].required = false
* item[5].item[0].item[1].repeats = false

* item[5].item[0].item[2].linkId = "Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation[0].openingTime"
* item[5].item[0].item[2].text = "Opening time"
* item[5].item[0].item[2].type = #time
* item[5].item[0].item[2].required = false
* item[5].item[0].item[2].repeats = false

* item[5].item[0].item[3].linkId = "Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].definition = "http://hl7.org/fhir/StructureDefinition/Location#Location.hoursOfOperation[0].closingTime"
* item[5].item[0].item[3].text = "Closing time"
* item[5].item[0].item[3].type = #time
* item[5].item[0].item[3].required = false
* item[5].item[0].item[3].repeats = false