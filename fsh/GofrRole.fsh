Profile:        GofrRole
Parent:         Basic
Id:             gofr-role
Title:          "GOFR Role"
Description:    "GOFR Profile of the Basic resource to manage roles."
* code = GofrResourceCodeSystem#role
* extension contains
      GofrBasicName named name 1..1 MS and
      GofrRolePrimary named primary 1..1 and
      GofrAssignRole named role 0..* and
      task 0..*
* extension[name].valueString 1..1 MS
* extension[task].value[x] only Reference(Basic)
* extension[task].valueReference 1..1 MS
* extension[task].valueReference ^label = "Task"

Profile:        GofrTask
Parent:         Basic
Id:             gofr-task
Title:          "GOFR Task"
Description:    "GOFR Profile of the Basic resource to manage tasks."
* code = GofrResourceCodeSystem#task
* extension contains
      GofrBasicName named name 1..1 MS and
      TaskAttributes named attributes 0..1 and
      compositeTask 0..*
* extension[name].valueString 1..1 MS
* extension[compositeTask].value[x] only Reference(Basic)
* extension[compositeTask].valueReference 1..1 MS
* extension[compositeTask].valueReference ^label = "Composite Task"

Invariant:      gofr-task-instance-constraint
Description:    "Only one of extension[instance].valueCode or extension[constraint].valueReference SHALL be present."
Expression:     "extension(url = instance).exists() xor extension(url = constraint).exists()"
Severity:       #error
XPath:          "exists(f:extension(url = instance)) != exists(f:extension(url = constraint))"

Extension:      GofrBasicName
Id:             gofr-basic-name
Title:          "GOFR Basic Name"
Description:    "GOFR name field for basic resources."
* ^context[0].type = #element
* ^context[0].expression = "Basic"
* value[x] only string
* valueString 1..1 MS
* valueString ^label = "Name"

Extension:      GofrRolePrimary
Id:             gofr-role-primary
Title:          "GOFR Role Primary"
Description:    "GOFR flag for roles to indicate a primary role for assignment to users."
* ^context[1].type = #element
* ^context[1].expression = "GofrRole"
* value[x] only boolean
* valueBoolean 1..1

Extension:      GofrAssignRole
Id:             gofr-assign-role
Title:          "GOFR Assign Role"
Description:    "GOFR Assign Role to a user or other role."
* ^context[0].type = #element
* ^context[0].expression = "Person"
* ^context[1].type = #element
* ^context[1].expression = "GofrRole"
* value[x] only Reference
* valueReference 1..1 MS
* valueReference ^label = "Role"
* valueReference only Reference(GofrRole)
* valueReference.reference ^label = "Role"

Extension:      TaskAttributes
Id:             task-attributes
Title:          "Task Attributes"
Description:    "Task attributes."
* ^context.type = #element
* ^context.expression = "GofrTask"
* obeys gofr-task-instance-constraint
* extension contains
      permission 1..1 MS and
      resource 0..1 MS and
      instance 0..1 MS and
      field 0..1 MS and
      constraint 0..1 MS
* extension[permission].value[x] only code
* extension[permission].valueCode from GofrTaskPermissionValueSet (required)
* extension[resource].value[x] only code
* extension[resource].valueCode from GofrTaskResourceValueSet (extensible)
* extension[instance].value[x] only id
* extension[field].value[x] only string
* extension[constraint].value[x] only string

CodeSystem:     GofrTaskPermissionCodeSystem
Id:             gofr-task-permission
Title:          "Code system for task permissions."
* ^date = "2021-03-26T09:25:04.362Z"
* ^version = "0.3.0"
* #*      "All"     "Can do any task."
* #read   "Read"    "Can read the given resource."
* #write  "Write"   "Can write the given resource."
* #delete "Delete"  "Can delete the given resource."
* #filter "Filter"  "Search filter constraints."
* #special "Special"  "Special non-resource permissions."

ValueSet:       GofrTaskPermissionValueSet
Id:             gofr-task-permission
Title:          "Code system for task permissions."
* ^date = "2021-03-26T09:25:04.362Z"
* ^version = "0.3.0"
* codes from system GofrTaskPermissionCodeSystem

