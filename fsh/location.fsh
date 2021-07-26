Profile:      MCSDLocation
Parent:       Location
Id:           IHE.mCSD.Location
Title:        "mCSD Location"
Description:  "A profile on the Location resource for mCSD."

* type 1..*
* physicalType 1..1
* name 1..1
* status 1..1

Profile:      MCSDLocationDistance
Parent:       MCSDLocation
Id:           IHE.mCSD.LocationDistance
Title:        "mCSD Location with Distance"
Description:  "A profile on the mCSD Location resource for distance searches."

* position 1..1
