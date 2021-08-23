const uuidv5 = require('uuid/v5');
const uuidv4 = require('uuid/v4');
const async = require('async');
const config = require('../config');

const fhirAxios = require('./fhirAxios');
const structureDef = require('./fhirDefinition');
const logger = require('../winston');


const fhirQuestionnaire = {
  setQuestionnairePaths: (response) => {
    const replaceList = [];
    const pathSeen = {};
    const autoReplace = [];
    const currReplaceIdx = {};
    const origReplaceIdx = {};

    const processChildren = (items) => {
      for (const item of items) {
        let path = item.linkId;
        for (const replace of autoReplace) {
          path = path.replace(replace[0], replace[1]);
        }

        if (item.hasOwnProperty('item')) {
          // is a group

          const origPath = path;
          let thisIdx;
          if (path.match(/\[\d+\]$/)) {
            path = path.replace(/\[\d+\]$/, (n) => { thisIdx = n.slice(1, -1); return '[X]'; });
            currReplaceIdx[path] = path.replace(/\[X\]$/, `[${thisIdx}]`);
            origReplaceIdx[path] = currReplaceIdx[path];
            autoReplace.push([origPath, path]);
            // Doesn't matter if it's been seen when we're resetting the replace value
            for (const remove of Object.keys(pathSeen).filter(rem => rem.startsWith(path))) {
              pathSeen[remove] = false;
            }
          }
          if (path !== replaceList[0]) {
            replaceList.unshift(path);
          }
          item.definition = path;
          processChildren(item.item);
        } else {
          // is an answer
          while (!path.startsWith(replaceList[0])) {
            const ended = replaceList.shift();
            for (const remove of Object.keys(pathSeen).filter(rem => rem.startsWith(ended))) {
              pathSeen[remove] = false;
            }
            for (const replace of Object.keys(currReplaceIdx).filter(repPath => repPath.startsWith(ended))) {
              currReplaceIdx[replace] = origReplaceIdx[replace];
            }
            if (replaceList.length === 0) break;
          }
          if (replaceList.length === 0) break;

          const replaceStr = replaceList[0];
          if (pathSeen[path]) {
            currReplaceIdx[replaceList[0]] = currReplaceIdx[replaceList[0]].slice(0, -1).replace(/\d+$/, n => `${++n}]`);
            if (path !== replaceList[0]) {
              for (const remove of Object.keys(pathSeen).filter(rem => rem.startsWith(replaceList[0]))) {
                pathSeen[remove] = false;
              }
            }
          }
          pathSeen[path] = true;

          /*
          if ( currReplaceIdx[ replaceList[0] ] ) {
            path = path.replace( replaceList[0], currReplaceIdx[ replaceList[0] ] )
          }
          */
          for (const idx in replaceList) {
            if (currReplaceIdx[replaceList[idx]]) {
              path = path.replace(replaceList[idx], currReplaceIdx[replaceList[idx]]);
            }
          }
          item.definition = path;
        }
      }
    };

    processChildren(response.item);
  },
  _createBundle: (fields, questionnaireRef) => {
    const FHIR_UUID_NAMESPACE = config.get('fhir:uuid:namespace') || 'e91c9519-eccb-48a8-a506-6659b8c22518';
    const entries = {};
    let idCount = 1;
    logger.silly('FIELDS', JSON.stringify(fields, null, 2));
    for (const field of fields) {
      const paths = field.definition.split('.');
      let entry;
      let current;
      let arrayIdx = false;
      let lastElement = paths.pop();
      for (let element of paths) {
        if (!entry) {
          if (entries.hasOwnProperty(element)) {
            entry = entries[element];
          } else {
            const itemDef = questionnaireRef[element];
            const profile = itemDef.definition;
            let resourceType = element;
            if (element.endsWith(']')) {
              resourceType = element.replace(/\[\d+\]$/, n => (arrayIdx = n.slice(1, -1)) && '');
            } else {
              arrayIdx = false;
            }
            entry = {
              fullUrl: `urn:uuid:${uuidv5(`TEMP${idCount++}`, FHIR_UUID_NAMESPACE)}`,
              resource: {
                resourceType,
                meta: {
                  profile: [profile],
                },
              },
              request: {
                method: 'POST',
                url: resourceType,
              },
            };
            entries[element] = entry;
          }
          current = entry.resource;
        } else {
          if (element.endsWith(']')) {
            element = element.replace(/\[\d+\]$/, n => (arrayIdx = n.slice(1, -1)) && '');
          } else {
            arrayIdx = false;
          }
          if (!current.hasOwnProperty(element)) {
            if (arrayIdx !== false) {
              current[element] = [];
              current[element][arrayIdx] = {};
              current = current[element][arrayIdx];
            } else {
              current[element] = {};
              current = current[element];
            }
          } else if (arrayIdx !== false) {
            if (!current[element][arrayIdx]) {
              current[element][arrayIdx] = {};
            }
            current = current[element][arrayIdx];
          } else {
            current = current[element];
          }
        }
      }
      if (lastElement.endsWith(']')) {
        lastElement = lastElement.replace(/\[\d+\]$/, n => (arrayIdx = n.slice(1, -1)) && '');
      } else {
        arrayIdx = false;
      }
      if (field.hasOwnProperty('url')) {
        if (!current.hasOwnProperty(lastElement)) {
          if (arrayIdx !== false) {
            current[lastElement] = [];
          } else {
            current[lastElement] = {};
          }
        }
        if (arrayIdx !== false) {
          if (!current[lastElement][arrayIdx]) {
            current[lastElement][arrayIdx] = {};
          }
          current[lastElement][arrayIdx].url = field.url;
        } else {
          current[lastElement].url = field.url;
        }
      } else if (!current.hasOwnProperty(lastElement)) {
        if (arrayIdx !== false) {
          if (Array.isArray(field.answer)) {
            current[lastElement] = field.answer;
          } else {
            current[lastElement] = [];
            current[lastElement][arrayIdx] = field.answer || '';
          }
        } else {
          current[lastElement] = field.answer || '';
        }
      } else if (arrayIdx !== false) {
        if (Array.isArray(field.answer)) {
          if (Array.isArray(current[lastElement]) && current[lastElement].length > 0) {
            current[lastElement] = current[lastElement].concat(field.answer);
          } else {
            current[lastElement] = field.answer;
          }
        } else {
          current[lastElement][arrayIdx] = field.answer || '';
        }
      } else {
        current[lastElement] = field.answer || '';
      }
    }

    for (const field of fields) {
      const fieldPath = field.definition.split('.');
      const fieldResource = fieldPath.shift();
      if (typeof field.answer === 'string' && field.answer.startsWith('__REPLACE__')) {
        const replaceResource = field.answer.substring(11).split('.')[0];
        const replacePaths = field.answer.substring(11).split('.');
        if ((replacePaths.length === 1 || (replacePaths.length === 2 && replacePaths[1] === 'id')) && entries.hasOwnProperty(replaceResource)) {
          setNestedKey(entries[fieldResource].resource, fieldPath, { reference: entries[replaceResource].fullUrl });
        } else {
          let replaceValue;
          for (const path of replacePaths) {
            if (!replaceValue) {
              replaceValue = entries[path].resource;
            } else {
              replaceValue = replaceValue[path];
            }
          }
          setNestedKey(entries[fieldResource].resource, fieldPath, replaceValue);
        }
      }
    }

    function setNestedKey(obj, path, value) {
      if (path.length === 1) {
        obj[path] = value;
      } else {
        setNestedKey(obj[path[0]], path.slice(1), value);
      }
    }
    const bundleEntries = [];
    const isObject = obj => (!!obj) && (obj.constructor === Object);
    const recursiveFilter = (filterObj) => {
      for (const key of Object.keys(filterObj)) {
        if (isObject(filterObj[key])) {
          recursiveFilter(filterObj[key]);
        } else if (Array.isArray(filterObj[key])) {
          filterObj[key] = filterObj[key].filter(ele => ele !== null);
        }
      }
    };

    recursiveFilter(entries);

    for (const entry of Object.keys(entries)) {
      bundleEntries.push(entries[entry]);
    }
    return {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: bundleEntries,
    };
  },

  hasParentProfile: (profile, parentProfile) => new Promise((resolve, reject) => {
    let nextProfile = false;
    async.doWhilst(
      (callback) => {
        if (nextProfile) {
          profile = nextProfile;
        }
        let has = false;
        fhirAxios.search('StructureDefinition', { _id: profile, _elements: 'baseDefinition,name' }, 'DEFAULT').then((structDef) => {
          if (structDef.entry[0].resource.name !== parentProfile && structDef.entry[0].resource.baseDefinition.split('/').pop() !== 'DomainResource') {
            nextProfile = structDef.entry[0].resource.baseDefinition.split('/').pop();
          } else {
            nextProfile = false;
            if (structDef.entry[0].resource.name === parentProfile) {
              has = true;
            }
          }
          return callback(null, has);
        }).catch((err) => {
          nextProfile = false;
          return callback(err);
        });
      },
      () => nextProfile !== false,
      (error, has) => {
        if (error) {
          return reject(error);
        }
        resolve(has);
      },
    );
  }),

  processQuestionnaire: response => new Promise((resolve, reject) => {
    fhirQuestionnaire.setQuestionnairePaths(response);

    const qId = response.questionnaire.substring(response.questionnaire.lastIndexOf('/') + 1);
    fhirAxios.read('Questionnaire', qId, '', 'DEFAULT').then(async (questionnaire) => {
      const questionnaireRef = {};
      const flattenItems = (items, questionnaireRef) => {
        for (const item of items) {
          if (item.linkId.includes('#')) {
            const linkDetails = item.linkId.split('#');
            item.linkId = linkDetails[0];
          }
          questionnaireRef[item.linkId] = item;
          if (item.item) {
            flattenItems(item.item, questionnaireRef);
          }
        }
      };
      flattenItems(questionnaire.item, questionnaireRef);

      const fields = [];
      const capitalize = str => str[0].toUpperCase() + str.slice(1);

      const processItems = items => new Promise(async (resolve, reject) => {
        for (const item of items) {
          if (item.item) {
            try {
              await processItems(item.item);
            } catch (err) {
              reject(err);
            }
          } else {
            if (item.linkId.includes('#')) {
              const linkDetails = item.linkId.split('#');
              item.linkId = linkDetails[0];
            }
            const question = questionnaireRef[item.linkId];
            const simple = ['date', 'string', 'dateTime', 'text', 'attachment'];
            const data = { linkId: item.linkId, definition: item.definition, q: question.type };
            if (item.definition.includes('extension')) {
              logger.silly('EXT', question, item);
              // Check for multiple extensions so the URL can be set up.
              const paths = item.linkId.split('.');
              const dataDefs = item.definition.split('.');
              const defs = question.definition.split('.');
              // Skip the current level
              paths.pop();
              dataDefs.pop();
              // Skip the last 2 for extension and value[x] in defs
              defs.pop();
              defs.pop();
              // Start with the previous level
              let path = paths.pop();
              let dataDef = dataDefs.pop();
              let def = defs.pop();
              while (path && dataDef && def) {
                if (path.includes('extension')) {
                  const parentPath = `${paths.join('.')}.${path}`;
                  const parentDef = `${defs.join('.')}.${def}`;
                  const parentDataDef = `${dataDefs.join('.')}.${dataDef}`;
                  if (!fields.find(field => field.linkId === parentPath)) {
                    logger.silly('WOULD CHECK AND ADD', defs, def);
                    const parentExt = await structureDef.getFieldDefinition(parentDef);
                    logger.silly('PARENT', parentExt.type[0].profile);
                    let parentUrl;
                    if (parentExt.type[0].profile) {
                      parentUrl = parentExt.type[0].profile[0];
                    } else {
                      parentUrl = parentExt.sliceName;
                    }
                    fields.push({ linkId: parentPath, definition: parentDataDef, url: parentUrl });
                  }
                }
                path = paths.pop();
                dataDef = dataDefs.pop();
                def = defs.pop();
              }
              try {
                const ext = question.definition.substring(0, question.definition.lastIndexOf('.'));
                const extension = await structureDef.getFieldDefinition(ext);
                let url;
                if (extension.type[0].profile) {
                  url = extension.type[0].profile[0];
                } else {
                  url = extension.sliceName;
                }
                if (question.type === 'choice') {
                  const field = await structureDef.getFieldDefinition(question.definition);
                  logger.silly('EXTFIELD', JSON.stringify(field, null, 2));
                  if (field.type[0].code === 'code') {
                    if (question.repeats) {
                      item.answer.forEach((answer) => {
                        const extData = { ...data };
                        extData.answer = { valueCode: answer.valueCoding.code, url };
                        fields.push(extData);
                      });
                    } else {
                      data.answer = { valueCode: item.answer[0].valueCoding.code, url };
                      fields.push(data);
                    }
                  } else if (field.type[0].code === 'Coding') {
                    if (question.repeats) {
                      item.answer.forEach((answer) => {
                        const extData = { ...data };
                        extData.answer = { valueCoding: answer.valueCoding, url };
                        fields.push(extData);
                      });
                    } else {
                      data.answer = { valueCoding: item.answer[0].valueCoding, url };
                      fields.push(data);
                    }
                  } else if (field.type[0].code === 'CodeableConcept') {
                    if (question.repeats) {
                      item.answer.forEach((answer) => {
                        const extData = { ...data };
                        extData.answer = { url, valueCodeableConcept: { coding: [answer.valueCoding], text: answer.valueCoding.display } };
                        fields.push(extData);
                      });
                    } else {
                      data.answer = { url, valueCodeableConcept: { coding: [item.answer[0].valueCoding], text: item.answer[0].valueCoding.display } };
                      fields.push(data);
                    }
                  }
                } else if (question.repeats) {
                  item.answer.forEach((answer) => {
                    const extData = { ...data };
                    extData.answer = { ...answer };
                    extData.answer.url = url;
                    fields.push(extData);
                  });
                } else {
                  data.answer = { ...item.answer[0] };
                  data.answer.url = url;
                  fields.push(data);
                }
              } catch (err) {
                reject(err);
              }
            } else if (simple.includes(question.type)) {
              if (question.repeats) {
                data.answer = item.answer.map(answer => answer[`value${capitalize(question.type)}`]);
              } else {
                data.answer = item.answer[0][`value${capitalize(question.type)}`];
              }
              fields.push(data);
            } else if (question.type === 'choice') {
              try {
                const field = await structureDef.getFieldDefinition(question.definition);
                // fields[item.linkId] = { answer: item.answer, field: field.type[0] }
                // let data = { answer: item.answer, field: field.type[0], q: question.type }
                if (field.type[0].code === 'code') {
                  if (question.repeats) {
                    data.answer = item.answer.map(answer => answer.valueCoding.code);
                  } else {
                    data.answer = item.answer[0].valueCoding.code;
                  }
                } else if (field.type[0].code === 'Coding') {
                  if (question.repeats) {
                    data.answer = item.answer.map(answer => answer.valueCoding);
                  } else {
                    data.answer = item.answer[0].valueCoding;
                  }
                } else if (field.type[0].code === 'CodeableConcept') {
                  if (question.repeats) {
                    data.answer = item.answer.map(answer => ({ coding: [answer.valueCoding], text: answer.valueCoding.display }));
                  } else {
                    data.answer = { coding: [item.answer[0].valueCoding], text: item.answer[0].valueCoding.display };
                  }
                } else {
                  data.field = field.type[0];
                  data.answer = item.answer;
                }

                fields.push(data);
              } catch (err) {
                reject(err);
              }
            } else if (question.type === 'reference') {
              // Need to update this when references are fully handled
              // to work with identifier or other options besides .reference
              logger.debug('WARNING: References need to be finished in fhirQuestionnaire.js');
              data.field = 'Reference';
              if (question.repeats) {
                data.answer = item.answer.map(answer => answer.valueReference);
              } else {
                data.answer = item.answer[0].valueReference;
              }
              fields.push(data);
            } else {
              logger.error(`ERROR: questionnaire doesn't handle questions of type ${question.type} yet`);
            }
          }
        }
        resolve();
      });

      await processItems(response.item);
      logger.silly('FINISHED', JSON.stringify(fields, null, 2));
      logger.silly(fields);
      const bundle = fhirQuestionnaire._createBundle(fields, questionnaireRef);
      return resolve(bundle);
    }).catch((err) => {
      reject(err);
    });
  }),
};

module.exports = fhirQuestionnaire;