CodeSystem:     GofrTaskResourceCodeSystem
Id:             gofr-task-resource
Title:          "Code system for task permissions."
* ^date = "2021-03-26T09:25:04.362Z"
* ^version = "0.3.0"
* #*                    "All"
* #Practitioner         "Practitioner"
* #StructureDefinition  "StructureDefinition"
* #ValueSet             "ValueSet"
* #CodeSystem           "CodeSystem"
* #Basic                "Basic"
* #DocumentReference    "DocumentReference"
* #Questionnaire        "Questionnaire"
* #QuestionnaireResponse "QuestionnaireResponse"
* #PractitionerRole     "PractitionerRole"
* #Location             "Location"
* #Person               "Person"
* #Custom               "Custom"
* #Navigation           "Navigation"

ValueSet:       GofrTaskResourceValueSet
Id:             gofr-task-resource
Title:          "Code system for task permissions."
* ^date = "2021-03-26T09:25:04.362Z"
* ^version = "0.3.0"
* codes from system GofrTaskResourceCodeSystem

Instance:       gofr-role-open
InstanceOf:     GofrRole
Title:          "GOFR Open Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Open Role"
* extension[primary].valueBoolean = true
* extension[task][0].valueReference = Reference(Basic/gofr-task-read-structure-definition)
* extension[task][0].valueReference = Reference(Basic/gofr-task-read-code-system)
* extension[task][0].valueReference = Reference(Basic/gofr-task-read-value-set)
* extension[task][0].valueReference = Reference(Basic/gofr-task-read-document-reference)

Instance:       gofr-role-admin
InstanceOf:     GofrRole
Title:          "GOFR Admin Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Admin"
* extension[primary].valueBoolean = true
* extension[task][0].valueReference = Reference(Basic/gofr-task-all-permissions-to-everything)
* extension[role][0].valueReference = Reference(Basic/gofr-role-open)

Instance:       gofr-task-all-permissions-to-everything
InstanceOf:     GofrTask
Title:          "GOFR Task With All Permissions To Everything"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "all-permissions-to-everything"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#*
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#*

Instance:       gofr-task-read-structure-definition
InstanceOf:     GofrTask
Title:          "GOFR Task To Read StructureDefinition Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-structure-definition"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#StructureDefinition

Instance:       gofr-task-read-code-system
InstanceOf:     GofrTask
Title:          "GOFR Task To Read CodeSystem resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-code-system"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#CodeSystem

Instance:       gofr-task-read-value-set
InstanceOf:     GofrTask
Title:          "GOFR Task To Read Valueset Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-value-set"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#ValueSet

Instance:       gofr-task-read-document-reference
InstanceOf:     GofrTask
Title:          "GOFR Task To Read DocumentReference"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-document-reference"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#DocumentReference
* extension[attributes][0].extension[constraint].valueString = "category.exists(coding.exists(code = 'open'))"

Instance:       gofr-task-read-location-resource
InstanceOf:     GofrTask
Title:          "GOFR Task To Read Location Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-location-resource"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#Location

Instance:       gofr-task-read-practitioner-page-resource
InstanceOf:     GofrTask
Title:          "GOFR Task To Read Practitioner Page Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-practitioner-page-resource"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#Basic
* extension[attributes][0].extension[instance].valueId = "ihris-page-practitioner"

Instance:       gofr-task-read-practitioner-role-page-resource
InstanceOf:     GofrTask
Title:          "GOFR Task To Read Practitioner Role Page Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-practitioner-role-page-resource"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#Basic
* extension[attributes][0].extension[instance].valueId = "ihris-page-practitionerrole"

Instance:       gofr-task-read-questionnaire-resource
InstanceOf:     GofrTask
Title:          "GOFR Task To Read Questionnaire Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "read-questionnaire-resource"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#read
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#Questionnaire

Instance:       gofr-task-write-questionnaireresponse-resource
InstanceOf:     GofrTask
Title:          "GOFR Task To Write QuestionnaireResponse Resource"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "write-questionnaireresponse-resource"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#write
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#QuestionnaireResponse

Instance:       gofr-task-view-search-organization-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Search Organization Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-search-organization-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-search-organization-page"
* extension[compositeTask][0].valueReference = Reference(Basic/gofr-task-search-records)

Instance:       gofr-task-view-search-service-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Search Service Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-search-service-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-search-service-page"
* extension[compositeTask][0].valueReference = Reference(Basic/gofr-task-search-records)

Instance:       gofr-task-view-search-jurisdiction-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Search Jurisdiction Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-search-jurisdiction-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-search-jurisdiction-page"
* extension[compositeTask][0].valueReference = Reference(Basic/gofr-task-search-records)

