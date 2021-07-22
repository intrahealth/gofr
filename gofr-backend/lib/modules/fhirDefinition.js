const fhirWrapper = require('../fhirWrapper');

let cache = {};

const fhirDefinition = {
  _getFieldDefinition: (fieldId, structureDef) => new Promise((resolve, reject) => {
    // take [#] off of fieldId here
    fieldId = fieldId.replace(/\[\d+\]/g, '');
    let field = structureDef.snapshot.element.find(element => element.id === fieldId);
    if (field) {
      resolve(field);
    } else {
      let found = false;
      const fieldSplit = fieldId.split('.');
      const remainder = [];
      let count = 0;
      while (!found) {
        if (count++ > 50) reject(`Failed to find ${fieldId} in ${structureDef.url}`);
        remainder.unshift(fieldSplit.pop());
        field = structureDef.snapshot.element.find(element => element.id === fieldSplit.join('.'));
        if (field) found = true;
      }
      const subExpression = `http://hl7.org/fhir/StructureDefinition/${field.type[0].code}#${field.type[0].code}.${remainder.join('.')}`;
      fhirDefinition.getFieldDefinition(subExpression).then((field) => {
        resolve(field);
      }).catch((err) => {
        reject(err);
      });
    }
  }),
  camelToKebab: code => code.replace(/([a-z0-9]|[A-Z]+)([A-Z])/g, '$1-$2').toLowerCase(),
  getFieldDefinition: expression => new Promise((resolve, reject) => {
    const exp = expression.split('#');
    const defId = exp[0].substring(exp[0].lastIndexOf('/') + 1);
    if (!cache.hasOwnProperty(exp[0])) {
      fhirWrapper.getResource({
        resource: 'StructureDefinition',
        id: defId,
      }).then((resource) => {
        cache[exp[0]] = resource;
        fhirDefinition._getFieldDefinition(exp[1], cache[exp[0]]).then((field) => {
          resolve(field);
        });
      }).catch((err) => {
        reject(err);
      });
    } else {
      fhirDefinition._getFieldDefinition(exp[1], cache[exp[0]]).then((field) => {
        resolve(field);
      });
    }
  }),
  parseStructureDefinition: (resource) => {
    if (!resource.hasOwnProperty('snapshot')) {
      return false;
    }
    const structure = {};
    const ms = resource.snapshot.element.filter(ele => ele.mustSupport);
    for (const ele of ms) {
      const levels = ele.id.split('.');

      let piece = structure;
      for (const idx in levels) {
        const field = levels[idx];
        if (!piece.hasOwnProperty(field)) {
          piece[field] = {};
        }
        if (idx < levels.length - 1) {
          if (!piece[field].hasOwnProperty('fields')) {
            piece[field].fields = {};
          }
          piece = piece[field].fields;
        } else {
          piece = piece[field];
          piece.field = field;
        }
      }

      const copies = ['id', 'path', 'label', 'sliceName', 'min', 'max', 'constraint'];
      for (const copy of copies) {
        if (ele.hasOwnProperty(copy)) {
          piece[copy] = ele[copy];
        } else if (ele.base.hasOwnProperty(copy)) {
          piece[copy] = ele.base[copy];
        }
      }

      const min_max_copies = ['Date', 'DateTime', 'Instant', 'Time', 'Decimal', 'Integer',
        'PositiveInt', 'UnsignedInt', 'Quantity'];
      for (const copy of min_max_copies) {
        for (const type of ['min', 'max']) {
          const prop = `${type}Value${copy}`;
          if (ele.hasOwnProperty(prop)) {
            piece[prop] = ele[prop];
          } else if (ele.base.hasOwnProperty(prop)) {
            piece[prop] = ele.base[prop];
          }
        }
      }

      for (const copy of ['min', 'max']) {
        if (ele.base.hasOwnProperty(copy)) {
          piece[`base-${copy}`] = ele.base[copy];
        }
      }

      if (ele.type[0].hasOwnProperty('code')) {
        piece.code = ele.type[0].code;
      }
      const types = ['profile', 'targetProfile'];
      for (const type of types) {
        if (ele.type[0].hasOwnProperty(type) && ele.type[0][type][0]) {
          piece[type] = ele.type[0][type][0];
        }
      }

      if (ele.hasOwnProperty('binding') && ele.binding.hasOwnProperty('valueSet')) {
        piece.binding = ele.binding.valueSet;
      }
    }
    return structure;
  },
  parseCodeSystem: (resource) => {
    const structure = {
      CodeSystem: {
        fields: {
          code: {
            field: 'code',
            id: 'CodeSystem.code',
            path: 'CodeSystem.code',
            label: 'Code',
            min: 1,
            max: '1',
            'base-min': 1,
            'base-max': '1',
            code: 'string',
          },
          display: {
            field: 'display',
            id: 'CodeSystem.display',
            path: 'CodeSystem.display',
            label: 'Display',
            min: 1,
            max: '1',
            'base-min': 1,
            'base-max': '1',
            code: 'string',
          },
          definition: {
            field: 'definition',
            id: 'CodeSystem.definition',
            path: 'CodeSystem.definition',
            label: 'Definition',
            min: 0,
            max: '1',
            'base-min': 0,
            'base-max': '1',
            code: 'string',
          },
        },
      },
    };
    const piece = structure.CodeSystem.fields;
    if (resource.hasOwnProperty('property')) {
      for (const prop of resource.property) {
        piece[prop.code] = {
          field: prop.code,
          id: `CodeSystem.property.${prop.code}`,
          path: `CodeSystem.property.${prop.code}`,
          label: prop.description,
          min: 0,
          max: '1',
          'base-min': 0,
          'base-max': '1',
          code: prop.type,
        };
        if (prop.uri) {
          piece[prop.code].binding = prop.uri;
        }
      }
    }
    return structure;
  },
  resetCache: () => {
    cache = {};
  },
};

module.exports = fhirDefinition;
