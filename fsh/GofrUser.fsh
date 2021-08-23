Profile:        GofrPersonUser
Parent:         Person
Id:             gofr-person-user
Title:          "System User"
Description:    "GOFR profile of the Person resource to manage user access."
* name 1..1 MS
* name ^label = "Name"
* name ^slicing.discriminator.type = #pattern
* name ^slicing.discriminator.path = "use"
* name ^slicing.rules = #open
* name.use = #official
* name.text 1..1 MS
* name.text ^label = "Fullname"
* telecom 2..* MS
* telecom ^label = "Telecom"
* telecom.system MS
* telecom.system ^label = "Contact Type"
* telecom.use MS
* telecom.use ^label = "Use"
* telecom.value MS
* telecom.value ^label = "Value"
* active 1..1 MS
* active ^label = "Active"
* extension contains
      organization 1..1 MS and
      role 1..1 MS and
      password 1..1 MS
* extension[password].value[x] only string
* extension[password].valueString 1..1 MS
* extension[password].valueString ^label = "Password"
* extension[role].value[x] only Reference
* extension[role].valueReference 1..1 MS
* extension[role].valueReference ^label = "Role"
* extension[organization].value[x] only Reference(Basic)
* extension[organization].valueReference 1..1 MS
* extension[organization].valueReference ^label = "Owning Organization"

Instance:       gofr-user-admin
InstanceOf:     GofrPersonUser
Title:          "GOFR Admin User"
Usage:          #example
* name.text = "GOFR Admin"
* telecom[0].system = #email
* telecom[0].value = "root@gofr.org"
* telecom[1].system = #phone
* telecom[1].value = ""
* active = true
* extension[organization].valueReference = Reference(Organization/54cdcbe3-87e0-421f-b657-8313fce5f418)
* extension[password].valueString = "$2b$08$GUhIcB0sC3CBhFi7TmZ41.B53gbrl2/.kRzlYydo8ZiZtUFSR7mjW"
* extension[role].valueReference = Reference(Basic/gofr-role-admin)
