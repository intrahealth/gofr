const async = require('async');
const fhirpath = require('fhirpath');
const fhirAxios = require('./fhirAxios');
const logger = require('../winston');
const mixin = require('../mixin');

const getSources = ({ isAdmin = false, orgId, userID }) => new Promise((resolve, reject) => {
  let resources = [];
  async.parallel({
    owning: (callback) => {
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
        // if not admin
      if (!isAdmin) {
        searchParams.partitionowner = `Person/${userID}`;
      }
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
        if (data.entry) {
          resources = resources.concat(data.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
    sharedUser: (callback) => {
      if (isAdmin) {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitionshareduser: `Person/${userID}`,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
    sharedAll: (callback) => {
      if (isAdmin) {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitionshareall: true,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
    sameOrgid: (callback) => {
      if ((isAdmin) || !orgId) {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitiondhis2orgid: orgId,
        partitionsharesameorgid: true,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      console.log(searchParams);
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        logger.error(JSON.stringify(parts.entry, 0, 2));
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
  }, (err) => {
    if (err) {
      return reject(err);
    }
    const sources = [];
    if (resources.length > 0) {
      const partsRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const sourcesRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource'));
      const usersRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-person-user'));
      sourcesRes.forEach((entry) => {
        const exists = sources.find(src => src.id === entry.resource.id);
        if (exists) {
          return;
        }
        const dsDetails = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
        const sourceExt = mixin.flattenExtension(dsDetails.extension);
        const partId = sourceExt['http://gofr.org/fhir/StructureDefinition/partition'].reference;
        const partRes = partsRes.find(part => part.resource.id === partId.split('/')[1]);
        const partDetails = partRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
        const partExt = mixin.flattenExtension(partDetails.extension);
        const userId = partExt['http://gofr.org/fhir/StructureDefinition/owner'][0].find(ext => ext.url === 'userID').valueReference.reference;
        const owner = usersRes.find(usr => usr.resource.id === userId.split('/')[1]).resource.name[0].text;

        const whereShareToAll = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareToAll')";
        const _shareToAll = fhirpath.evaluate(partRes.resource, whereShareToAll);
        const shareToAll = {};
        _shareToAll.forEach((shall) => {
          let activated = shall.extension && shall.extension.find((ext) => {
            return ext.url === 'activated'
          })?.valueBoolean
          let limitActivated = shall.extension && shall.extension.find((ext) => {
            return ext.url === 'limitByUserLocation'
          })?.valueBoolean
          if (activated) {
            shareToAll.activated = activated;
          } else {
            shareToAll.activated = false;
          }
          if (limitActivated) {
            shareToAll.limitByUserLocation = limitActivated;
          } else {
            shareToAll.limitByUserLocation = false;
          }
        });

        const whereSharedUsers = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser')";
        const _sharedUsers = fhirpath.evaluate(partRes.resource, whereSharedUsers);
        const sharedUsers = [];
        _sharedUsers.forEach((shareduser) => {
          const user = shareduser.extension.find(ext => ext.url === 'user');
          const locationLimits = shareduser.extension.filter(ext => ext.url === 'locationLimit');
          const userpermissions = shareduser.extension.filter(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/userpermission');
          const limits = [];
          locationLimits.forEach((limit) => {
            limits.push(limit.valueReference.reference);
          });
          const permissions = {};
          userpermissions.forEach((permission) => {
            const resource = permission.extension.find(ext => ext.url === 'resource');
            const constraint = permission.extension.find(ext => ext.url === 'constraint');
            const resourcepermissions = permission.extension.filter(ext => ext.url === 'permission');
            resourcepermissions.forEach((resPerm) => {
              if (!permissions[resPerm.valueCode]) {
                permissions[resPerm.valueCode] = {};
              }
              if (constraint) {
                permissions[resPerm.valueCode][resource.valueCode] = {
                  constraint: {},
                };
                permissions[resPerm.valueCode][resource.valueCode].constraint[constraint.valueString] = true;
              } else {
                permissions[resPerm.valueCode][resource.valueCode] = true;
              }
            });
          });
          const userid = user.valueReference.reference.split('/')[1];
          sharedUsers.push({
            id: userid,
            name: usersRes.find(usr => usr.resource.id === userid).resource.name[0].text,
            limits,
            permissions,
          });
        });
        const generatedFrom = fhirpath.evaluate(
          dsDetails,
          "extension.where(url='http://gofr.org/fhir/StructureDefinition/generatedFrom').valueString",
        );
        const source = {
          id: entry.resource.id,
          partitionID: partId.split('/')[1],
          source: sourceExt['http://gofr.org/fhir/StructureDefinition/source'],
          autoSync: sourceExt['http://gofr.org/fhir/StructureDefinition/autoSync'],
          sourceType: sourceExt['http://gofr.org/fhir/StructureDefinition/sourceType'],
          generatedFrom,
          name: partExt['http://gofr.org/fhir/StructureDefinition/name'],
          display: sourceExt['http://gofr.org/fhir/StructureDefinition/name'],
          username: sourceExt['http://gofr.org/fhir/StructureDefinition/username'],
          password: sourceExt['http://gofr.org/fhir/StructureDefinition/password'],
          host: sourceExt['http://gofr.org/fhir/StructureDefinition/host'],
          owner,
          sharedUsers,
          shareToAll,
          userID: userId.split('/')[1],
          createdTime: partExt['http://gofr.org/fhir/StructureDefinition/createdTime'],
        };
        sources.push(source);
      });
    }
    resolve(sources);
  });
});

module.exports = {
  getSources,
};
