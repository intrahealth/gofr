Profile:        GofrInstanceOrganization
Parent:         Organization
Id:             gofr-instance-organization
Title:          "GOFR Instance Organization"
Description:    "Organization Profile to manage multiple organizations using single instance of GOFR."
* name 1..1 MS
* name ^label = "Name"

Instance:       gofr-page-instance-organization
InstanceOf:     GofrPage
Title:          "GOFR Instances Organization Page"
Usage:          #example
* code = GofrResourceCodeSystem#page
* extension[display].extension[title].valueString = "Organization"
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-mcsd-organization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"

Instance:       default-organization
InstanceOf:     GofrInstanceOrganization
Title:          "Default Organization"
Usage:          #example
* id = "54cdcbe3-87e0-421f-b657-8313fce5f418"
* name = "Default"