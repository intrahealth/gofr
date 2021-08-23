Profile:        GofrDataSource
Parent:         Basic
Id:             gofr-datasource
Title:          "GOFR Datasources"
Description:    "GOFR Profile of the Basic resource to manage data sources."
* code = GofrResourceCodeSystem#datasource
* extension contains
      partition 1..1 MS and
      display 1..1 MS and
      host 0..1 MS and
      sourceType 0..1 MS and
      source 0..1 MS and
      username 0..1 MS and
      password 0..1 MS and
      levelMapping 1..1 MS

* extension[partition].value[x] only Reference(Basic)
* extension[partition].valueReference 1..1 MS
* extension[partition].valueReference ^label = "partition ID"
* extension[display].value[x] only string
* extension[display].valueString 1..1 MS
* extension[display].valueString ^label = "Name"
* extension[host].value[x] only string
* extension[host].valueString 0..1 MS
* extension[host].valueString ^label = "Host"
* extension[sourceType].value[x] only string
* extension[sourceType].valueString 0..1 MS
* extension[sourceType].valueString ^label = "Source Type"
* extension[source].value[x] only string
* extension[source].valueString 0..1 MS
* extension[source].valueString ^label = "Source"
* extension[username].value[x] only string
* extension[username].valueString 0..1 MS
* extension[username].valueString ^label = "Username"
* extension[password].value[x] only string
* extension[password].valueString 0..1 MS
* extension[password].valueString ^label = "Password"
* extension[levelMapping].value[x] only string
* extension[levelMapping].valueString 0..1 MS
* extension[levelMapping].valueString ^label = "Level Mapping"

Instance:       gofr-search-sourcepartition
InstanceOf:     SearchParameter
Title:          "search parameter for data source partition of the data source profile"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-sourcepartition"
* description = "search parameter for data source partition of the sourcepartition profile"
* name = "search parameter for data source partition of the data source profile"
* status = #active
* experimental = false
* code = #datasourcepartition
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']"
* target[0] = #Basic