Instance:       gofr-task-view-search-facility-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Search Facility Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-search-facility-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-search-facility-page"
* extension[compositeTask][0].valueReference = Reference(Basic/gofr-task-search-records)

Instance:       gofr-task-view-config-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Configure Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-config-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-config-page"

Instance:       gofr-task-view-add-organization-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Add Organization Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-add-organization-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-add-organization-page"

Instance:       gofr-task-view-add-facility-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Add Facility Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-add-facility-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-add-facility-page"

Instance:       gofr-task-view-add-jurisdiction-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Add Jurisdiction Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-add-jurisdiction-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-add-jurisdiction-page"

Instance:       gofr-task-view-add-healthcare-service-page
InstanceOf:     GofrTask
Title:          "GOFR Task To View Add Healthcare Service Page"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-add-healthcare-service-page"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-add-healthcare-service-page"

Instance:       gofr-task-process-add-facility-request
InstanceOf:     GofrTask
Title:          "GOFR Task To Approve/Reject Add Facilities Requests"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "process-add-facility-request"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "process-add-facility-request"

Instance:       gofr-task-process-update-facility-request
InstanceOf:     GofrTask
Title:          "GOFR Task To Approve/Reject Update Facilities Requests"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "process-update-facility-request"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "process-update-facility-request"

Instance:       gofr-task-search-records
InstanceOf:     GofrTask
Title:          "GOFR Task Search Records"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "search-records"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#navigation
* extension[attributes][0].extension[instance].valueId = "search-records"

Instance:       gofr-task-view-update-facility-requests
InstanceOf:     GofrTask
Title:          "GOFR Task To View Requests For Facilities Update"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-update-facility-requests"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-update-facility-requests"
* extension[compositeTask][0].valueReference = Reference(Basic/gofr-task-search-records)

Instance:       gofr-task-view-add-facility-requests
InstanceOf:     GofrTask
Title:          "GOFR Task To View Requests For Facilities Addition"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-add-facility-requests"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-add-facility-requests"

Instance:       gofr-task-add-data-source
InstanceOf:     GofrTask
Title:          "GOFR Task To Add Data Source"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "add-data-source"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "add-data-source"

Instance:       gofr-task-view-data-source
InstanceOf:     GofrTask
Title:          "GOFR Task To View Data Source"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-data-source"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-data-source"

Instance:       gofr-task-share-data-source
InstanceOf:     GofrTask
Title:          "GOFR Task To Share Data Source"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "share-data-source"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "share-data-source"

Instance:       gofr-task-create-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To Create Data Source Pairs"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "create-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "create-source-pair"

Instance:       gofr-task-share-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To Share Data Source Pairs"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "share-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "share-source-pair"

Instance:       gofr-task-activate-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To Activate Data Source Pair"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "activate-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "activate-source-pair"

Instance:       gofr-task-deactivate-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To Deactivate Data Source Pair"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "deactivate-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "deactivate-source-pair"

Instance:       gofr-task-view-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To View Data Source Pair"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-source-pair"

Instance:       gofr-task-delete-data-source
InstanceOf:     GofrTask
Title:          "GOFR Task To Delete Data Source"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "delete-data-source"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "delete-data-source"

Instance:       gofr-task-delete-source-pair
InstanceOf:     GofrTask
Title:          "GOFR Task To Delete Data Source Pair"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "delete-source-pair"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "delete-source-pair"

Instance:       gofr-task-view-matching-status
InstanceOf:     GofrTask
Title:          "GOFR Task To View Matching Status"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "view-matching-status"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "view-matching-status"

Instance:       gofr-task-data-source-reconciliation
InstanceOf:     GofrTask
Title:          "GOFR Task To Perform Data Source Reconciliation"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "data-source-reconciliation"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "data-source-reconciliation"

Instance:       gofr-task-match-location
InstanceOf:     GofrTask
Title:          "GOFR Task To Match Location"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "match-location"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "match-location"

Instance:       gofr-task-accept-flagged-location
InstanceOf:     GofrTask
Title:          "GOFR Task To Accept Flagged Location"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "accept-flagged-location"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "accept-flagged-location"

Instance:       gofr-task-break-matched-location
InstanceOf:     GofrTask
Title:          "GOFR Task To Break Matched Location"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "break-matched-location"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "break-matched-location"

