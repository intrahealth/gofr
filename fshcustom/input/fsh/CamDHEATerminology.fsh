// =============================================================================
// CamDHEA Facility Registry — Terminology Definitions
// CodeSystems and ValueSets for the CamDHEA FHIR R4 Data Dictionary
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Identifier Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAIdentifierTypeCodeSystem
Id:             camdhea-identifier-type
Title:          "CamDHEA Identifier Type"
Description:    "Types of facility identifiers in the CamDHEA facility registry."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-identifier-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #LegacyHFID "Legacy HF ID" "Legacy MFL sequential identifier (H followed by 4-digit sequence)"
* #LegacyHFCode "Legacy HF Code" "Legacy MFL geographic code encoding province, OD, and sequence"
* #MoP "Ministry of Planning" "Ministry of Planning facility code"
* #HSD "HSD Facility ID" "Department of Hospital Services facility identifier for larger private facilities"
* #OWS "OWS Registration ID" "One Window Service registration identifier for smaller private facilities"

ValueSet:       CamDHEAIdentifierTypeValueSet
Id:             camdhea-identifier-type
Title:          "CamDHEA Identifier Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-identifier-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAIdentifierTypeCodeSystem

// -----------------------------------------------------------------------------
// 2. Facility Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAFacilityTypeCodeSystem
Id:             camdhea-facility-type
Title:          "CamDHEA Facility Type"
Description:    "Type of health facility as defined by the MoH facility classification framework."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-facility-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #HealthCenter "Health Center" "HC"
* #HealthCenterWithBed "Health Center with Bed" "HCB"
* #DistrictReferralHospital "District Referral Hospital" "RH"
* #ProvincialHospital "Provincial Hospital" "PH"
* #NationalHospital "National Hospital" "NH"
* #HealthPost "Health Post" "HP"
* #MedicalStore "Medical Store" "MS"
* #Warehouse "Warehouse" "WH"
* #Laboratory "Laboratory" "LAB"
* #BloodBank "Blood Bank" "BB"
* #Other "Other" "Other"

ValueSet:       CamDHEAFacilityTypeValueSet
Id:             camdhea-facility-type
Title:          "CamDHEA Facility Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAFacilityTypeCodeSystem

// -----------------------------------------------------------------------------
// 3. Facility Level
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAFacilityLevelCodeSystem
Id:             camdhea-facility-level
Title:          "CamDHEA Facility Level"
Description:    "Service delivery level indicating the minimum package of activities."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-facility-level"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #MPA "Minimum Package of Activities" "MPA"
* #CPA1 "Complementary Package of Activities Level 1" "CPA1"
* #CPA2 "Complementary Package of Activities Level 2" "CPA2"
* #CPA3 "Complementary Package of Activities Level 3" "CPA3"
* #Specialized "Specialized" "Specialized"
* #NotApplicable "Not Applicable" "Not Applicable"

ValueSet:       CamDHEAFacilityLevelValueSet
Id:             camdhea-facility-level
Title:          "CamDHEA Facility Level ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-facility-level"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAFacilityLevelCodeSystem

// -----------------------------------------------------------------------------
// 4. Ownership Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAOwnershipTypeCodeSystem
Id:             camdhea-ownership-type
Title:          "CamDHEA Ownership Type"
Description:    "Type of entity that owns or manages the facility."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-ownership-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #MOH "Ministry of Health" "MOH"
* #OtherMinistry "Other Ministry" "Other Ministry"
* #NGO "Non-Governmental Organization" "NGO"
* #FaithBased "Faith-Based Organization" "Faith-Based"
* #Private "Private" "Private"
* #DevelopmentPartner "Development Partner" "Development Partner"
* #Other "Other" "Other"

ValueSet:       CamDHEAOwnershipTypeValueSet
Id:             camdhea-ownership-type
Title:          "CamDHEA Ownership Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-ownership-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAOwnershipTypeCodeSystem

// -----------------------------------------------------------------------------
// 5. Operational Status
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAOperationalStatusCodeSystem
Id:             camdhea-operational-status
Title:          "CamDHEA Operational Status"
Description:    "Current operational condition of the facility."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-operational-status"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Operational "Operational" "Operational"
* #Closed "Closed" "Closed"
* #Suspended "Suspended" "Suspended"
* #Pending "Pending" "Pending"
* #UnderConstruction "Under Construction" "Under Construction"
* #UnderRenovation "Under Renovation" "Under Renovation"

ValueSet:       CamDHEAOperationalStatusValueSet
Id:             camdhea-operational-status
Title:          "CamDHEA Operational Status ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-operational-status"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAOperationalStatusCodeSystem

