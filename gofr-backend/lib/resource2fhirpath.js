const resource = require('./delete.json');

const { resourceType } = resource;
const ignore = ['resourceType', 'meta'];
const topkeys = Object.keys(resource);
const isObject = obj => (!!obj) && (obj.constructor === Object);

const singleValues = ['string', 'number', 'boolean'];
topkeys.forEach((key) => {
  if (ignore.includes(key)) {
    return;
  }
  let path = '';
  const element = resource[key];
  if (Array.isArray(element) && singleValues.includes(typeof element[0])) {
    /*
      example
      "status": ["inactive", "suspended"]
    */
    let subpath;
    element.forEach((el) => {
      let val = `'${el}'`;
      if (typeof el !== 'string') {
        val = el;
      }
      if (!subpath) {
        subpath = `(${resourceType}.${key} contains ${val})`;
      } else {
        subpath += ` or (${resourceType}.${key} contains ${val})`;
      }
    });
    path += `${subpath}`;
  } else if (Array.isArray(element)) {
    const where = processArray(element, key);
    path += `${resourceType}.${where}`;
  }
  console.log(path);
});

function processArray(element, elementkey) {
  let where = '';
  element.forEach((el) => {
    const elkeys = Object.keys(el);
    let subwhere = '';
    let subpath = '';
    elkeys.forEach((key) => {
      if (singleValues.includes(typeof el[key])) {
        /*
          example
          "reference": "Location/68778b5c-c7ca-529f-a46e-a8069f511287"
        */
        let val = `'${el[key]}'`;
        if (typeof el[key] !== 'string') {
          val = el[key];
        }
        if (!subwhere) {
          subwhere = `${key}=${val}`;
        } else {
          subwhere += ` and ${key}=${val}`;
        }
      } else if (Array.isArray(el[key]) && singleValues.includes(typeof el[key][0])) {
        /*
          example
          "teststringarr1": ["one", "two"]
        */
        let contains = '';
        el[key].forEach((el1) => {
          let val = `'${el1}'`;
          if (typeof el1 !== 'string') {
            val = el1;
          }
          if (!contains) {
            contains = `((${key} contains ${val})`;
          } else {
            contains += ` or (${key} contains ${val})`;
          }
        });
        if (contains) {
          contains += ')';
          if (subpath) {
            subpath += ` and ${contains}`;
          } else {
            subpath += contains;
          }
        }
      } else if (Array.isArray(el[key])) {
        /*
          example
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
            "version": "2018-08-12",
            "code": "_AgentRoleType",
            "display": "AgentRoleType"
          }]
        */
        subwhere = processArray(el[key], key);
      } else if (isObject(el[key])) {
        /*
          example
          "type": {
            "coding": [],
            "text": "Employer number"
          }
        */
        if (!subwhere) {
          subwhere += `(${processObject(el[key], key)})`;
        } else {
          subwhere += ` and (${processObject(el[key], key)})`;
        }
      }
    });
    if (subwhere) {
      if (!where) {
        where += `${elementkey}.where((${subwhere})`;
      } else {
        where += ` or (${subwhere})`;
      }
    }
    if (subpath) {
      if (!where) {
        where += `${elementkey}.where((${subpath})`;
      } else {
        where += ` or (${subpath})`;
      }
    }
  });
  if (where) {
    where += ')';
  }
  return where;
}

function processObject(element, elementkey) {
  const objkeys = Object.keys(element);
  const path = `${elementkey}.`;
  let subpath = '';
  objkeys.forEach((objkey) => {
    if (singleValues.includes(typeof element[objkey])) {
      let val = `'${element[objkey]}'`;
      if (typeof element[objkey] !== 'string') {
        val = element[objkey];
      }
      if (!subpath) {
        subpath = `${path}${objkey}=${val}`;
      } else {
        subpath += ` and ${path}${objkey}=${val}`;
      }
    } else if (Array.isArray(element[objkey])) {
      if (!subpath) {
        subpath = path + processArray(element[objkey], objkey);
      } else {
        subpath += ` and ${path}${processArray(element[objkey], objkey)}`;
      }
    } else if (isObject(element[objkey])) {
      if (!subpath) {
        subpath = `(${processObject(element[objkey], path + objkey)})`;
      } else {
        subpath += ` and (${processObject(element[objkey], path + objkey)})`;
      }
    }
  });
  return subpath;
}
