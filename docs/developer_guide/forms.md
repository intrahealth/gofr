# Customize with FSH

Users may wish to customize the data entry forms. This can be done with 

[form for a location](https://github.com/intrahealth/gofr/blob/master/fshmcsd/input/fsh/GofrLocationQuestionnaire.fsh)


The first section declares an Example (InstanceOf) will be created for GofrQuestionnaire.

The second section defines a section of the form called 'Basic Details | uncategorized details'.

The third section defines the field name 'Facility Name'.

```
Instance:       GofrFacilityQuestionnaire
InstanceOf:     GofrQuestionnaire
Usage:          #definition
* title = "Add Facility"
* description = "GOFR Facility initial data entry questionnaire."
* id = "gofr-facility-questionnaire"
* url = "http://gofr.org/fhir/Questionnaire/gofr-facility-questionnaire"
* name = "gofr-facility-questionnaire"
* status = #active
* date = 2021-04-24
* purpose = "Data entry page for facilities."

* item[0].linkId = "Location"
* item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation"
* item[0].text = "Basic Details | uncategorized details"
* item[0].type = #group

* item[0].item[0].linkId = "Location.name"
* item[0].item[0].definition = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.FacilityLocation#Location.name"
* item[0].item[0].text = "Facility Name"
* item[0].item[0].type = #string
* item[0].item[0].required = true
* item[0].item[0].repeats = false
```