// -----------------------------------------------------------------------------
// 6. Closure Reason
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAClosureReasonCodeSystem
Id:             camdhea-closure-reason
Title:          "CamDHEA Closure Reason"
Description:    "Reason the facility ceased operations."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-closure-reason"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #MergedWithAnotherFacility "Merged with Another Facility" "Merged with Another Facility"
* #PermanentlyClosed "Permanently Closed" "Permanently Closed"
* #LicenceRevoked "Licence Revoked" "Licence Revoked"
* #NaturalDisaster "Natural Disaster" "Natural Disaster"
* #FundingCeased "Funding Ceased" "Funding Ceased"
* #Other "Other" "Other"

ValueSet:       CamDHEAClosureReasonValueSet
Id:             camdhea-closure-reason
Title:          "CamDHEA Closure Reason ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-closure-reason"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAClosureReasonCodeSystem

// -----------------------------------------------------------------------------
// 7. Licence Status
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEALicenceStatusCodeSystem
Id:             camdhea-licence-status
Title:          "CamDHEA Licence Status"
Description:    "Current licensing status of the facility."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-licence-status"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Active "Active" "Active"
* #Expired "Expired" "Expired"
* #Suspended "Suspended" "Suspended"
* #Revoked "Revoked" "Revoked"
* #Pending "Pending" "Pending"
* #NotApplicable "Not Applicable" "Not Applicable"

ValueSet:       CamDHEALicenceStatusValueSet
Id:             camdhea-licence-status
Title:          "CamDHEA Licence Status ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licence-status"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEALicenceStatusCodeSystem

// -----------------------------------------------------------------------------
// 8. Licensing Authority
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEALicensingAuthorityCodeSystem
Id:             camdhea-licensing-authority
Title:          "CamDHEA Licensing Authority"
Description:    "Authority responsible for issuing and renewing the facility licence."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-licensing-authority"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #HSD "Department of Hospital Services" "HSD — for larger private facilities"
* #OWS "One Window Service" "OWS — for smaller private facilities"
* #PHD "Provincial Health Department" "PHD"
* #NotApplicable "Not Applicable" "Not Applicable"

ValueSet:       CamDHEALicensingAuthorityValueSet
Id:             camdhea-licensing-authority
Title:          "CamDHEA Licensing Authority ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-licensing-authority"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEALicensingAuthorityCodeSystem

// -----------------------------------------------------------------------------
// 9. Schedule Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAScheduleTypeCodeSystem
Id:             camdhea-schedule-type
Title:          "CamDHEA Schedule Type"
Description:    "Type of operating schedule for a facility."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-schedule-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Regular "Regular" "Standard outpatient hours"
* #Emergency "Emergency" "24/7 emergency service availability"
* #OnCall "On-Call" "After-hours on-call availability"

ValueSet:       CamDHEAScheduleTypeValueSet
Id:             camdhea-schedule-type
Title:          "CamDHEA Schedule Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-schedule-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAScheduleTypeCodeSystem

// -----------------------------------------------------------------------------
// 10. Coordinate Accuracy
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEACoordinateAccuracyCodeSystem
Id:             camdhea-coordinate-accuracy
Title:          "CamDHEA Coordinate Accuracy"
Description:    "Method and confidence level of the GPS coordinates."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-coordinate-accuracy"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #GPSDevice "GPS Device" "Captured using GPS device"
* #MappingTool "Mapping Tool" "Captured using validated mapping tool"
* #Estimated "Estimated" "Approximate coordinates — flag for field verification"
* #Unknown "Unknown" "Method unknown — flag for field verification"

ValueSet:       CamDHEACoordinateAccuracyValueSet
Id:             camdhea-coordinate-accuracy
Title:          "CamDHEA Coordinate Accuracy ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-coordinate-accuracy"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEACoordinateAccuracyCodeSystem

// -----------------------------------------------------------------------------
// 11. Service Availability
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAServiceAvailabilityCodeSystem
Id:             camdhea-service-availability
Title:          "CamDHEA Service Availability"
Description:    "Current availability status of a health service at the facility."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-service-availability"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Available "Available" "Service is currently available at the facility"
* #Unavailable "Unavailable" "Service is not available"
* #Seasonal "Seasonal" "Service is available on a seasonal basis"
* #Referral "Referral" "Facility can initiate referral but does not deliver directly"

ValueSet:       CamDHEAServiceAvailabilityValueSet
Id:             camdhea-service-availability
Title:          "CamDHEA Service Availability ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-service-availability"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAServiceAvailabilityCodeSystem

