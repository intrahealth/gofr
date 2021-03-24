# Basics of mCSD

The [mCSD](https://www.ihe.net/uploadedFiles/Documents/ITI/IHE_ITI_Suppl_mCSD.pdf) profile describes four entities and how they exchange information and work together. Here are the key takeaways about them.

## FHIR Location and Organization

!!! tip "FHIR Resource types are often capitalized to help identify them, e.g. Location, Organization, Practitioner, Healthcare Service"

First, it is important to say that we often think of health facilities as a single concept, such as physical sites such as hospitals, clinics, health outposts, physician offices, etc. In this way of thinking, a facility has a unique identifier, geographic attributes (address, geocode), contact attributes, attributes regarding its hours of operation, etc. 

But, in FHIR there is no single facility resource, rather **each Facility is defined by a pairing of FHIR Location and FHIR Organization**. All of the attributes required can be included, but there is no 'Facility' FHIR resource.

!!! tip "A facility is defined as a FHIR Location + FHIR Organization pair"
    The key takeaway is that when thinking of a health facility, there no single FHIR resource, instead it is represented in FHIR as a Location and Organization resource pair. 

* **FHIR Locations** are physical places where care can be delivered such as facilities, buildings, wards, rooms, or vehicles. Locations also include political administrative units such as a village districts or regions. A Location has a unique identifier and may have geographic attributes (address, geocode), attributes etc. Each Location may be related to one Organization. A location may have a hierarchical relationship with other locations.

!!! tip "Locations only relate to one organization"
    The key takeaway is that a FHIR Location doesn't have enough details to describe the management side of the facility and that's where Organization comes in.

* **FHIR Organizations** are "umbrella" entities; these may be considered the administrative bodies under whose auspices care services are provided such as Healthcare Information Exchanges (HIEs), Integrated Delivery Networks (IDNs), Non-Government Organizations (NGOs), Faith-Based Organizations (FBOs) or even a one-physician family practice. An organization has a unique identifier and may have additional administrative attributes such as contact person, mailing address, etc. Departments of an institution, or other administrative units, may be represented as child Organizations of a parent Organization.

!!! tip "Organizations can have more than hierarchy, but not Locations"
    Organizations are powerful representaions, they can have more than one hierarchy in mCSD. (This requires a mCSD extension to the core FHIR spec.)

## FHIR Healthcare Services and Practitioners

* **Healthcare Service** – Each healthcare service has a unique identifier. Examples include surgical services, antenatal care services, or primary care services. The combination of a Healthcare Service offered at a Location may have specific attributes including contact person, hours of operation, etc. 

!!! tip "Think of health workers and the services they and the Locations providing them separately"

* **FHIR Practitioners** are health workers; a Practitioner might be a physician, nurse, pharmacist, community health worker, district health manager, etc. Practitioners have contact and demographic attributes. Each Practitioner may be related to one or more Organizations, one or more Locations and one or more Healthcare Services.

!!! tip "Practitioners' skillsets (Practitioner Roles) and Practitioners themselves are separate.

## How mCSD entities relate to one another

The following graphic borrowed directly from the mCSD profile shows the relationships between entities.

* The concept of a facility is really a Location and an Organization.
* Organizations and Locations may be `partOf` other Locations and Organizations.
* Services are provided by Organizations but delivered at 'Facilities'.
* Practitioners and Locations have a `managingOrganization`.

![Alt text](../img/mcsd_entities.png "mCSD entities")