# Global Open Facility Registry (GOFR)

This is the main repository for the next iteration of GOFR, which is based on the original codebase of the [Facility Reconciliation Tool](https://github.com/openhie/facility-recon).

The [design document](https://docs.google.com/document/d/1LGzwyxDzH6BmnVn94-V2waCmr0igIhZxxTHD-wnBX50) outlines the next steps in the creation of GOFR based on community feedback.

If you have ZenHub installed, you may view the [2021 roadmap](https://github.com/intrahealth/gofr/blob/master/LICENSE#workspaces/gofr-60495960906eba0017c751ea/roadmap?repos=346409080).

## Features
* GUI that provides value-add based on HAPI FHIR Server as the backend.
* CSV, DHIS2, and FHIR servers as data sources.
* Supports nested lists, ie. facilities that are administrative hierarchies like state->county->hospital.
* An API and backend engine that use [FHIR](https://www.hl7.org/fhir/location.html) Location resources based on the [mCSD](http://wiki.ihe.net/index.php/Mobile_Care_Services_Discovery_(mCSD)) profile.
* Modular system to extend algorithms for matching.

## Contributing and Community
- For immediate support, join the [#gofr](https://ihris.slack.com/archives/C01P3BX8FA7) channel on the iHRIS Slack team.
- For announcements and discussions, join the [Facility Registry Google Group](https://groups.google.com/forum/#!forum/facility-registry).
- For open monthly discussions, join the [OpenHIE Facility Registry Community](https://wiki.ohie.org/display/SUB/Facility+Registry+Community).
- Search through or create an [issue](https://github.com/intrahealth/gofr/issues).

## License
GOFR is distributed under the Apache 2.0 license.
