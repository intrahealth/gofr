/**
 * @author Ally Shaban
 * @class resource2fhirpath
 */
class Resource2FHIRPATH {
  constructor({
    resource,
    returnBoolean = false,
  }) {
    this.resource = resource;
    this.returnBoolean = returnBoolean;
    this.singleValues = ['string', 'number', 'boolean'];
    this.ignore = ['resourceType', 'meta', 'id'];
    this.isObject = obj => (!!obj) && (obj.constructor === Object);
  }

  convert() {
    const paths = [];
    const topkeys = Object.keys(this.resource);
    const { resourceType } = this.resource;
    topkeys.forEach((key) => {
      if (this.ignore.includes(key)) {
        return;
      }
      let path = '';
      const element = this.resource[key];
      if (Array.isArray(element) && this.singleValues.includes(typeof element[0])) {
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
      } else if (this.singleValues.includes(typeof element)) {
        let val = `'${element}'`;
        if (typeof element !== 'string') {
          val = element;
        }
        path = `(${resourceType}.${key} contains ${val})`;
      } else if (Array.isArray(element)) {
        const where = this.processArray(element, key);
        path += `${resourceType}.${where}`;
      }
      paths.push(path);
    });
    return paths;
  }

  processArray(element, elementkey) {
    let where = '';
    element.forEach((el) => {
      const elkeys = Object.keys(el);
      let subwhere = '';
      let subpath = '';
      elkeys.forEach((key) => {
        if (this.singleValues.includes(typeof el[key])) {
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
        } else if (Array.isArray(el[key]) && this.singleValues.includes(typeof el[key][0])) {
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
          subwhere = this.processArray(el[key], key);
        } else if (this.isObject(el[key])) {
          /*
            example
            "type": {
              "coding": [],
              "text": "Employer number"
            }
          */
          if (!subwhere) {
            subwhere += `(${this.processObject(el[key], key)})`;
          } else {
            subwhere += ` and (${this.processObject(el[key], key)})`;
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
      if (this.returnBoolean) {
        where += ').exists()';
      } else {
        where += ')';
      }
    }
    return where;
  }

  processObject(element, elementkey) {
    const objkeys = Object.keys(element);
    const path = `${elementkey}.`;
    let subpath = '';
    objkeys.forEach((objkey) => {
      if (this.singleValues.includes(typeof element[objkey])) {
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
          subpath = path + this.processArray(element[objkey], objkey);
        } else {
          subpath += ` and ${path}${this.processArray(element[objkey], objkey)}`;
        }
      } else if (this.isObject(element[objkey])) {
        if (!subpath) {
          subpath = `(${this.processObject(element[objkey], path + objkey)})`;
        } else {
          subpath += ` and (${this.processObject(element[objkey], path + objkey)})`;
        }
      }
    });
    return subpath;
  }
}

module.exports = {
  Resource2FHIRPATH,
};
