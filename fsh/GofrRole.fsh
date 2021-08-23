Profile:        GofrRole
Parent:         Basic
Id:             gofr-role
Title:          "GOFR Role"
Description:    "GOFR Profile of the Basic resource to manage roles."
* code = GofrResourceCodeSystem#role
* extension contains
      name 1..1 MS and
      primary 1..1 MS and
      tasks 0..* MS
* extension[name].value[x] only string
* extension[name].valueString 1..1 MS
* extension[name].valueString ^label = "Name"
* extension[primary].value[x] only boolean
* extension[primary].valueBoolean 1..1 MS
* extension[primary].valueBoolean ^label = "Name"
* extension[tasks].value[x] only CodeableConcept
* extension[tasks].valueCodeableConcept 1..1 MS
* extension[tasks].valueCodeableConcept ^label = "Tasks"
* extension[tasks].valueCodeableConcept.coding 1..* MS
* extension[tasks].valueCodeableConcept.coding from GofrTaskPermissionValueSet (required)
* extension[tasks].valueCodeableConcept.coding ^label = "Tasks"

Instance:       gofr-role-admin
InstanceOf:     GofrRole
Title:          "GOFR Admin Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Admin"
* extension[primary].valueBoolean = true
* extension[tasks].valueCodeableConcept.coding[0].system = "http://gofr.org/fhir/CodeSystem/gofr-task-permission-codesystem"
* extension[tasks].valueCodeableConcept.coding[0].code = GofrTaskPermissionCodeSystem#*
* extension[tasks].valueCodeableConcept.coding[0].display = "All"

Instance:       gofr-role-guest
InstanceOf:     GofrRole
Title:          "GOFR Guest Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Guest"
* extension[primary].valueBoolean = true
* extension[tasks].valueCodeableConcept.coding[0].system = "http://gofr.org/fhir/CodeSystem/gofr-task-permission-codesystem"
* extension[tasks].valueCodeableConcept.coding[0].code = GofrTaskPermissionCodeSystem#*
* extension[tasks].valueCodeableConcept.coding[0].display = "All"

Instance:       gofr-role-data-manager
InstanceOf:     GofrRole
Title:          "GOFR Data Manager Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Data Manager"
* extension[primary].valueBoolean = true
* extension[tasks].valueCodeableConcept.coding[0].system = "http://gofr.org/fhir/CodeSystem/gofr-task-permission-codesystem"
* extension[tasks].valueCodeableConcept.coding[0].code = GofrTaskPermissionCodeSystem#*
* extension[tasks].valueCodeableConcept.coding[0].display = "All"

Instance:       gofr-page-role
InstanceOf:     IhrisPage
Title:          "User"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-role)
* extension[display].extension[link][0].extension[field].valueString = ""
* extension[display].extension[link][0].extension[text].valueString = "Add Another Role"
* extension[display].extension[link][0].extension[button].valueBoolean = true
* extension[display].extension[link][0].extension[icon].valueString = "mdi-account-arrow-right"
* extension[display].extension[link][0].extension[url].valueUrl = "/questionnaire/gofr-role/role"
* extension[display].extension[search][0].valueString = "Role|extension.where(url='name').valueString"
* extension[display].extension[search][1].valueString = "Primary|extension.where(url='primary').valueBoolean"
* extension[display].extension[add].extension[url].valueUrl = "/questionnaire/gofr-role/role"
* extension[display].extension[add].extension[icon].valueString = "mdi-account-plus"
* extension[display].extension[add].extension[class].valueString = "accent"
* extension[section][0].extension[title].valueString = "Role"
* extension[section][0].extension[description].valueString = "System Role Details"
* extension[section][0].extension[name].valueString = "Role"
* extension[section][0].extension[field][0].valueString = "extension:name.value[x]:valueString"
* extension[section][0].extension[field][1].valueString = "extension:primary.value[x]:valueString"
* extension[section][0].extension[field][2].valueString = "extension:primary.value[x]:valueCode"