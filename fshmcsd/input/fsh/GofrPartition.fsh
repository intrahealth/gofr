Profile:        GofrPartition
Parent:         Basic
Id:             gofr-partition
Title:          "GOFR Partition"
Description:    "GOFR Profile of the Basic resource to manage hapi partitions."
* code = GofrResourceCodeSystem#partition
* extension contains
    GofrExtPartition named partition 1..1 MS
* extension[partition].extension[partitionID].valueInteger MS
* extension[partition].extension[partitionID].valueInteger ^label = "partition ID"
* extension[partition].extension[name].valueString MS
* extension[partition].extension[name].valueString ^label = "Name"
* extension[partition].extension[organization].valueReference MS
* extension[partition].extension[organization].valueReference ^label = "Owning Organization"
* extension[partition].extension[owner] ^label = "Owner Details"
* extension[partition].extension[owner].extension[userID].valueReference.reference MS
* extension[partition].extension[owner].extension[dhis2OrgId].valueString MS
* extension[partition].extension[shared].extension[shareduser].extension[user].valueReference.reference MS
* extension[partition].extension[shared].extension[shareduser].extension[locationLimit].valueReference.reference MS
* extension[partition].extension[shared].extension[shareToSameOrgid].valueBoolean MS
* extension[partition].extension[shared].extension[shareToAll] ^label = "Share to all"
* extension[partition].extension[shared].extension[shareToAll].extension[activated].valueBoolean MS
* extension[partition].extension[shared].extension[shareToAll].extension[limitByUserLocation].valueBoolean MS
* extension[partition].extension[createdTime].valueDateTime MS
* extension[partition].extension[createdTime].valueDateTime ^label = "Created Time"


Extension:      GofrExtPartition
Id:             gofr-ext-partition
Title:          "GOFR partition extension"
* extension contains
      partitionID 1..1 MS and
      name 1..1 MS and
      organization 1..1 MS and
      createdTime 1..1 MS and
      PartitionOwner named owner 1..1 MS and
      PartitionSharing named shared 0..1 MS
* extension[partitionID].value[x] only integer
* extension[partitionID].valueInteger 1..1 MS
* extension[partitionID].valueInteger ^label = "partition ID"
* extension[name].value[x] only string
* extension[name].valueString 1..1 MS
* extension[name].valueString ^label = "Name"
* extension[organization].value[x] only Reference(Basic)
* extension[organization].valueReference 1..1 MS
* extension[organization].valueReference ^label = "Owning Organization"
* extension[owner] ^label = "Owner Details"
* extension[owner].extension[userID].valueReference.reference MS
* extension[owner].extension[dhis2OrgId].valueString MS
* extension[shared].extension[shareduser].extension[user].valueReference.reference MS
* extension[shared].extension[shareduser].extension[locationLimit].valueReference.reference MS
* extension[shared].extension[shareToSameOrgid].valueBoolean MS
* extension[shared].extension[shareToAll] ^label = "Share to all"
* extension[shared].extension[shareToAll].extension[activated].valueBoolean MS
* extension[shared].extension[shareToAll].extension[limitByUserLocation].valueBoolean MS
* extension[createdTime].value[x] only dateTime
* extension[createdTime].valueDateTime 1..1 MS
* extension[createdTime].valueDateTime ^label = "Created Time"

Extension:      PartitionOwner
Id:             partition-owner
Title:          "GOFR Partition Owner"
Description:    "GOFR Partition Owner"
* ^context.type = #element
* ^context.expression = "GofrPartition"
* extension contains
      userID 1..1 MS and
      dhis2OrgId 0..1 MS
* extension[userID].value[x] only Reference
* extension[userID].valueReference only Reference(Person)
* extension[userID].valueReference 1..1 MS
* extension[userID].valueReference ^label = "Owner"
* extension[dhis2OrgId].value[x] only string
* extension[dhis2OrgId].valueString 1..1 MS
* extension[dhis2OrgId].valueString ^label = "DHIS2 Org ID"

Extension:      PartitionSharing
Id:             partition-sharing
Title:          "GOFR Partition Shared Users"
Description:    "GOFR Partition Shared Users"
* ^context.type = #element
* ^context.expression = "GofrPartition"
* extension contains
      SharedUser named shareduser 0..* MS and
      activeUsers 0..* MS and
      shareToSameOrgid 1..1 MS and
      ShareToAll named shareToAll 0..1 MS
* extension[shareduser].extension[user].value[x] only Reference
* extension[shareduser].extension[user].valueReference only Reference(Person)
* extension[shareduser].extension[user].valueReference 1..1 MS
* extension[shareduser].extension[user].valueReference ^label = "Shared User"
* extension[shareduser].extension[locationLimit].value[x] only Reference
* extension[shareduser].extension[locationLimit].valueReference only Reference(Location)
* extension[shareduser].extension[locationLimit].valueReference 1..1 MS
* extension[shareduser].extension[locationLimit].valueReference ^label = "Limit Location"
* extension[activeUsers].value[x] only Reference
* extension[activeUsers].valueReference only Reference(Person)
* extension[activeUsers].valueReference 1..1 MS
* extension[activeUsers].valueReference ^label = "Active Users"
* extension[shareToSameOrgid].value[x] only boolean
* extension[shareToSameOrgid].valueBoolean 1..1 MS
* extension[shareToSameOrgid].valueBoolean ^label = "Share to same orgid (DHIS2)"
* extension[shareToAll].extension[activated].value[x] only boolean
* extension[shareToAll].extension[activated].valueBoolean 1..1 MS
* extension[shareToAll].extension[activated].valueBoolean ^label = "Activated"
* extension[shareToAll].extension[limitByUserLocation].value[x] only boolean
* extension[shareToAll].extension[limitByUserLocation].valueBoolean 1..1 MS
* extension[shareToAll].extension[limitByUserLocation].valueBoolean ^label = "Limit by user location"


