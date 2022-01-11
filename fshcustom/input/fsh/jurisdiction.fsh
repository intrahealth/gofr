Profile:      MCSDJurisdictionOrganization
Parent:       MCSDOrganization
Id:           IHE.mCSD.JurisdictionOrganization
Title:        "mCSD Organization for Jurisdictions"
Description:  "A profile on the mCSD Organization for mCSD Jurisdictions"

* type 2..*
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Jurisdiction 1..1
* type[Jurisdiction].coding 1..1
* type[Jurisdiction].coding.system = "urn:ietf:rfc:3986"
* type[Jurisdiction].coding.code = #urn:ihe:iti:mcsd:2019:jurisdiction

Profile:      MCSDJurisdictionLocation
Parent:       MCSDLocation
Id:           IHE.mCSD.JurisdictionLocation
Title:        "mCSD Location for Jurisdictions"
Description:  "A profile on the mCSD Location for mCSD Jurisdictions"

* type 2..*
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Jurisdiction 1..1
* type[Jurisdiction].coding 1..1
* type[Jurisdiction].coding.system = "urn:ietf:rfc:3986"
* type[Jurisdiction].coding.code = #urn:ihe:iti:mcsd:2019:jurisdiction
* managingOrganization 1..1
* managingOrganization only Reference(MCSDJurisdictionOrganization)
* extension contains $BOUNDARY named boundary 0..*
* extension[boundary].valueAttachment 1..1
* extension[boundary].valueAttachment.contentType = #application/geo+json
* extension[boundary].valueAttachment.data 1..1
