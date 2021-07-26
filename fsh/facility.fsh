Profile:      MCSDFacilityOrganization
Parent:       MCSDOrganization
Id:           IHE.mCSD.FacilityOrganization
Title:        "mCSD Organization for Facilities"
Description:  "A profile on the mCSD Organization profile for mCSD Facilities."

* type 2..*
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Facility 1..1
* type[Facility].coding 1..1
* type[Facility].coding.system = "urn:ietf:rfc:3986"
* type[Facility].coding.code = #urn:ihe:iti:mcsd:2019:facility

Profile:      MCSDFacilityLocation
Parent:       MCSDLocation
Id:           IHE.mCSD.FacilityLocation
Title:        "mCSD Location for Facilities"
Description:  "A profile on the mCSD Location profile for mCSD Facilities."

* type 2..*
* type ^slicing.discriminator.type = #value
* type ^slicing.discriminator.path = "coding.system"
* type ^slicing.rules = #open
* type ^slicing.description = "Slicing based on the system of the code."
* type contains Facility 1..1
* type[Facility].coding 1..1
* type[Facility].coding.system = "urn:ietf:rfc:3986"
* type[Facility].coding.code = #urn:ihe:iti:mcsd:2019:facility
* managingOrganization 1..1 
* managingOrganization only Reference(MCSDFacilityOrganization)
