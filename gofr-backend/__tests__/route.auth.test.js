'use strict'
const nconf = require('nconf')
const path = require('path')
const configFilePath = path.join(__dirname, "./config/default.json")
nconf.file({file: configFilePath})

const testConfig = nconf.get('test')

const jest_setup = require('../jest-setup')
jest.mock('axios')

const DEFAULT_URL = testConfig.DEFAULT_URL

const request = require("supertest")
const route = require("../lib/routes/auth")

const express = require('express')
const app = express()
app.use(express.urlencoded({extended: false}))
app.use("/", route)

describe('Test Auth routes', () => {
    describe('Test Public User', () => {
        test('Test Public User setup', () => {
            const MOCK_PUBLIC_USER = {
                "resourceType": "Person", "id": "26e19ebd-65e5-4181-84b6-589bcf3bc44b", "meta": {
                    "versionId": "1", "profile": ["http://gofr.org/fhir/StructureDefinition/gofr-person-user"]
                }, "extension": [{
                    "url": "http://gofr.org/fhir/StructureDefinition/gofr-owning-organization", "valueReference": {
                        "reference": "Organization/54cdcbe3-87e0-421f-b657-8313fce5f418"
                    }
                }, {
                    "url": "http://gofr.org/fhir/StructureDefinition/gofr-password", "extension": [{
                        "url": "hash",
                        "valueString": "6906687939864f1462d52839f52c8800b9ead0aa67d050649a9eed1d9c9ffbe5d815b4d286ee2c2786d1f9781ba72df087b9a2057e8a96c4fc30e870a5cc587b"
                    }, {
                        "url": "salt", "valueString": "be664906fbbe50918d8cadb5ebd22093"
                    }]
                }, {
                    "url": "http://gofr.org/fhir/StructureDefinition/gofr-assign-role", "valueReference": {
                        "reference": "Basic/gofr-role-public"
                    }
                }], "name": [{
                    "text": "GOFR Public User"
                }], "telecom": [{
                    "system": "email", "value": "public@gofr.org"
                }, {
                    "system": "phone"
                }], "active": true
            }
            require('axios').__setFhirResults(DEFAULT_URL + "/Person/26e19ebd-65e5-4181-84b6-589bcf3bc44b", null, MOCK_PUBLIC_USER)
            return request(app).get(`/`).then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual({ok: true})
            })
        })
    })

    describe('Test Local User', () => {
        const MOCK_LOCAL_USER_LOOKUP = {
            "resourceType": "Bundle", "type": "searchset", "total": 1, "entry": [{
                "furllUrl": DEFAULT_URL + "Person/e9b41c35-7c85-46df-aeea-a4e8dbf0364e", "resource": {
                    "resourceType": "Person", "id": "e9b41c35-7c85-46df-aeea-a4e8dbf0364e", "meta": {
                        "versionId": "1",
                        "lastUpdated": "2023-11-08T10:59:50.435+00:00",
                        "source": "#fYi1xDSww6QUe05Y",
                        "profile": ["http://gofr.org/fhir/StructureDefinition/gofr-person-user"]
                    }, "extension": [{
                        "url": "http://gofr.org/fhir/StructureDefinition/gofr-owning-organization", "valueReference": {
                            "reference": "Organization/54cdcbe3-87e0-421f-b657-8313fce5f418"
                        }
                    }, {
                        "url": "http://gofr.org/fhir/StructureDefinition/gofr-password", "extension": [{
                            "url": "hash",
                            "valueString": "727c00bcb3d604db9b807155240b97347951e5e89e4c69b823279287694501fcaa683d883f5854a05c2c50c5b31413c6bb4a5949876a42b5c5bd74247e5777fc"
                        }, {
                            "url": "salt", "valueString": "be664906fbbe50918d8cadb5ebd22093"
                        }]
                    }, {
                        "url": "http://gofr.org/fhir/StructureDefinition/gofr-assign-role", "valueReference": {
                            "reference": "Basic/gofr-role-admin"
                        }
                    }], "name": [{
                        "text": "GOFR Admin"
                    }], "telecom": [{
                        "system": "email", "value": "root@gofr.org"
                    }, {
                        "system": "phone"
                    }], "active": true
                }
            }]
        }

        require('axios').__setFhirResults(DEFAULT_URL + "/Person", {telecom: "email|root@gofr.org"}, MOCK_LOCAL_USER_LOOKUP)
        test('test local user login', () => {
            return request(app).post("/login").send("username=root@gofr.org&password=gofr").then((response) => {
                expect(response.statusCode).toBe(200)
                expect(response.body.userObj.resource).toEqual(MOCK_LOCAL_USER_LOOKUP.entry[0].resource)
            })
        })

        test('test invalid password', () => {
            return request(app).post("/login").send("username=root@gofr.org&password=wrong").then((response) => {
                expect(response.statusCode).toBe(401)
            })
        })

        test('test invalid user', () => {
            const MOCK_LOCAL_MISSING = {
                "resourceType": "Bundle", "type": "searchset", "total": 0, "entry": []
            }
            require('axios').__setFhirResults(DEFAULT_URL + "/Person", {telecom: "email|notfound@gofr.org"}, MOCK_LOCAL_MISSING)
            return request(app).post("/login").send("username=notfound@gofr.org&password=wrong").then((response) => {
                expect(response.statusCode).toBe(401)
            })

        })
    })
})