Extension:      SharedUser
Id:             shared-user
Title:          "GOFR Partition Shared Users"
Description:    "GOFR Partition Shared Users"
* ^context.type = #element
* ^context.expression = "GofrPartition"
* extension contains
      user 1..1 MS and
      locationLimit 0..* MS
* extension[user].value[x] only Reference
* extension[user].valueReference only Reference(Person)
* extension[user].valueReference 1..1 MS
* extension[user].valueReference ^label = "Shared User"
* extension[locationLimit].value[x] only Reference
* extension[locationLimit].valueReference only Reference(Location)
* extension[locationLimit].valueReference 1..1 MS
* extension[locationLimit].valueReference ^label = "Limit Location"

Extension:      ShareToAll
Id:             shared-toall
Title:          "GOFR Partition Shared to All"
Description:    "GOFR Partition Shared to All"
* ^context.type = #element
* ^context.expression = "GofrPartition"
* extension contains
      activated 1..1 MS and
      limitByUserLocation 0..1 MS
* extension[activated].value[x] only boolean
* extension[activated].valueBoolean 1..1 MS
* extension[activated].valueBoolean ^label = "Activated"
* extension[limitByUserLocation].value[x] only boolean
* extension[limitByUserLocation].valueBoolean 1..1 MS
* extension[limitByUserLocation].valueBoolean ^label = "Limit by user location"

Instance:       gofr-search-partitionowner
InstanceOf:     SearchParameter
Title:          "search parameter for user ID of the partition profile"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partitionowner"
* description = "search parameter for user ID of the partition profile"
* name = "search parameter for user ID of the partition profile"
* status = #active
* experimental = false
* code = #partitionowner
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/owner').extension('userID')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/owner']/f:extension[@url='userID']"
* target[0] = #Person

Instance:       gofr-search-partition-dhis2orgid
InstanceOf:     SearchParameter
Title:          "search parameter for DHIS2 Org ID of the partition profile"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partition-dhis2orgid"
* description = "search parameter for DHIS2 Org ID of the partition profile"
* name = "search parameter for DHIS2 Org ID of the partition profile"
* status = #active
* experimental = false
* code = #partitiondhis2orgid
* base[0] = #Basic
* type = #string
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/pairowner').extension('dhis2orgid')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/pairowner']/f:extension[@url='dhis2OrgId']"

Instance:       gofr-search-partitionid
InstanceOf:     SearchParameter
Title:          "search parameter for partition id of the partition profile"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partitionid"
* description = "search parameter for partition id of the partition profile"
* name = "search parameter for partition id of the partition profile"
* status = #active
* experimental = false
* code = #partitionid
* base[0] = #Basic
* type = #number
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/partitionID')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partitionID']"

Instance:       gofr-search-partition-shared-user
InstanceOf:     SearchParameter
Title:          "search parameter for users shared a partition"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partition-shared-user"
* description = "search parameter for users shared a partition"
* name = "search parameter for users shared a partition"
* status = #active
* experimental = false
* code = #partitionshareduser
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/shared').extension('http://gofr.org/fhir/StructureDefinition/shareduser').extension('user')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shared']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shareduser']/f:extension[@url='user']"
* target[0] = #Person

Instance:       gofr-search-partition-share-same-orgid
InstanceOf:     SearchParameter
Title:          "Search parameter for data source shared to all users on the same orgid"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partition-share-same-orgid"
* description = "Search parameter for data source shared to all users on the same orgid"
* name = "Search parameter for data source shared to all users on the same orgid"
* status = #active
* experimental = false
* code = #partitionsharesameorgid
* base[0] = #Basic
* type = #token
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/shared').extension('shareToSameOrgid')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shared']/f:extension[@url='shareToSameOrgid']"

Instance:       gofr-search-partition-share-all
InstanceOf:     SearchParameter
Title:          "Search parameter for partition shared to everyone"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partition-share-all"
* description = "Search parameter for partition shared to everyone"
* name = "Search parameter for partition shared to everyone"
* status = #active
* experimental = false
* code = #partitionshareall
* base[0] = #Basic
* type = #token
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/shared').extension('http://gofr.org/fhir/StructureDefinition/shareToAll').extension('activated')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shared']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shareToAll']/f:extension[@url='activated']"

Instance:       gofr-search-partition-shared-activated
InstanceOf:     SearchParameter
Title:          "search parameter for users shared a partition and have it activated"
Usage:          #definition
* url = "http://gofr.org/fhir/SearchParameter/gofr-search-partition-shared-activated"
* description = "search parameter for users shared a partition and have it activated"
* name = "search parameter for users shared a partition and have it activated"
* status = #active
* experimental = false
* code = #partitionsharedactiveuser
* base[0] = #Basic
* type = #reference
* expression = "Basic.extension('http://gofr.org/fhir/StructureDefinition/partition').extension('http://gofr.org/fhir/StructureDefinition/shared').extension('activeUsers')"
* xpath = "f:Basic/f:extension[@url='http://gofr.org/fhir/StructureDefinition/partition']/f:extension[@url='http://gofr.org/fhir/StructureDefinition/shared']/f:extension[@url='activeUsers']"
* target[0] = #Person