Instance:       gofr-task-open-matching
InstanceOf:     GofrTask
Title:          "GOFR Task To Open Matching Process"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "open-matching"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "open-matching"

Instance:       gofr-task-close-matching
InstanceOf:     GofrTask
Title:          "GOFR Task To Close Matching Process"
Usage:          #example
* code = GofrResourceCodeSystem#task
* extension[name].valueString = "close-matching"
* extension[attributes][0].extension[permission].valueCode = GofrTaskPermissionCodeSystem#special
* extension[attributes][0].extension[resource].valueCode = GofrTaskResourceCodeSystem#custom
* extension[attributes][0].extension[instance].valueId = "close-matching"

Instance:       gofr-role-data-manager
InstanceOf:     GofrRole
Title:          "GOFR Data Manager Role"
Usage:          #example
* code = GofrResourceCodeSystem#role
* extension[name].valueString = "Data Manager"
* extension[primary].valueBoolean = false
* extension[task][0].valueReference = Reference(Basic/gofr-task-view-search-organization)
* extension[task][1].valueReference = Reference(Basic/gofr-task-break-matched-location)
* extension[task][2].valueReference = Reference(Basic/gofr-task-accept-flagged-location)
* extension[task][3].valueReference = Reference(Basic/gofr-task-match-location)
* extension[task][4].valueReference = Reference(Basic/gofr-task-data-source-reconciliation)
* extension[task][5].valueReference = Reference(Basic/gofr-task-view-matching-status)
* extension[task][6].valueReference = Reference(Basic/gofr-task-delete-source-pair)
* extension[task][7].valueReference = Reference(Basic/gofr-task-delete-data-source)
* extension[task][8].valueReference = Reference(Basic/gofr-task-view-source-pair)
* extension[task][9].valueReference = Reference(Basic/gofr-task-deactivate-source-pair)
* extension[task][10].valueReference = Reference(Basic/gofr-task-activate-source-pair)
* extension[task][11].valueReference = Reference(Basic/gofr-task-share-source-pair)
* extension[task][12].valueReference = Reference(Basic/gofr-task-create-source-pair)
* extension[task][13].valueReference = Reference(Basic/gofr-task-share-data-source)
* extension[task][14].valueReference = Reference(Basic/gofr-task-view-data-source)
* extension[task][15].valueReference = Reference(Basic/gofr-task-add-data-source)
* extension[task][16].valueReference = Reference(Basic/gofr-task-view-add-facility-requests)
* extension[task][17].valueReference = Reference(Basic/gofr-task-view-update-facility-requests)
* extension[task][18].valueReference = Reference(Basic/gofr-task-process-update-facility-request)
* extension[task][19].valueReference = Reference(Basic/gofr-task-process-add-facility-request)
* extension[task][20].valueReference = Reference(Basic/gofr-task-view-add-healthcare-service-page)
* extension[task][21].valueReference = Reference(Basic/gofr-task-view-add-jurisdiction-page)
* extension[task][22].valueReference = Reference(Basic/gofr-task-view-add-facility-page)
* extension[task][23].valueReference = Reference(Basic/gofr-task-view-add-organization-page)
* extension[task][24].valueReference = Reference(Basic/gofr-task-view-config-page)
* extension[task][25].valueReference = Reference(Basic/gofr-task-view-search-facility-page)
* extension[task][26].valueReference = Reference(Basic/gofr-task-view-search-jurisdiction-page)
* extension[task][27].valueReference = Reference(Basic/gofr-task-view-search-service-page)
* extension[task][28].valueReference = Reference(Basic/gofr-task-view-search-organization-page)
* extension[task][29].valueReference = Reference(Basic/gofr-task-write-questionnaireresponse-resource)
* extension[task][30].valueReference = Reference(Basic/gofr-task-read-questionnaire-resource)
* extension[task][31].valueReference = Reference(Basic/gofr-task-read-practitioner-role-page-resource)
* extension[task][32].valueReference = Reference(Basic/gofr-task-read-practitioner-page-resource)
* extension[task][33].valueReference = Reference(Basic/gofr-task-read-location-resource)
* extension[task][34].valueReference = Reference(Basic/gofr-task-read-document-reference)
* extension[task][35].valueReference = Reference(Basic/gofr-task-read-value-set)
* extension[task][36].valueReference = Reference(Basic/gofr-task-read-code-system)
* extension[task][37].valueReference = Reference(Basic/gofr-task-read-structure-definition)