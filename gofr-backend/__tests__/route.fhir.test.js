'use strict'
const nconf = require('nconf')
const path = require('path')
const configFilePath = path.join(__dirname, "./config/default.json")
nconf.file({file: configFilePath})

const testConfig = nconf.get('test')
const jest_setup = require('../jest-setup')
jest.mock('axios')

const DEFAULT_URL = testConfig.DEFAULT_URL
const user = require('../lib/modules/user')

const PARTITION = testConfig.PARTITION

const TEST_USER = user.restoreUser({
    resource: {resourceType: "Person"}, permissions: {
        "partitions": [{
            "name": "DEFAULT", "*": {
                "*": true
            }
        }, {
            "name": "Malawie9b41c35-7c85-46df-aeea-a4e8dbf0364e", "*": {
                "*": true
            }
        }], "special": {
            "*": true
        }, "read": {
            "StructureDefinition": true, "CodeSystem": true, "ValueSet": true, "DocumentReference": {
                "constraint": {
                    "category.exists(coding.exists(code = 'open'))": true
                }
            }
        }
    }
})
const TEST_USER_FAIL = user.restoreUser({
    resource: {resourceType: "Person"}, permissions: {}

})
const route = require('../lib/routes/fhir')


const express = require('express')
const app = express()
app.use(express.json())

const request = require("supertest")
const axios = require('../__mocks__/axios')

// Set up middleware to add mocks for anything that would exist in the request like session and user from passport
let appUser = TEST_USER
app.use((req, res, next) => {
    req.user = appUser
    next()
})

app.use('/', route)

