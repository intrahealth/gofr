Profile:        GofrDataSourcePair
Parent:         Basic
Id:             gofr-datasource-pair
Title:          "GOFR Data source Pair"
Description:    "GOFR Profile of the Basic resource to manage data sources."
* code = GofrResourceCodeSystem#datasourcepair
* extension contains
      partition 1..1 MS and
      name 1..1 MS and
      source1 1..1 MS and
      source2 1..1 MS and
      status 1..1 MS and
      recoStatus 1..1 MS
* extension[partition].value[x] only Reference(Basic)
* extension[partition].valueReference 1..1 MS
* extension[partition].valueReference ^label = "partition ID"
* extension[name].value[x] only string
* extension[name].valueString 1..1 MS
* extension[name].valueString ^label = "Name"
* extension[source1].value[x] only Reference
* extension[source1].valueReference only Reference(GofrDataSource)
* extension[source1].valueReference 1..1 MS
* extension[source1].valueReference ^label = "Source1"
* extension[source2].value[x] only Reference
* extension[source2].valueReference only Reference(GofrDataSource)
* extension[source2].valueReference 1..1 MS
* extension[source2].valueReference ^label = "Source2"
* extension[status].value[x] only string
* extension[status].valueString 0..1 MS
* extension[status].valueString ^label = "Status"
* extension[recoStatus].value[x] only string
* extension[recoStatus].valueString 0..1 MS
* extension[recoStatus].valueString ^label = "Reconciliation Status"

Instance:       gofr-search-pairpartition
InstanceOf:     SearchParameter
Title:          "search parameter for data source pair partition"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-pairpartition"
* description = "search parameter for data source pair partition"
* name = "search parameter for data source pair partition"
* status = #active
* experimental = false
* code = #pairpartition
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']"
* target[0] = #Basic

Instance:       gofr-search-pair-source1
InstanceOf:     SearchParameter
Title:          "search parameter for source1 of the pair"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-pair-source1"
* description = "search parameter for source1 of the pair"
* name = "search parameter for source1 of the pair"
* status = #active
* experimental = false
* code = #pairsource1
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/source1')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/source1']"
* target[0] = #Basic

Instance:       gofr-search-pair-source2
InstanceOf:     SearchParameter
Title:          "search parameter for source1 of the pair"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-pair-source2"
* description = "search parameter for source2 of the pair"
* name = "search parameter for source2 of the pair"
* status = #active
* experimental = false
* code = #pairsource2
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/source2')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/source2']"
* target[0] = #Basic

Instance:       gofr-search-pair-status
InstanceOf:     SearchParameter
Title:          "search parameter for status of the pair"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-pair-status"
* description = "search parameter for status of the pair"
* name = "search parameter for status of the pair"
* status = #active
* experimental = false
* code = #pairstatus
* base[0] = #Basic
* type = #string
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/status')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/status']"