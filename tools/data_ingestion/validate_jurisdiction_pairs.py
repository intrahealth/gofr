#!/usr/bin/env python3
"""
Validate that jurisdictions are represented as paired Location + Organization
resources in the target FHIR partition.

Usage:
  python3 tools/data_ingestion/validate_jurisdiction_pairs.py

Environment:
  FHIR_BASE_URL  Base FHIR URL without partition suffix. Defaults to
                 http://localhost:8080/fhir
  PARTITION      Target partition name. Defaults to DEFAULT

The script exits with code 1 when any jurisdiction pair is incomplete or does
not carry the required jurisdiction codings.
"""

import json
import os
import sys
import urllib.error
import urllib.request

FHIR_BASE_URL = os.environ.get("FHIR_BASE_URL", "http://localhost:8080/fhir").rstrip("/")
PARTITION = os.environ.get("PARTITION", "DEFAULT")
FHIR_BASE = f"{FHIR_BASE_URL}/{PARTITION}"

JURISDICTION_TYPE_SYS = "http://gofr.org/fhir/CodeSystem/gofr-jurisdiction-type"
IHE_URI_SYS = "urn:ietf:rfc:3986"
IHE_JURISDICTION_CODE = "urn:ihe:iti:mcsd:2019:jurisdiction"
JURISDICTION_LOCATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionLocation"
JURISDICTION_ORGANIZATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.JurisdictionOrganization"
ORGANIZATION_PROFILE = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.Organization"
GOFR_JURISDICTION_PROFILE = "http://gofr.org/fhir/StructureDefinition/gofr-jurisdiction"
ORG_HIERARCHY_EXT = "http://ihe.net/fhir/StructureDefinition/IHE.mCSD.hierarchy.extension"
ORG_HIERARCHY_TYPE_SYS = "http://gofr.org/fhir/CodeSystem/gofr-organization-hiearchy-type-codesystem"


