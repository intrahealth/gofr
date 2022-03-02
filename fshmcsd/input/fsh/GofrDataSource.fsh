Profile:        GofrDataSource
Parent:         Basic
Id:             gofr-datasource
Title:          "GOFR Datasources"
Description:    "GOFR Profile of the Basic resource to manage data sources."
* code = GofrResourceCodeSystem#datasource
* extension contains
    GofrExtDataSource named datasource 1..1 MS
* extension[datasource].extension[partition].valueReference MS
* extension[datasource].extension[partition].valueReference ^label = "partition ID"
* extension[datasource].extension[display].valueString MS
* extension[datasource].extension[display].valueString ^label = "Display"
* extension[datasource].extension[host].valueString MS
* extension[datasource].extension[host].valueString ^label = "Host"
* extension[datasource].extension[sourceType].valueString MS
* extension[datasource].extension[sourceType].valueString ^label = "Source Type"
* extension[datasource].extension[source].valueString MS
* extension[datasource].extension[source].valueString ^label = "Source"
* extension[datasource].extension[username].valueString MS
* extension[datasource].extension[username].valueString ^label = "Username"
* extension[datasource].extension[password].valueString MS
* extension[datasource].extension[password].valueString ^label = "Password"
* extension[datasource].extension[levelMapping].valueString MS
* extension[datasource].extension[levelMapping].valueString ^label = "Level Mapping"
* extension[datasource].extension[autoSync].valueBoolean MS
* extension[datasource].extension[autoSync].valueBoolean ^label = "Auto Sync"
* extension[datasource].extension[lastUpdated].valueDateTime MS
* extension[datasource].extension[lastUpdated].valueDateTime ^label = "Last Updated"

Extension:      GofrExtDataSource
Id:             gofr-ext-dataSource
Title:          "Data source extension"
* extension contains
      partition 1..1 MS and
      display 1..1 MS and
      host 0..1 MS and
      sourceType 0..1 MS and
      source 0..1 MS and
      generatedFrom 0..* MS and
      username 0..1 MS and
      password 0..1 MS and
      levelMapping 1..1 MS and
      lastUpdated 0..1 MS and
      autoSync 0..1 MS

* extension[partition].value[x] only Reference(Basic)
* extension[partition].valueReference 1..1 MS
* extension[partition].valueReference ^label = "partition ID"
* extension[display].value[x] only string
* extension[display].valueString 1..1 MS
* extension[display].valueString ^label = "Display"
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
* extension[autoSync].value[x] only boolean
* extension[autoSync].valueBoolean 0..1 MS
* extension[autoSync].valueBoolean ^label = "Auto Sync"
* extension[lastUpdated].value[x] only dateTime
* extension[lastUpdated].valueDateTime 0..1 MS
* extension[lastUpdated].valueDateTime ^label = "Last Updated"

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
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/datasource').extension('http://gofr.org/fhir/StructureDefinition/partition')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/datasource']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']"
* target[0] = #Basic

Instance:       gofr-search-sourceType
InstanceOf:     SearchParameter
Title:          "search parameter for data source type"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-sourceType"
* description = "search parameter for data source type"
* name = "search parameter for data source type"
* status = #active
* experimental = false
* code = #sourceType
* base[0] = #Basic
* type = #string
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/datasource').extension('http://gofr.org/fhir/StructureDefinition/sourceType')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/datasource']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/sourceType']"