describe('TEST /fhir routes', () => {
    const MOCK_PERSON = {
        resourceType: "Person", id: "test-person", name: [{use: "official", family: "Tester", given: ["Test", "E."]}]
    }
    const MOCK_PERSON_FAIL = {
        resourceType: "Person", id: "test-fail", name: [{use: "official", family: "Tester", given: ["Test", "E."]}]
    }
    const NOT_FOUND_OUTCOME = {
        "resourceType": "OperationOutcome", "issue": [{
            "severity": "error", "code": "exception", "diagnostics": {
                "response": "Not found"
            }
        }]
    }

    const NOTLOGGEDIN_OUTCOME = {
        resourceType: "OperationOutcome", issue: [{
            severity: "error", code: "forbidden", diagnostics: "Not logged in"
        }]
    }
    const DENIED_OUTCOME = {
        resourceType: "OperationOutcome", issue: [{
            severity: "error", code: "forbidden", diagnostics: "Access Denied"
        }]
    }

    describe('GET /:partition/:resource/:id route', () => {

        it('Should return Not found', () => {
            return request(app).get(`/${PARTITION}/StructureDefinition/mock-test`).then((response) => {
                expect(response.body).toEqual(NOT_FOUND_OUTCOME)
            })
        })

        it('Should return Not LoggedIn', () => {
            appUser = undefined
            return request(app).get(`/${PARTITION}/StructureDefinition/mock-test`).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })

        it('Should return access denied ', () => {
            appUser = TEST_USER_FAIL
            return request(app).get(`/${PARTITION}/StructureDefinition/mock-test`).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })

        it('test read StructureDefinition instance', () => {
            const MOCK_PROFILE = {
                resourceType: "StructureDefinition", id: "mock-test"
            }
            appUser = TEST_USER
            axios.__setFhirResults(DEFAULT_URL + "/StructureDefinition/mock-test", null, MOCK_PROFILE)
            return request(app).get(`/${PARTITION}/StructureDefinition/mock-test`).then((response) => {
                expect(response.body).toEqual(MOCK_PROFILE)
            })
        })

        test('test read Location without user', () => {
            appUser = null
            return request(app).get(`/${PARTITION}/Location/test-practitioner`).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })

        test('test read Person without access', () => {
            axios.__setFhirResults(DEFAULT_URL + "/Person/test-fail", null, MOCK_PERSON_FAIL)
            appUser = TEST_USER_FAIL
            return request(app).get(`/${PARTITION}/Person/test-fail`).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })
    })

    describe('GET /:partition/:resource/:params route', () => {
        test('test search CodeSystem', () => {
            const MOCK_CODESYSTEM = {
                resourceType: "Bundle", id: "mock-test", test: "test", entry: []
            }
            axios.__setFhirResults(DEFAULT_URL + "/CodeSystem", {test: "test"}, MOCK_CODESYSTEM)

            appUser = TEST_USER
            return request(app).get(`/${PARTITION}/CodeSystem`).query("test=test").then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(MOCK_CODESYSTEM)
            })
        })
        test('test search CodeSystem without user', () => {
            appUser = null
            return request(app).get(`/${PARTITION}/CodeSystem`).query("test=test").then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })
        test('test search Practitioner without access', () => {
            appUser = TEST_USER_FAIL
            return request(app).get(`/${PARTITION}/Practitioner`).query("test=test").then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })

        })
    })

    describe('test GET /:partition/ValueSet/id/$expand', () => {
        const MOCK_VALUESET_EXPANSION = {
            resourceType: "ValueSet", id: "mock-test"
        }

        test('test expand ValueSet instance', () => {
            axios.__setFhirResults(DEFAULT_URL + "/ValueSet/mock-test/$expand", null, MOCK_VALUESET_EXPANSION)
            appUser = TEST_USER
            return request(app).get(`/${PARTITION}/ValueSet/mock-test/$expand`).then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(MOCK_VALUESET_EXPANSION)
            })
        })

        test('test expand ValueSet instance without user', () => {
            appUser = null
            return request(app).get(`/${PARTITION}/ValueSet/mock-test/$expand`).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })

        test('test expand ValueSet without access', () => {
            appUser = TEST_USER_FAIL
            return request(app).get(`/${PARTITION}/ValueSet/mock-fail/$expand`).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })

        test('test expand ValueSet with field level access', () => {
            axios.__setFhirResults(DEFAULT_URL + "/ValueSet/mock-field/$expand", null, MOCK_VALUESET_EXPANSION)
            appUser = null
            return request(app).get(`/${PARTITION}/ValueSet/mock-field/$expand`).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })
    })

    describe('test POST /:partition/:resource route', () => {
        test('test create Person', () => {
            axios.__setFhirResults(DEFAULT_URL + "/Person", MOCK_PERSON, MOCK_PERSON)
            appUser = TEST_USER
            return request(app).post(`/${PARTITION}/Person`).send(MOCK_PERSON).then((response) => {
                let output = {...MOCK_PERSON}
                output.id = "1"
                expect(response.statusCode).toBe(201)
                expect(response.body).toEqual(output)
            })
        })
        test('test create Person without user', () => {
            appUser = null
            return request(app).post(`/${PARTITION}/Person`).send(MOCK_PERSON).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })
        test('test create Person without access', () => {
            axios.__setFhirResults(DEFAULT_URL + "/Person", MOCK_PERSON_FAIL, MOCK_PERSON_FAIL)
            appUser = TEST_USER_FAIL
            return request(app).post(`/${PARTITION}/Person`).send(MOCK_PERSON_FAIL).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })
    })

    describe('test PUT /:partition/:resource/:id', () => {

        test('test update resource: PUT /Person/test-person', () => {
            axios.__setFhirResults(DEFAULT_URL + "/Person/test-person", MOCK_PERSON, MOCK_PERSON)
            appUser = TEST_USER
            return request(app).put(`/${PARTITION}/Person/test-person`).send(MOCK_PERSON).then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(MOCK_PERSON)
            })
        })

        test('test create Person without user', () => {
            appUser = null
            return request(app).put(`/${PARTITION}/Person/test-person`).send(MOCK_PERSON).then((response) => {
                expect(response.statusCode).toBe(401)
                expect(response.body).toEqual(NOTLOGGEDIN_OUTCOME)
            })
        })

        test('test create Person without access', () => {
            axios.__setFhirResults(DEFAULT_URL + "/Person/test-fail", MOCK_PERSON_FAIL, MOCK_PERSON_FAIL)
            appUser = TEST_USER_FAIL
            return request(app).put(`/${PARTITION}/Person/test-fail`).send(MOCK_PERSON_FAIL).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })
    })

    describe('test GET /:partition/DocumentReference/id/$html', () => {
        const MOCK_OPEN_DOCUMENT = {
            "resourceType": "DocumentReference",
            "id": "page-test",
            "meta": {"profile": ["http://ihris.org/fhir/StructureDefinition/ihris-document"]},
            "status": "current",
            "docStatus": "final",
            "date": "2020-06-07T14:54:00Z",
            "category": [{
                "coding": [{
                    "code": "open",
                    "system": "http://ihris.org/fhir/CodeSystem/ihris-document-category",
                    "display": "Open Access"
                }]
            }],
            "content": [{
                "attachment": {
                    "contentType": "text/markdown", "title": "Testing", "data": "IyBUZXN0aW5nCg=="
                }
            }]
        }
        const MOCK_DOCUMENT = {title: "Testing", html: "<div><h1 id=\"testing\">Testing</h1>\n</div>"}
        const MOCK_RESTRICTED_DOCUMENT = {
            "resourceType": "DocumentReference",
            "id": "page-test",
            "meta": {"profile": ["http://ihris.org/fhir/StructureDefinition/ihris-document"]},
            "status": "current",
            "docStatus": "final",
            "date": "2020-06-07T14:54:00Z",
            "category": [{
                "coding": [{
                    "code": "restricted",
                    "system": "http://ihris.org/fhir/CodeSystem/ihris-document-category",
                    "display": "Open Access"
                }]
            }],
            "content": [{
                "attachment": {
                    "contentType": "text/markdown", "title": "Testing", "data": "IyBUZXN0aW5nCg=="
                }
            }]
        }

        test('test open DocumentReference to HTML instance for open user', () => {
            axios.__setFhirResults(DEFAULT_URL + "/DocumentReference/page-test", null, MOCK_OPEN_DOCUMENT)

            appUser = TEST_USER
            return request(app).get(`/${PARTITION}/DocumentReference/page-test/$html`).then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(MOCK_DOCUMENT)
            })
        })

        test('test restricted DocumentReference to HTML instance for open user', () => {
            axios.__setFhirResults(DEFAULT_URL + "/DocumentReference/page-test", null, MOCK_RESTRICTED_DOCUMENT)
            appUser = TEST_USER_FAIL
            return request(app).get(`/${PARTITION}/DocumentReference/page-test/$html`).then((response) => {
                expect(response.statusCode).toBe(403)
                expect(response.body).toEqual(DENIED_OUTCOME)
            })
        })
    })

    describe('test GET /:partition/$short-name', () => {
        const MOCK_CODE_LOOKUP = {
            "resourceType": "Parameters", "parameter": [{
                "name": "display", "valueString": "Test"
            }]
        }
        const MOCK_STANDARD_RESOURCE = {
            "resourceType": "Location", "id": "test", "name": "Test Location"
        }

        test('Lookup a codesystem value that exists', () => {
            require('axios').__setFhirResults(DEFAULT_URL + "/CodeSystem/$lookup?system=test-system&code=test", null, MOCK_CODE_LOOKUP)
            appUser = TEST_USER
            return request(app).get(`/${PARTITION}/$short-name?system=test-system&code=test`).then((response) => {
                expect(response.body).toEqual({display: "Test"})
            })
        })

        test('resource standard lookup', () => {
            require('axios').__setFhirResults(DEFAULT_URL + "/Location/test", null, MOCK_STANDARD_RESOURCE)
            appUser = TEST_USER
            return request(app).get(`/${PARTITION}/$short-name?reference=Location/test`).then((response) => {
                expect(response.body).toEqual({display: "Test Location"})
            })
        })
    })
})
