Profile:        GofrMcsdOrganization
Parent:         MCSDOrganization
Id:             gofr-mcsd-organization
Title:          "GOFR Organization"
Description:    "GOFR Profile of mCSD Organization to manage organizations."
* type 1..1 MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from OrganizationType (required)
* name 1..1 MS
* name ^label = "Name"
* extension contains GOFRMCSDOrganizationHierarchy named gofr-hierarchy 0..* MS
* extension[gofr-hierarchy] MS
* extension[gofr-hierarchy] ^label = "Attach To Hierarchy"
* extension[gofr-hierarchy].extension[hierarchy-type].valueCodeableConcept MS
* extension[gofr-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding 1..1 MS
* extension[gofr-hierarchy].extension[hierarchy-type].valueCodeableConcept ^label = "Parent Type"
* extension[gofr-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding from OrganizationHierarchyTypeValueSet (required)
* extension[gofr-hierarchy].extension[hierarchy-type].valueCodeableConcept.coding ^label = "Parent Type"
* extension[gofr-hierarchy].extension[part-of].valueReference.reference MS
* extension[gofr-hierarchy].extension[part-of].valueReference ^label = "Parent"

Extension:    GOFRMCSDOrganizationHierarchy
Parent:       MCSDOrganizationHierarchy
Id:           GOFR.IHE.mCSD.OrganizationHierarchy
Title:        "mCSD Additional Hierarchies extension for mCSD Organization."
Description:  "If there are additional hierarchies (such as funding source),then use this extension."
* extension[part-of].value[x] only Reference(GofrMcsdOrganization or GofrMcsdFacilityOrganization)
* extension[part-of].valueReference 1..1 MS
* extension[part-of].valueReference only Reference(GofrMcsdOrganization or GofrMcsdFacilityOrganization)

Instance:       gofr-page-mcsd-organization
InstanceOf:     IhrisPage
Title:          "GOFR Organization Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/gofr-mcsd-organization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[search][1].valueString = "Type|type[0].text"
* extension[display].extension[search][2].valueString = "Parent|partOf.reference"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"
* extension[section][0].extension[field][1].valueString = "Organization.type"
* extension[section][0].extension[field][2].valueString = "Organization.extension:gofr-hierarchy"

Instance:       GofrOrganizationQuestionnaire
InstanceOf:     IhrisQuestionnaire
Usage:          #definition
* title = "GOFR Organization Questionnaire"
* description = "iHRIS Organization initial data entry questionnaire."
* id = "gofr-organization-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-organization-questionnaire"
* name = "gofr-organization-questionnaire"
* status = #active
* date = 2021-07-19
* purpose = "Data entry page for organizations."
* item[0].linkId = "Organization"
* item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization"
* item[0].text = "Basic Details | Basic Details"
* item[0].type = #group
* item[0].item[0].linkId = "Organization.name"
* item[0].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization#Organization.name"
* item[0].item[0].text = "Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Organization.type"
* item[0].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization#Organization.type"
* item[0].item[1].text = "Type"
* item[0].item[1].type = #choice
* item[0].item[1].answerValueSet = "http://terminology.hl7.org/CodeSystem/organization-type"
* item[0].item[1].required = true
* item[0].item[1].repeats = false

* item[0].item[2].linkId = "Organization.extension[0]"
* item[0].item[2].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization#Organization.extension:gofr-hierarchy"
* item[0].item[2].text = "Attach To Hierarchy"
* item[0].item[2].type = #group
* item[0].item[2].repeats = true

* item[0].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[0].item[2].item[0].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization#Organization.extension:gofr-hierarchy.extension:part-of.value[x]:valueReference"
* item[0].item[2].item[0].text = "Parent"
* item[0].item[2].item[0].type = #reference
* item[0].item[2].item[0].repeats = false
* item[0].item[2].item[0].required = true

* item[0].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[0].item[2].item[1].definition = "http://gofr.org/fhir/StructureDefinition/gofr-mcsd-organization#Organization.extension:gofr-hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[0].item[2].item[1].text = "Parent Type"
* item[0].item[2].item[1].type = #choice
* item[0].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[0].item[2].item[1].repeats = false
* item[0].item[2].item[1].required = false