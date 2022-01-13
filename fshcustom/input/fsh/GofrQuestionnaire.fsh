Alias: $QuestionnaireConstraint = http://hl7.org/fhir/StructureDefinition/questionnaire-constraint
Profile:          GofrQuestionnaire
Parent:           Questionnaire
Id:               gofr-questionnaire
Title:            "GOFR Questionnaire"
Description:      "GOFR Profile of the Questionnaire resource for data entry and validation."
* item.extension contains
    $QuestionnaireConstraint named constraint 0..* MS
* item.item.extension contains
    $QuestionnaireConstraint named constraint 0..* MS
* item.item.item.extension contains
    $QuestionnaireConstraint named constraint 0..* MS
* item.item.item.item.extension contains
    $QuestionnaireConstraint named constraint 0..* MS
* item.item.item.item.item.extension contains
    $QuestionnaireConstraint named constraint 0..* MS
