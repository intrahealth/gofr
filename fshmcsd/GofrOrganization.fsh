Profile:      MCSDOrganization
Parent:       Organization
Id:           IHE.mCSD.Organization
Title:        "mCSD Organization"
Description:  "A profile on the Organization resource for mCSD."

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization"
* type 1..* MS
* type ^label = "Type"
* type.coding 1..1 MS
* type.coding ^label = "Type"
* type.coding from OrganizationType (required)
* name 1..1 MS
* name ^label = "Name"
* extension contains MCSDOrganizationHierarchy named hierarchy 0..* MS
* extension[hierarchy] MS
* extension[hierarchy] ^label = "Attach To Hierarchy"
* extension[hierarchy].extension[hierarchy-type].valueCodeableConcept MS
* extension[hierarchy].extension[hierarchy-type].valueCodeableConcept.coding 1..1 MS
* extension[hierarchy].extension[hierarchy-type].valueCodeableConcept ^label = "Parent Type"
* extension[hierarchy].extension[hierarchy-type].valueCodeableConcept.coding from OrganizationHierarchyTypeValueSet (required)
* extension[hierarchy].extension[hierarchy-type].valueCodeableConcept.coding ^label = "Parent Type"
* extension[hierarchy].extension[part-of].valueReference.reference MS
* extension[hierarchy].extension[part-of].valueReference ^label = "Parent"

Extension:    MCSDOrganizationHierarchy
Id:           IHE.mCSD.hierarchy.extension
Title:        "mCSD Additional Hierarchies extension for mCSD Organization."
Description:  "If there are additional hierarchies (such as funding source),then use this extension."

* ^url = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension"
* ^context.type = #element
* ^context.expression = "MCSDOrganization"
* extension contains
            hierarchy-type 1..1 MS and
            part-of 1..1 MS
* extension[hierarchy-type].value[x] only CodeableConcept
* extension[hierarchy-type].valueCodeableConcept 1..1 MS
* extension[part-of].value[x] only Reference(MCSDOrganization or MCSDFacilityOrganization)
* extension[part-of].valueReference 1..1 MS
* extension[part-of].valueReference only Reference(MCSDOrganization or MCSDFacilityOrganization or MCSDJurisdictionOrganization)

Instance:       gofr-page-mcsd-organization
InstanceOf:     IhrisPage
Title:          "GOFR Organization Page"
Usage:          #example
* code = IhrisResourceCodeSystem#page
* extension[display].extension[resource].valueReference = Reference(StructureDefinition/IHE.mCSD.Organization)
* extension[display].extension[search][0].valueString = "Name|name"
* extension[display].extension[search][1].valueString = "Type|type[0].text"
* extension[display].extension[search][2].valueString = "Parent|partOf.reference"
* extension[display].extension[filter][0].valueString = "Name|name:contains"
* extension[section][0].extension[title].valueString = "Basic Details"
* extension[section][0].extension[description].valueString = "Basic Details"
* extension[section][0].extension[name].valueString = "Basic Details"
* extension[section][0].extension[field][0].valueString = "Organization.name"
* extension[section][0].extension[field][1].valueString = "Organization.type"
* extension[section][0].extension[field][2].valueString = "Organization.extension:hierarchy"

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
* item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization"
* item[0].text = "Basic Details | Basic Details"
* item[0].type = #group
* item[0].item[0].linkId = "Organization.name"
* item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization#Organization.name"
* item[0].item[0].text = "Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false

* item[0].item[1].linkId = "Organization.type"
* item[0].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization#Organization.type"
* item[0].item[1].text = "Type"
* item[0].item[1].type = #choice
* item[0].item[1].answerValueSet = "http://terminology.hl7.org/CodeSystem/organization-type"
* item[0].item[1].required = true
* item[0].item[1].repeats = false

* item[0].item[2].linkId = "Organization.extension[0]"
* item[0].item[2].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization#Organization.extension:hierarchy"
* item[0].item[2].text = "Attach To Hierarchy"
* item[0].item[2].type = #group
* item[0].item[2].repeats = true

* item[0].item[2].item[0].linkId = "Organization.extension[0].extension[0]#tree"
* item[0].item[2].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization#Organization.extension:hierarchy.extension:part-of.value[x]:valueReference"
* item[0].item[2].item[0].text = "Parent"
* item[0].item[2].item[0].type = #reference
* item[0].item[2].item[0].repeats = false
* item[0].item[2].item[0].required = true

* item[0].item[2].item[1].linkId = "Organization.extension[0].extension[1]"
* item[0].item[2].item[1].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization#Organization.extension:hierarchy.extension:hierarchy-type.value[x]:valueCodeableConcept"
* item[0].item[2].item[1].text = "Parent Type"
* item[0].item[2].item[1].type = #choice
* item[0].item[2].item[1].answerValueSet = "http://gofr.org/fhir/ValueSet/gofr-organization-hiearchy-type-valueset"
* item[0].item[2].item[1].repeats = false
* item[0].item[2].item[1].required = false