// -----------------------------------------------------------------------------
// 12. Emergency Equipment Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEAEmergencyEquipmentTypeCodeSystem
Id:             camdhea-emergency-equipment-type
Title:          "CamDHEA Emergency Equipment Type"
Description:    "Types of emergency equipment tracked at health facilities."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-emergency-equipment-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #OxygenConcentrator "Oxygen Concentrator" "Oxygen Concentrator"
* #Ventilator "Ventilator" "Mechanical Ventilator"
* #Defibrillator "Defibrillator" "Defibrillator"
* #PatientMonitor "Patient Monitor" "Patient Monitor"
* #SuctionMachine "Suction Machine" "Suction Machine"
* #Nebulizer "Nebulizer" "Nebulizer"
* #InfusionPump "Infusion Pump" "Infusion Pump"
* #EmergencyCart "Emergency Cart" "Emergency Cart / Crash Cart"
* #Ambulance "Ambulance" "Ambulance"
* #Other "Other" "Other emergency equipment"

ValueSet:       CamDHEAEmergencyEquipmentTypeValueSet
Id:             camdhea-emergency-equipment-type
Title:          "CamDHEA Emergency Equipment Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-emergency-equipment-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEAEmergencyEquipmentTypeCodeSystem

// -----------------------------------------------------------------------------
// 13. Cadre Category
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEACadreCategoryCodeSystem
Id:             camdhea-cadre-category
Title:          "CamDHEA Cadre Category"
Description:    "Health workforce cadre categories for aggregate workforce summary."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-cadre-category"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Physician "Physician" "Physician"
* #Nurse "Nurse" "Nurse"
* #Midwife "Midwife" "Midwife"
* #Dentist "Dentist" "Dentist"
* #Pharmacist "Pharmacist" "Pharmacist"
* #AlliedHealth "Allied Health" "Allied Health Professional"
* #CommunityHealthWorker "Community Health Worker" "Community Health Worker"
* #AdministrativeSupport "Administrative Support" "Administrative and support staff"

ValueSet:       CamDHEACadreCategoryValueSet
Id:             camdhea-cadre-category
Title:          "CamDHEA Cadre Category ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-cadre-category"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEACadreCategoryCodeSystem

// -----------------------------------------------------------------------------
// 14. Catchment Computation Method
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEACatchmentComputationMethodCodeSystem
Id:             camdhea-catchment-computation-method
Title:          "CamDHEA Catchment Computation Method"
Description:    "Method used to compute catchment population count."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-catchment-computation-method"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #RegisteredPatients "Registered Patients" "Count of active HID records with matching village address"
* #EstimatedFromCensus "Estimated from Census" "Projected from national census data using village population estimates"
* #Combined "Combined" "Both methods used with registered patients as primary"

ValueSet:       CamDHEACatchmentComputationMethodValueSet
Id:             camdhea-catchment-computation-method
Title:          "CamDHEA Catchment Computation Method ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-catchment-computation-method"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEACatchmentComputationMethodCodeSystem

// -----------------------------------------------------------------------------
// 15. Sub-Facility Type
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEASubFacilityTypeCodeSystem
Id:             camdhea-sub-facility-type
Title:          "CamDHEA Sub-Facility Type"
Description:    "Type classification of sub-facility service delivery points."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-sub-facility-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Ward "Ward" "Ward"
* #IsolationUnit "Isolation Unit" "Isolation Unit"
* #EmbeddedLaboratory "Embedded Laboratory" "Embedded Laboratory"
* #MobileClinic "Mobile Clinic" "Mobile Clinic"
* #TemporaryServicePoint "Temporary Service Point" "Temporary Service Point"
* #BloodCollectionPoint "Blood Collection Point" "Blood Collection Point"
* #Other "Other" "Other"

ValueSet:       CamDHEASubFacilityTypeValueSet
Id:             camdhea-sub-facility-type
Title:          "CamDHEA Sub-Facility Type ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-sub-facility-type"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEASubFacilityTypeCodeSystem

// -----------------------------------------------------------------------------
// 16. Name Script
// -----------------------------------------------------------------------------
CodeSystem:     CamDHEANameScriptCodeSystem
Id:             camdhea-name-script
Title:          "CamDHEA Name Script"
Description:    "Script in which a facility or entity name is recorded."
* ^url = "http://camdhea.gov.kh/fhir/CodeSystem/camdhea-name-script"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* #Khmer "Khmer" "Khmer script"
* #Latin "Latin" "Latin script"

ValueSet:       CamDHEANameScriptValueSet
Id:             camdhea-name-script
Title:          "CamDHEA Name Script ValueSet"
* ^url = "http://camdhea.gov.kh/fhir/ValueSet/camdhea-name-script"
* ^version = "1.0.0"
* ^status = #active
* ^date = "2026-04-11"
* codes from system CamDHEANameScriptCodeSystem
