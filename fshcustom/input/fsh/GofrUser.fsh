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
      GofrOwningOrganization named organization 1..1 MS and
      GofrPassword named password 1..1 MS and
      GofrAssignRole named role 1..1 MS
* extension[password] MS
* extension[password] ^label = "Password"
* extension[role].value[x] only Reference
* extension[role].valueReference 1..1 MS
* extension[role].valueReference ^label = "Role"
* extension[organization].valueReference MS
* extension[organization].valueReference ^label = "Owning Organization"

Extension:      GofrOwningOrganization
Id:             gofr-owning-organization
Title:          "GOFR Owning Organization"
Description:    "GOFR Owning Organization"
* ^context[0].type = #element
* ^context[0].expression = "GofrPersonUser"
* value[x] only Reference
* valueReference 1..1 MS
* valueReference ^label = "Owning Organization"
* valueReference only Reference(Basic)
* valueReference.reference ^label = "Owning Organization"

Extension:      GofrPassword
Id:             gofr-password
Title:          "GOFR Password"
Description:    "GOFR password extension for local users."
* ^context.type = #element
* ^context.expression = "Person"
* extension contains
      hash 1..1 MS and
      salt 1..1 MS
* extension[hash].value[x] only string
* extension[hash].valueString ^label = "Password"
* extension[hash].valueString 1..1 MS
* extension[salt].value[x] only string
* extension[salt].valueString ^label = "Salt"
* extension[salt].valueString 1..1 MS

Instance:       pJryMYLm5MFB6Skk5EsE1m
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
* extension[password].extension[salt].valueString = "be664906fbbe50918d8cadb5ebd22093"
* extension[password].extension[hash].valueString = "727c00bcb3d604db9b807155240b97347951e5e89e4c69b823279287694501fcaa683d883f5854a05c2c50c5b31413c6bb4a5949876a42b5c5bd74247e5777fc"
* extension[role][0].valueReference = Reference(Basic/gofr-role-admin)