def fetch_json(url):
    request = urllib.request.Request(url, headers={"Accept": "application/fhir+json, application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def read_resource(resource_type, resource_id):
    try:
        return fetch_json(f"{FHIR_BASE}/{resource_type}/{resource_id}")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def iter_locations():
    next_url = f"{FHIR_BASE}/Location?_count=100"
    while next_url:
        bundle = fetch_json(next_url)
        for entry in bundle.get("entry", []):
            resource = entry.get("resource")
            if resource and resource.get("resourceType") == "Location":
                yield resource
        next_url = None
        for link in bundle.get("link", []):
            if link.get("relation") == "next":
                next_url = link.get("url")
                break


def profiles(resource):
    return resource.get("meta", {}).get("profile", [])


def type_entries(resource):
    return resource.get("type", []) or []


def has_type_coding(resource, system, code=None):
    for type_entry in type_entries(resource):
        for coding in type_entry.get("coding", []) or []:
            if coding.get("system") != system:
                continue
            if code is None or coding.get("code") == code:
                return True
    return False


def is_jurisdiction(location):
    if JURISDICTION_LOCATION_PROFILE in profiles(location):
        return True
    if has_type_coding(location, IHE_URI_SYS, IHE_JURISDICTION_CODE):
        return True
    if has_type_coding(location, JURISDICTION_TYPE_SYS):
        return True
    return False


def find_hierarchy_extensions(organization):
    return [
        extension
        for extension in organization.get("extension", []) or []
        if extension.get("url") == ORG_HIERARCHY_EXT
    ]


def find_subextension(extension, url):
    for subextension in extension.get("extension", []) or []:
        if subextension.get("url") == url:
            return subextension
    return None


def validate_hierarchy(location, organization, errors):
    parent_ref = location.get("partOf", {}).get("reference")
    if not parent_ref:
        return
    if not parent_ref.startswith("Location/"):
        errors.append(
            f"Location/{location['id']} has unexpected partOf reference format: {parent_ref}"
        )
        return

    expected_parent_org_ref = f"Organization/org-{parent_ref.split('/', 1)[1]}"
    hierarchy_extensions = find_hierarchy_extensions(organization)
    if not hierarchy_extensions:
        errors.append(
            f"Organization/{organization['id']} missing {ORG_HIERARCHY_EXT} for parent {expected_parent_org_ref}"
        )
        return

    for hierarchy_extension in hierarchy_extensions:
        part_of = find_subextension(hierarchy_extension, "part-of")
        hierarchy_type = find_subextension(hierarchy_extension, "hierarchy-type")
        part_of_ref = (part_of or {}).get("valueReference", {}).get("reference")
        if hierarchy_type:
            coding = ((hierarchy_type.get("valueCodeableConcept") or {}).get("coding") or [{}])[0]
        else:
            coding = {}
        if (
            part_of_ref == expected_parent_org_ref
            and coding.get("system") == ORG_HIERARCHY_TYPE_SYS
            and coding.get("code") == "operational"
        ):
            return

    errors.append(
        f"Organization/{organization['id']} hierarchy does not mirror Location/{location['id']} parent {expected_parent_org_ref}"
    )


def validate_location(location, errors):
    if JURISDICTION_LOCATION_PROFILE not in profiles(location):
        errors.append(f"Location/{location['id']} missing {JURISDICTION_LOCATION_PROFILE}")
    if GOFR_JURISDICTION_PROFILE not in profiles(location):
        errors.append(f"Location/{location['id']} missing {GOFR_JURISDICTION_PROFILE}")
    if not has_type_coding(location, JURISDICTION_TYPE_SYS):
        errors.append(f"Location/{location['id']} missing local jurisdiction type coding")
    if not has_type_coding(location, IHE_URI_SYS, IHE_JURISDICTION_CODE):
        errors.append(f"Location/{location['id']} missing IHE jurisdiction URI coding")


def validate_organization(location, organization, errors):
    if organization is None:
        errors.append(f"Location/{location['id']} missing Organization/org-{location['id']}")
        return
    if JURISDICTION_ORGANIZATION_PROFILE not in profiles(organization):
        errors.append(
            f"Organization/{organization['id']} missing {JURISDICTION_ORGANIZATION_PROFILE}"
        )
    if ORGANIZATION_PROFILE not in profiles(organization):
        errors.append(f"Organization/{organization['id']} missing {ORGANIZATION_PROFILE}")
    if not has_type_coding(organization, JURISDICTION_TYPE_SYS):
        errors.append(f"Organization/{organization['id']} missing local jurisdiction type coding")
    if not has_type_coding(organization, IHE_URI_SYS, IHE_JURISDICTION_CODE):
        errors.append(f"Organization/{organization['id']} missing IHE jurisdiction URI coding")
    validate_hierarchy(location, organization, errors)


def main():
    errors = []
    jurisdiction_count = 0

    organization_cache = {}
    for location in iter_locations():
        if not is_jurisdiction(location):
            continue

        jurisdiction_count += 1
        validate_location(location, errors)

        expected_org_id = f"org-{location['id']}"
        expected_org_ref = f"Organization/{expected_org_id}"
        actual_org_ref = location.get("managingOrganization", {}).get("reference")
        if actual_org_ref != expected_org_ref:
            errors.append(
                f"Location/{location['id']} managingOrganization is {actual_org_ref!r}, expected {expected_org_ref!r}"
            )

        if expected_org_id not in organization_cache:
            organization_cache[expected_org_id] = read_resource("Organization", expected_org_id)
        validate_organization(location, organization_cache[expected_org_id], errors)

    if errors:
        print(f"Validation FAILED for {jurisdiction_count} jurisdictions with {len(errors)} issues:\n")
        for issue in errors:
            print(f"- {issue}")
        sys.exit(1)

    print(
        f"Validation passed: {jurisdiction_count} jurisdictions have canonical Location + Organization pairs in partition {PARTITION}."
    )


if __name__ == "__main__":
    main()