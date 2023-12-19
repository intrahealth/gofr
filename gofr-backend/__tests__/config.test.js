'use strict'

const nconf = require('nconf')
const path = require('path')
const configFilePath = path.join(__dirname, "./config/default.json")
nconf.file({file: configFilePath})

const testConfig = nconf.get('test')

const jest_setup = require('../jest-setup')
const config = require("../lib/config");
jest.mock('axios')

const DEFAULT_URL = `${testConfig.DEFAULT_URL}/`

describe('Loads nconf plus base config', () => {
    const CONFIG_FILE_OUTPUT = {
        "keys": {"gofr": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdeFrJr76IQ+SYAoAIw8crZKNW\nir2re7Z7Iu+XzeYYop5+36Ux6uEQKSXo7s1xY2ou9nCkVAddZ1qehBo0e2MCtk62\nmQJbBT18fiZ3veQPvb0LC/9aFl64RuOguPrCZC+sbZLegQ6Wwf96UWyqmR49gaHO\nEdXwdFdSVyBGyS7dmwIDAQAB\n-----END PUBLIC KEY-----"},
        "additionalConfig": {"gofr-config": "gofr-config"},
        "mCSD": {
            "server": {
                "protocal": "http",
                "host": "localhost",
                "port": "8090",
                "basePath": "fhir",
                "username": "",
                "password": ""
            },
            "fakeOrgId": "eac583d2-d1ba-11e8-a8d5-f2801f1b9fd1",
            "fakeOrgName": "Taifafeki",
            "cacheTime": 1200,
            "registryDB": "DEFAULT"
        },
    }

    const CONFIG_FULL_OUTPUT = {
        "additionalConfig": {
            "gofr-config": "gofr-config"
        }, "keys": {
            "gofr": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdeFrJr76IQ+SYAoAIw8crZKNW\nir2re7Z7Iu+XzeYYop5+36Ux6uEQKSXo7s1xY2ou9nCkVAddZ1qehBo0e2MCtk62\nmQJbBT18fiZ3veQPvb0LC/9aFl64RuOguPrCZC+sbZLegQ6Wwf96UWyqmR49gaHO\nEdXwdFdSVyBGyS7dmwIDAQAB\n-----END PUBLIC KEY-----"
        }, "mCSD": {
            "server": {
                "protocal": "http",
                "host": "localhost",
                "port": "8090",
                "basePath": "fhir",
                "username": "",
                "password": ""
            },
            "fakeOrgId": "eac583d2-d1ba-11e8-a8d5-f2801f1b9fd1",
            "fakeOrgName": "Taifafeki",
            "cacheTime": 1200,
            "registryDB": "DEFAULT"
        },
    }

    const MOCK_FHIR_OBJECT = {
        "resourceType": "Parameters", "id": "gofr-config", "meta": {
            "profile": ["http://gofr.org/fhir/StructureDefinition/gofr-parameters-remote-config"]
        }, "parameter": [{
            "name": "signature", "valueSignature": {
                "type": [{
                    "code": "1.2.840.10065.1.12.1.14", "system": "urn:iso-astm:E1762-95:2013"
                }],
                "when": "2022-09-20T03:44:20.575Z",
                "who": {
                    "reference": "http://gofr.org/fhir/Organization/gofr"
                },
                "data": "Td3sLJzy//AlrMy/w+FMYkv1V2zd7vro0+sQiQK32CwXun1B9MYMTLLA214BWsOmnUhi82Dojo3Jn3U2GpPf0BCu47wlln1weYsLA169HDLkG50ch89p3YZ87TyNiNidctCaAHAQ4gz8W+X20szMZeqTkOy/EoEGW0+GuPNGbpw="
            }
        }, {
            "name": "config", "part": [{
                "name": "site:title", "valueString": "Manage"
            }, {
                "name": "site:site", "valueString": "Demo"
            }, {
                "name": "site:logo", "valueString": "iHRIS5Logo.png"
            }]
        }]
    }

    beforeEach(() => {
        require('axios').__setFhirResults(DEFAULT_URL + "Parameters/gofr-config", null, MOCK_FHIR_OBJECT)
    })

    test('Check if object contains required properties', () => {
        let additionalConfig = config.get('additionalConfig')
        let keys = config.get('keys')
        let appConfig = config.get('app')
        expect(additionalConfig).toHaveProperty('gofr-config')
        expect(keys).toHaveProperty('gofr')
        expect(appConfig).toHaveProperty('site');
        expect(appConfig.site).toHaveProperty('path');
        expect(appConfig).toHaveProperty('core');
        expect(appConfig.core).toHaveProperty('path');
    })

    test('loads default config from mock file and mock fhir server', () => {
        const nconf = require('../lib/config')
        let config = {
            additionalConfig: nconf.get('additionalConfig'), keys: nconf.get('keys'), mCSD: nconf.get('mCSD')
        }
        expect(config).toEqual(CONFIG_FILE_OUTPUT)
    })

    test('loads default config and remote config from mock fhir server', () => {
        const nconf = require('../lib/config')
        return nconf.loadRemote().then(() => {
            let config = {
                additionalConfig: nconf.get('additionalConfig'), keys: nconf.get('keys'), mCSD: nconf.get('mCSD')
            }
            expect(config).toEqual(CONFIG_FULL_OUTPUT)
        })
    })
})
