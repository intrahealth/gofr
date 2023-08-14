const deepmerge = require('deepmerge');
const crypto = require('crypto');
const express = require('express');

const router = express.Router();
const config = require('../config');

const fhirAxios = require('../modules/fhirAxios');

const outcomes = require('../../config/operationOutcomes');
const fhirDefinition = require('../modules/fhirDefinition');
const mixin = require('../mixin');
const logger = require('../winston');

const getUKey = () => Math.random().toString(36).replace(/^[^a-z]+/, '') + Math.random().toString(36).substring(2, 15);

const getDefinition = (resource) => {
  const structureDef = resource.split('/');
  return fhirAxios.read(structureDef[0], structureDef[1], '', 'DEFAULT');
};
const profileResources = {};
const getProfileResource = profile => new Promise((resolve, reject) => {
  const id = profile.substring(profile.lastIndexOf('/') + 1);
  if (profileResources.hasOwnProperty(id)) {
    resolve(profileResources[id]);
  } else {
    getDefinition(`StructureDefinition/${id}`).then((resource) => {
      if (resource.type) {
        profileResources[id] = resource.type;
        resolve(resource.type);
      } else {
        logger.error(`Unable to get resource type from structure definition ${id}`);
        reject(new Error(`Unable to get resource.type for ${id}`));
      }
    }).catch((err) => {
      logger.error(`Unable to get structure definition for ${id}`);
      reject(err);
    });
  }
});

const setupOrder = (fields, sectionOrder) => {
  for (const ord of fields) {
    const lastDot = ord.lastIndexOf('.');
    const ordId = ord.substring(0, lastDot);
    const ordField = ord.substring(lastDot + 1);
    if (!sectionOrder.hasOwnProperty(ordId)) {
      sectionOrder[ordId] = [];
    }
    sectionOrder[ordId].push(ordField);
  }
};

router.get('/questionnaire/:questionnaire', (req, res) => {
  // const allowed = req.user.hasPermissionByName('read', 'Questionnaire', req.params.questionnaire);
  // // Limited access to these don't make sense so not allowing it for now
  // if (allowed !== true) {
  //   return res.status(403).json(outcomes.DENIED);
  // }
  fhirAxios.read('Questionnaire', req.params.questionnaire, '', 'DEFAULT').then(async (resource) => {
    let vueOutput = `<gofr-questionnaire :edit=\"isEdit\" :view-page="viewPage" :constraints="constraints" url="${resource.url}" id="${resource.id}" title="${resource.title
    }" description="${resource.description}" purpose="${resource.purpose
    }"__SECTIONMENU__>` + '\n';
    vueOutput += `<gofr-page-title title="${resource.title}"></gofr-page-title>`;
    const sectionMenu = [];
    const templateData = { sectionMenu: {}, hidden: {}, constraints: {} };

    const processConstraints = (extension, fieldDef) => {
      const constraintKeys = [];
      if (fieldDef && fieldDef.hasOwnProperty('constraint')) {
        for (const constraint of fieldDef.constraint) {
          if (constraint.key && constraint.key.startsWith('gofr-')) {
            templateData.constraints[constraint.key] = constraint;
            constraintKeys.push(constraint.key);
          }
        }
      }
      if (extension) {
        const itemConstraints = extension.filter(ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-constraint');
        for (const itemCon of itemConstraints) {
          let constraint = {};
          try {
            const key = itemCon.extension.find(ext => ext.url === 'key').valueId;
            const severity = itemCon.extension.find(ext => ext.url === 'severity').valueCode;
            const expression = itemCon.extension.find(ext => ext.url === 'expression').valueString;
            const human = itemCon.extension.find(ext => ext.url === 'human').valueString;
            if (key.startsWith('gofr-')) {
              constraint = {
                key, severity, expression, human,
              };
              templateData.constraints[constraint.key] = constraint;
              constraintKeys.push(constraint.key);
            }
          } catch (err) {
            logger.error(`Failed to get constraints on ${item.linkId}`);
            logger.error(err.message);
          }
        }
      }
      if (constraintKeys.length > 0) {
        return constraintKeys.join(',');
      }
      return null;
    };
    const processQuestionnaireItems = async (items) => {
      let vueOutput = '';
      for (const item of items) {
        let displayType;
        if (item.linkId.includes('#')) {
          const linkDetails = item.linkId.split('#');
          item.linkId = linkDetails[0];
          displayType = linkDetails[1];
        }
        if (item.repeats && !item.readOnly) {
          vueOutput += `<gofr-array :edit="isEdit" path="${item.linkId}" label="${
            item.text}" max="*" min="${item.required ? '1' : '0'}"><template #default="slotProps">\n`;
        }
        const itemType = fhirDefinition.camelToKebab(item.type);
        if (itemType === 'group') {
          const label = item.text.split('|', 2);
          vueOutput += `<gofr-questionnaire-group :edit=\"isEdit\" path="${item.linkId}" label="${label[0]}"`;
          if (label.length === 2) {
            vueOutput += ` description="${label[1]}"`;
          }
          if (item.extension) {
            const constraintList = processConstraints(item.extension);
            if (constraintList) {
              vueOutput += ` constraints="${constraintList}"`;
            }
          }
          vueOutput += '>\n\n';
          vueOutput += await processQuestionnaireItems(item.item);
          vueOutput += '</gofr-questionnaire-group>\n';
        } else if (item.readOnly) {
          vueOutput += `<gofr-hidden path="${item.linkId}" label="${
            item.text}"`;
          if (item.answerOption[0].initialSelected) {
            const answerTypes = Object.keys(item.answerOption[0]);
            for (const answerType of answerTypes) {
              if (answerType.startsWith('value')) {
                const answerKey = getUKey();
                templateData.hidden[answerKey] = item.answerOption[0][answerType];
                vueOutput += ` :hiddenValue='hidden.${answerKey
                }' hiddenType='${answerType.substring(5)}'`;
                break;
              }
            }
          }
          vueOutput += '></gofr-hidden>\n';
        } else {
          vueOutput += `<fhir-${itemType} :edit="isEdit" path="${item.linkId}"`;

          let field;
          const minmax = ['Date', 'DateTime', 'Instant', 'Time', 'Decimal', 'Integer', 'PositiveInt',
            'UnsignedInt', 'Quantity'];
          if (item.definition) {
            field = await fhirDefinition.getFieldDefinition(item.definition);
            if (itemType === 'reference' && field && field.type && field.type[0] && field.type[0].targetProfile) {
              vueOutput += ` targetProfile="${field.type[0].targetProfile[0]}"`;
              const targetResource = await getProfileResource(field.type[0].targetProfile[0]);
              vueOutput += ` targetResource="${targetResource}"`;
            }
            for (const mm of minmax) {
              for (const type of ['min', 'max']) {
                const attr = `${type}Value${mm}`;
                if (field.hasOwnProperty(attr)) {
                  if (field[attr]
                    && field[attr].value && field[attr].code) {
                    vueOutput += ` ${attr}="${field[attr].value}${field[attr].code}"`;
                  } else {
                    vueOutput += ` ${attr}="${field[attr]}"`;
                  }
                } else if (config.get(`defaults:components:${itemType}:${attr}`)) {
                  vueOutput += ` ${attr}="${config.get(`defaults:components:${itemType}:${attr}`)}"`;
                }
              }
            }

            if (!displayType) {
              if (config.get(`defaults:fields:${field.id}:type`)) {
                displayType = config.get(`defaults:fields:${field.id}:type`);
              }
            }

            if (config.get(`defaults:fields:${field.id}:user_filter`)) {
              let resource = field.id.substring(0, field.id.indexOf('.'));
              let regex = '(.+)';
              let replace = '$1';
              if (config.get(`defaults:fields:${field.id}:user_filter:regex`)) {
                regex = config.get(`defaults:fields:${field.id}:user_filter:regex`);
              }
              if (config.get(`defaults:fields:${field.id}:user_filter:replace`)) {
                replace = config.get(`defaults:fields:${field.id}:user_filter:replace`);
              }
              if (config.get(`defaults:fields:${field.id}:user_filter:resource`)) {
                resource = config.get(`defaults:fields:${field.id}:user_filter:resource`);
              }
            }

            const field_attrs = ['initialValue'];
            for (const attr of field_attrs) {
              if (config.get(`defaults:fields:${field.id}:${attr}`)) {
                vueOutput += ` ${attr}="${config.get(`defaults:fields:${field.id}:${attr}`)}"`;
              }
              // else if (attr === 'initialValue' && displayType === 'tree') {
              //   const resType = field.id.split('.')[0];
              //   let topOrgId = '';
              //   if (['Location', 'Organization'].includes(resType)) {
              //     topOrgId = mixin.getTopOrgId(config.get('mCSD:registryDB'), resType);
              //   }
              //   vueOutput += ` initialValue="${topOrgId}"`;
              // }
            }
          } else {
            for (const mm of minmax) {
              for (const type of ['min', 'max']) {
                const attr = `${type}Value${mm}`;
                if (config.get(`defaults:components:${itemType}:${attr}`)) {
                  vueOutput += ` ${attr}="${
                    config.get(`defaults:components:${itemType}:${attr}`)}"`;
                }
              }
            }
          }
          const def_attrs = ['calendar'];
          for (const attr of def_attrs) {
            if (config.get(`defaults:components:${itemType}:${attr}`)) {
              vueOutput += ` ${attr}="${
                config.get(`defaults:components:${itemType}:${attr}`)}"`;
            }
          }

          if (item.extension || (field && field.hasOwnProperty('constraint'))) {
            const constraintList = processConstraints(item.extension, field);
            if (constraintList) {
              vueOutput += ` constraints="${constraintList}"`;
            }
          }

          if (item.hasOwnProperty('text')) {
            vueOutput += ` label="${item.text}"`;
          }
          if (item.hasOwnProperty('answerValueSet')) {
            vueOutput += ` binding="${item.answerValueSet}"`;
          }
          if (displayType) {
            vueOutput += ` displayType="${displayType}"`;
          }
          if (item.required) {
            vueOutput += ' min="1"';
          } else {
            vueOutput += ' min="0"';
          }
          if (item.repeats) {
            vueOutput += ' max="*"';
          } else {
            vueOutput += ' max="1"';
          }
          /*
          let attrs = [ "required" ]
          for( let attr of attrs ) {
            if ( item.hasOwnProperty(attr) ) {
              vueOutput += " " + attr + "=\""+ item[attr] + "\""
            }
          }
          */
          vueOutput += `></fhir-${itemType}>\n`;
        }
        if (item.repeats && !item.readOnly) {
          vueOutput += '</template></gofr-array>\n';
        }
      }
      return vueOutput;
    };

    for (const item of resource.item) {
      if (item.type === 'group') {
        const md5sum = crypto.createHash('md5');
        md5sum.update(item.text);
        md5sum.update(Math.random().toString(36).substring(2));
        const sectionId = md5sum.digest('hex');

        const label = item.text.split('|', 2);
        vueOutput += `<gofr-questionnaire-section id="${sectionId}" path="${item.linkId}" label="${label[0]}"`;
        if (label.length === 2) {
          vueOutput += ` description="${label[1]}"`;
        }
        if (item.extension) {
          const constraintList = processConstraints(item.extension);
          if (constraintList) {
            vueOutput += ` constraints="${constraintList}"`;
          }
        }
        sectionMenu.push({ title: label[0], desc: label[1] || '', id: sectionId });
        vueOutput += '>\n';
        vueOutput += await processQuestionnaireItems(item.item);
        vueOutput += '</gofr-questionnaire-section>\n';
      } else {
        logger.warn('Invalid entry for questionnaire.  All top level items must be type group.');
      }
    }

    if (sectionMenu.length < 2) {
      vueOutput = vueOutput.replace('__SECTIONMENU__', '');
    } else {
      vueOutput = vueOutput.replace('__SECTIONMENU__', " :section-menu='sectionMenu'");
      templateData.sectionMenu = sectionMenu;
    }
    vueOutput += '</gofr-questionnaire>\n';

    logger.debug(vueOutput);
    return res.status(200).json({ template: vueOutput, data: templateData });
  }).catch((err) => {
    logger.error(err.message);
    logger.error(err.stack);
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = `Unable to read questionnaire: ${req.params.questionnaire}.`;
    return res.status(400).json(outcome);
    // return res.status( err.response.status ).json( err.response.data )
  });
});

router.get('/page/:page/:type?', (req, res) => {
  const page = `gofr-page-${req.params.page}`;
  // const allowed = req.user.hasPermissionByName('read', 'Basic', page);
  // // Limited access to these don't make sense so not allowing it for now
  // if (allowed !== true) {
  //   return res.status(403).json(outcomes.DENIED);
  // }
  fhirAxios.read('Basic', page, '', 'DEFAULT').then(async (resource) => {
    const pageDisplay = resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-page-display');

    const pageResource = pageDisplay.extension.find(ext => ext.url === 'resource').valueReference.reference;
    const pageTitle = pageDisplay.extension.find(ext => ext.url === 'title').valueString;
    let pagePartition = '';
    if (pageDisplay.extension.find(ext => ext.url === 'partition')) {
      pagePartition = pageDisplay.extension.find(ext => ext.url === 'partition').valueString;
    }
    let pageUpdatingResource = pageDisplay.extension.find(ext => ext.url === 'requestUpdatingResource');
    if (pageUpdatingResource) {
      pageUpdatingResource = pageUpdatingResource.valueReference.reference;
    }
    const pageFields = {};
    try {
      pageDisplay.extension.filter(ext => ext.url === 'field').map((ext) => {
        const path = ext.extension.find(subext => subext.url === 'path').valueString;
        let type,
          readOnlyIfSet;
        try {
          type = ext.extension.find(subext => subext.url === 'type').valueString;
        } catch (err) {}
        try {
          readOnlyIfSet = ext.extension.find(subext => subext.url === 'readOnlyIfSet').valueBoolean;
        } catch (err) {}
        pageFields[path] = { type, readOnlyIfSet };
      });
    } catch (err) {}

    const pageSections = resource.extension.filter(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-page-section');

    const createTemplate = async (resource, structure) => {
      logger.silly(JSON.stringify(structure, null, 2));

      const links = [];
      try {
        const linkExts = pageDisplay.extension.filter(ext => ext.url === 'link');

        for (const linkExt of linkExts) {
          let field,
            text,
            button,
            icon;

          const url = linkExt.extension.find(ext => ext.url === 'url').valueUrl;

          try {
            field = linkExt.extension.find(ext => ext.url === 'field').valueString;
          } catch (err) {}
          try {
            text = linkExt.extension.find(ext => ext.url === 'text').valueString;
          } catch (err) {}
          try {
            button = linkExt.extension.find(ext => ext.url === 'button').valueBoolean;
          } catch (err) {}
          try {
            icon = linkExt.extension.find(ext => ext.url === 'icon').valueString;
          } catch (err) {}

          links.push({
            url, field, text, button, icon,
          });
        }
      } catch (err) {}


      const sections = {};
      const sectionMap = {};
      for (const section of pageSections) {
        let title,
          description,
          name,
          resourceExt,
          resource,
          linkfield,
          searchfield;
        let fields = [];
        const columns = [];
        const actions = [];
        try {
          title = section.extension.find(ext => ext.url === 'title').valueString;
        } catch (err) { }
        try {
          description = section.extension.find(ext => ext.url === 'description').valueString;
        } catch (err) { }
        try {
          name = section.extension.find(ext => ext.url === 'name').valueString;
        } catch (err) { }
        try {
          fields = section.extension.filter(ext => ext.url === 'field').map(ext => ext.valueString);
        } catch (err) { }
        try {
          resourceExt = section.extension.find(ext => ext.url === 'resource').extension;

          resource = resourceExt.find(ext => ext.url === 'resource').valueReference.reference;
          if (resource) {
            linkfield = resourceExt.find(ext => ext.url === 'linkfield').valueString;
            try {
              searchfield = resourceExt.find(ext => ext.url === 'searchfield').valueString;
            } catch (err) { }
            const columnsExt = resourceExt.filter(ext => ext.url === 'column');
            for (const column of columnsExt) {
              try {
                const header = column.extension.find(ext => ext.url === 'header').valueString;
                const field = column.extension.find(ext => ext.url === 'field').valueString;
                if (header && field) {
                  /*
                let definition = await fhirDefinition.getFieldDefinition( resource +"#"+ field )
                let binding = ""
                if ( definition.binding ) {
                  binding = details.binding
                } else if ( details.type[0].code === "Coding" ) {
                  definition = await fhirDefinition.getFieldDefinition( resource +"#"+ field.substring( 0, field.lastIndexOf('.') ) )
                  if ( definition.binding ) {
                    binding = details.binding
                  }
                }
                */
                  columns.push({ text: header, value: field });
                }
              } catch (err) { }
            }
            const actionsExt = resourceExt.filter(ext => ext.url === 'action');
            for (const action of actionsExt) {
              try {
                const link = action.extension.find(ext => ext.url === 'link').valueString;
                const text = action.extension.find(ext => ext.url === 'text').valueString;
                let row,
                  condition,
                  emptyDisplay;
                let eleClass = 'primary';
                try {
                  row = action.extension.find(ext => ext.url === 'row').valueBoolean;
                } catch (err) {}
                try {
                  condition = action.extension.find(ext => ext.url === 'condition').valueString;
                } catch (err) {}
                try {
                  emptyDisplay = action.extension.find(ext => ext.url === 'emptyDisplay').valueBoolean;
                } catch (err) {}
                try {
                  eleClass = action.extension.find(ext => ext.url === 'class').valueString;
                } catch (err) {}
                if (link && text) {
                  actions.push({
                    link,
                    text,
                    row,
                    condition,
                    emptyDisplay,
                    class: eleClass,
                  });
                }
              } catch (err) { }
            }
          }
        } catch (err) { }

        const sectionOrder = {};
        setupOrder(fields, sectionOrder);
        for (const field of fields) {
          sectionMap[field] = name;
        }
        sections[name] = {
          title,
          description,
          fields,
          order: sectionOrder,
          resource,
          linkfield,
          searchfield,
          columns,
          actions,
          elements: {},
        };
      }
      const sdOrder = {};
      const getSortFunc = sortArr => (a, b) => {
        idxA = sortArr.indexOf(a);
        idxB = sortArr.indexOf(b);
        if (idxA === idxB) {
          return 0;
        } if (idxA === -1) {
          return 1;
        } if (idxB === -1) {
          return -1;
        } if (idxA < idxB) {
          return -1;
        }
        return 1;
      };

      const structureKeys = Object.keys(structure);
      let sectionMenu;
      const allSubFields = {};
      const allColumns = {};
      const allActions = {};
      const constraints = {};

      let vueOutput = '<template>';
      for (const fhir of structureKeys) {
        if (!sections.hasOwnProperty(fhir)) {
          sections[fhir] = {
            title: fhir,
            description: '',
            fields: [],
            order: {},
            resource: undefined,
            linkfield: undefined,
            searchfield: undefined,
            columns: [],
            actions: [],
            elements: {},
          };
        }
        const sectionKeys = Object.keys(sections);

        let resourceElement = 'gofr-resource';
        if (resource.resourceType === 'CodeSystem') {
          resourceElement = 'gofr-codesystem';
        }

        vueOutput = `<${resourceElement} partition="${pagePartition}" :fhirId="fhirId" :edit="isEdit" v-on:set-edit="setEdit($event)" profile="${resource.url}" :key="$route.params.page+($route.params.id || '')" page="${req.params.page}" field="${fhir}" title="${sections[fhir].title}" :constraints="constraints"`;
        if (sectionKeys.length > 1) {
          sectionMenu = sectionKeys.map(name => ({
            name, title: sections[name].title, desc: sections[name].description, secondary: !!sections[name].resource,
          }));
          vueOutput += " :section-menu='sectionMenu'";
        }
        if (links.length > 0) {
          vueOutput += " :links='links'";
        }
        vueOutput += '><template #default=\"slotProps\">' + '\n';
        vueOutput += `<gofr-page-title title="${pageTitle}"></gofr-page-title>`;

        if (structure[fhir].hasOwnProperty('fields')) {
          const fieldKeys = Object.keys(structure[fhir].fields);
          for (const field of fieldKeys) {
            if (sectionMap.hasOwnProperty(structure[fhir].fields[field].id)) {
              sections[sectionMap[structure[fhir].fields[field].id]].elements[field] = structure[fhir].fields[field];
            } else {
              sections[fhir].elements[field] = structure[fhir].fields[field];
            }
          }
        }
        const processFields = async (fields, base, order) => {
          let output = '';
          const fieldKeys = Object.keys(fields);
          if (order[base]) {
            fieldKeys.sort(getSortFunc(order[base]));
          }
          for (const field of fieldKeys) {
            if (fields[field].max === '0') {
              continue;
            }
            if (!fields[field].code) {
              logger.info(`No datatype for ${base} ${field} so skipping`, base, field);
              continue;
            }
            const eleName = fhirDefinition.camelToKebab(fields[field].code);

            if (fields[field].hasOwnProperty('targetProfile') && fields[field].targetProfile) {
              fields[field].targetResource = await getProfileResource(fields[field].targetProfile);
            }


            const attrs = ['field', 'sliceName', 'targetProfile', 'targetResource', 'profile', 'min', 'max', 'base-min',
              'base-max', 'label', 'path', 'binding', 'calendar', 'initialValue'];
            const minmax = ['Date', 'DateTime', 'Instant', 'Time', 'Decimal', 'Integer', 'PositiveInt',
              'UnsignedInt', 'Quantity'];
            for (const mm of minmax) {
              for (const type of ['min', 'max']) {
                attrs.push(`${type}Value${mm}`);
              }
            }
            let isArray = false;
            if (fields[field].max !== '1') {
              isArray = true;
              output += `<gofr-array :edit="isEdit" fieldType="${eleName}" :slotProps="slotProps"`;
              const arr_attrs = ['field', 'label', 'min', 'max', 'id', 'path', 'profile', 'targetProfile', 'targetResource', 'sliceName'];
              for (const attr of arr_attrs) {
                if (fields[field].hasOwnProperty(attr)) {
                  output += ` ${attr}="${fields[field][attr]}"`;
                }
              }
              output += '>\n<template #default="slotProps">\n';
            } else {
              attrs.unshift('id');
            }
            output += `<fhir-${eleName} :slotProps="slotProps" :edit="isEdit"`;
            let displayType,
              readOnlyIfSet;
            if (pageFields.hasOwnProperty(fields[field].id)) {
              if (pageFields[fields[field].id].type) {
                // output += " displayType=\""+ pageFields[ fields[field].id ].type +"\""
                displayType = pageFields[fields[field].id].type;
              }
              if (pageFields[fields[field].id].readOnlyIfSet) {
                readOnlyIfSet = true;
              }
            }
            if (!readOnlyIfSet && config.get(`defaults:fields:${fields[field].id}:readOnlyIfSet`)) {
              readOnlyIfSet = true;
            }
            if (readOnlyIfSet) {
              output += ' :readOnlyIfSet="true"';
            }
            if (!displayType) {
              if (config.get(`defaults:fields:${fields[field].id}:type`)) {
                displayType = config.get(`defaults:fields:${fields[field].id}:type`);
              }
            }
            if (displayType) {
              output += ` displayType="${displayType}"`;
            }
            if (config.get(`defaults:fields:${fields[field].id}:user_filter`)) {
              let resource = fields[field].id.substring(0, fields[field].id.indexOf('.'));
              let regex = '(.+)';
              let replace = '$1';
              if (config.get(`defaults:fields:${fields[field].id}:user_filter:regex`)) {
                regex = config.get(`defaults:fields:${fields[field].id}:user_filter:regex`);
              }
              if (config.get(`defaults:fields:${fields[field].id}:user_filter:replace`)) {
                replace = config.get(`defaults:fields:${fields[field].id}:user_filter:replace`);
              }
              if (config.get(`defaults:fields:${fields[field].id}:user_filter:resource`)) {
                resource = config.get(`defaults:fields:${fields[field].id}:user_filter:resource`);
              }
              const overrideValue = processUserFilter(req.user, resource, regex, replace);
              if (overrideValue) {
                output += ` overrideValue="${overrideValue}"`;
              }
            }
            if (fields[field].hasOwnProperty('constraint')) {
              const constraintKeys = [];
              for (const constraint of fields[field].constraint) {
                if (constraint.key && constraint.key.startsWith('gofr-')) {
                  constraints[constraint.key] = constraint;
                  constraintKeys.push(constraint.key);
                }
              }
              if (constraintKeys.length > 0) {
                output += ` constraints="${constraintKeys.join(',')}"`;
              }
            }
            for (const attr of attrs) {
              if (fields[field].hasOwnProperty(attr)) {
                if (fields[field][attr]
                  && fields[field][attr].value && fields[field][attr].code) {
                  output += ` ${attr}="${fields[field][attr].value}${fields[field][attr].code}"`;
                  updated = true;
                } else {
                  output += ` ${attr}="${fields[field][attr]}"`;
                }
              } else if (config.get(`defaults:fields:${fields[field].id}:${attr}`)) {
                output += `${attr}="${config.get(`defaults:fields:${fields[field].id}:${attr}`)}"`;
              } else if (config.get(`defaults:components:${eleName}:${attr}`)) {
                output += ` ${attr}="${config.get(`defaults:components:${eleName}:${attr}`)}"`;
              }
              // else if (attr === 'initialValue' && displayType === 'tree') {
              //   const topOrgId = mixin.getTopOrgId(config.get('mCSD:registryDB'), resource.type);
              //   output += ` initialValue="${topOrgId}"`;
              // }
            }
            let subFields;
            if (eleName === 'reference' && fields[field].hasOwnProperty('fields')) {
              const refFields = fields[field].fields;
              subFields = {};
              const subAttrs = ['id', 'path', 'label', 'min', 'max', 'base-min', 'base-max', 'code'];
              for (const refField of Object.keys(refFields)) {
                subFields[refField] = {};
                logger.silly('refLOOP', refField, refFields);
                for (const attr of subAttrs) {
                  if (refFields[refField].hasOwnProperty(attr)) {
                    if ((attr === 'id' || attr === 'path') && fields[field].hasOwnProperty(attr)) {
                      subFields[refField][attr] = refFields[refField][attr].replace(`${fields[field][attr]}.`, '');
                    } else {
                      subFields[refField][attr] = refFields[refField][attr];
                    }
                  }
                }
              }
            }
            if (subFields) {
              const subKey = getUKey();
              allSubFields[subKey] = subFields;
              output += ` :sub-fields='subFields.${subKey}'`;
            }
            output += '>\n';

            if (!subFields && fields[field].hasOwnProperty('fields')) {
              output += '<template #default="slotProps">\n';
              output += await processFields(fields[field].fields, `${base}.${fields[field]}`, order);
              output += '</template>\n';
            }

            output += `</fhir-${eleName}>\n`;
            if (isArray) {
              output += '</template>\n</gofr-array>\n';
            }
          }
          return output;
        };
        for (const name of sectionKeys) {
          vueOutput += `<gofr-section :slotProps="slotProps" :edit="isEdit" name="${name}" title="${sections[name].title}" description="${sections[name].description}" :secondary="${!!sections[name].resource}">\n<template #default="slotProps">\n`;
          if (sections[name].resource) {
            const secondary = await getDefinition(sections[name].resource);
            if (!secondary.hasOwnProperty('snapshot')) {
              logger.error('StructureDefinitions (', sections[name].resource, ') must be saved with a snapshot.');
              continue;
            }
            const secondaryStructure = fhirDefinition.parseStructureDefinition(secondary);
            const secondaryOrder = {};
            setupOrder(sections[name].fields, secondaryOrder);
            const secondaryKeys = Object.keys(secondaryStructure);
            for (const second_fhir of secondaryKeys) {
              const sectionKey = getUKey();
              allColumns[sectionKey] = sections[name].columns;
              allActions[sectionKey] = sections[name].actions;
              vueOutput += `<gofr-secondary :edit="isEdit" :link-id="fhirId" profile="${secondary.url
              }" field="${second_fhir
              }" title="${sections[name].title
              }" link-field="${sections[name].linkfield
              }" search-field="${sections[name].searchfield || ''
              }" :columns='columns.${sectionKey
              }' :actions='actions.${sectionKey
              }'><template #default="slotProps">` + '\n';
              // vueOutput += await processFields( secondaryStructure[second_fhir].fields, second_fhir, secondaryOrder )
              vueOutput += '</template></gofr-secondary>';
            }
          } else {
            vueOutput += await processFields(sections[name].elements, fhir, sections[name].order);
          }
          vueOutput += '</template></gofr-section>\n';
        }

        vueOutput += `</template></${resourceElement}>` + '\n';
      }
      vueOutput += '</template>';
      logger.debug(vueOutput);
      return res.status(200).json({
        template: vueOutput,
        data: {
          sectionMenu,
          subFields: allSubFields,
          columns: allColumns,
          actions: allActions,
          links,
          constraints,
        },
      });
    };

    const createSearchTemplate = async (resource, structure) => {
      let search = ['id'];
      try {
        search = pageDisplay.extension.filter(ext => ext.url === 'search').map(ext => ext.valueString.match(/^([^|]*)\|?([^|]*)?\|?(.*)?$/).slice(1, 4));
      } catch (err) { }
      let filters = [];
      try {
        filters = pageDisplay.extension.filter(ext => ext.url === 'filter').map(ext => ext.valueString.split('|'));
      } catch (err) { }
      let addLink = null;
      try {
        const add = pageDisplay.extension.find(ext => ext.url === 'add');
        const url = add.extension.find(ext => ext.url === 'url').valueUrl;
        let icon,
          eleClass;
        try {
          icon = add.extension.find(ext => ext.url === 'icon').valueString;
        } catch (err) {}
        try {
          eleClass = add.extension.find(ext => ext.url === 'class').valueString;
        } catch (err) {}
        addLink = { url, icon, class: eleClass };
      } catch (err) {}

      logger.silly(filters);
      logger.silly(search);

      let searchElement = 'gofr-search';
      if (resource.resourceType === 'CodeSystem') {
        searchElement += '-code';
      }

      let searchTemplate = `<${searchElement} :key="$route.params.page" page="${req.params.page}" label="${resource.title || resource.name}" :fields="fields" :terms="terms" resource="${resource.resourceType === 'StructureDefinition' ? resource.type : resource.resourceType}" profile="${resource.url}" :search-action="searchAction" :request-action='requestAction'`;
      if (pageUpdatingResource) {
        pageUpdatingResource = resource.url.replace(pageResource, '') + pageUpdatingResource;
        searchTemplate += `request-updating-resource=${pageUpdatingResource}`;
      }
      if (addLink) {
        searchTemplate += " :add-link='addLink'";
      }
      const structureKeys = Object.keys(structure);
      searchTemplate += '>' + '\n';
      let fieldDetails;
      for (const filter of filters) {
        for (const fhir of structureKeys) {
          if (structure[fhir].fields && structure[fhir].fields[filter[1]]) {
            fieldDetails = structure[fhir].fields[filter[1]];
          }
        }
        if (!fieldDetails) {
          continue;
        }
        let displayType;
        if (pageFields.hasOwnProperty(fieldDetails.id)) {
          if (pageFields[fieldDetails.id].type) {
            displayType = pageFields[fieldDetails.id].type;
          }
        }
        if (!displayType) {
          if (config.get(`defaults:fields:${fieldDetails.id}:type`)) {
            displayType = config.get(`defaults:fields:${fieldDetails.id}:type`);
          }
        }
        if (fieldDetails.code === 'Reference') {
          searchTemplate += `<gofr-search-reference-term v-on:termChange="searchData" field='${filter[1]}' label='${filter[0]}' expression='${filter[2]}'`;
          if (fieldDetails.hasOwnProperty('targetProfile') && fieldDetails.targetProfile) {
            fieldDetails.targetResource = await getProfileResource(fieldDetails.targetProfile);
            searchTemplate += ` targetProfile='${fieldDetails.targetProfile}' targetResource='${fieldDetails.targetResource}'`;
          }
          if (displayType) {
            searchTemplate += ` displayType='${displayType}'`;
          }
          searchTemplate += ' />\n';
        } else {
          searchTemplate += '<gofr-search-string-term v-on:termChange="searchData"';
          searchTemplate += ` label="${filter[0]}" expression="${filter[2]}"`;
          if (filter[3]) {
            searchTemplate += ` binding="${filter[3]}"`;
          }
          searchTemplate += '></gofr-search-string-term>\n';
        }
      }
      searchTemplate += `</${searchElement}>\n`;
      logger.debug(searchTemplate);
      return res.status(200).json({ template: searchTemplate, data: { fields: search, addLink } });
    };

    if (pageResource.startsWith('CodeSystem')) {
      getProperties(pageResource).then((resource) => {
        if (resource.total !== 1) {
          const outcome = { ...outcomes.ERROR };
          outcome.issue[0].diagnostics = `Unable to find codesystem: ${pageResource}.`;
          return res.status(400).json(outcome);
        }
        resource = resource.entry[0].resource;
        /*
        let property = []
        if ( resource.hasOwnProperty("property") ) {
          property = resource.property
        }
        */

        const structure = fhirDefinition.parseCodeSystem(resource);
        if (req.params.type === 'search') {
          return createSearchTemplate(resource, structure);
        }
        return createTemplate(resource, structure);
      }).catch((err) => {
        logger.error(err.message);
        logger.error(err.stack);
        return res.status(err.response.status).json(err.response.data);
      });
    } else if (pageResource.startsWith('StructureDefinition')) {
      getDefinition(pageResource).then((resource) => {
        if (!resource.hasOwnProperty('snapshot')) {
          const outcome = { ...outcomes.ERROR };
          outcome.issue[0].diagnostics = 'StructureDefinitions must be saved with a snapshot.';
          return res.status(404).json(outcome);
        }
        const structure = fhirDefinition.parseStructureDefinition(resource);
        if (req.params.type === 'search') {
          return createSearchTemplate(resource, structure);
        }
        return createTemplate(resource, structure);
      }).catch((err) => {
        logger.error(err.message);
        logger.error(err.stack);
        // return res.status( err.response.status ).json( err.response.data )
        return res.status(500).json({ error: err.message });
      });
    } else {
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = `Unknown resource type for page: ${pageResource}.`;
      return res.status(400).json(outcome);
    }
  }).catch((err) => {
    logger.error(err.message);
    logger.error(err.stack);
    return res.status(err.response.status).json(err.response.data);
  });
});

router.post('/updateUserConfig/:userID', (req, res) => {
  logger.info('Received updated user configurations');
  const fields = req.body
  let appConfig;
  try {
    appConfig = JSON.parse(fields.config);
  } catch (error) {
    appConfig = fields.config;
  }
  const configRes = {
    resourceType: 'Parameters',
    id: `gofr-user-config-${req.params.userID}`,
    parameter: [{
      name: 'config',
      valueString: '{}',
    }],
  };
  const index = configRes.parameter.findIndex(param => param.name === 'config');
  configRes.parameter[index].valueString = JSON.stringify(appConfig.userConfig);
  fhirAxios.update(configRes, 'DEFAULT').then(() => {
    logger.info('User Config Saved');
    return res.status(200).json({
      status: 'Done',
    });
  }).catch((err) => {
    logger.error(err);
    res.status(500).json({
      error: 'Unexpected error occured,please retry',
    });
  });
});

router.post('/updateGeneralConfig', (req, res) => {
  logger.info('Received updated general configurations');
  const fields = req.body
  let appConfig;
  try {
    appConfig = JSON.parse(fields.config);
  } catch (error) {
    appConfig = fields.config;
  }
  fhirAxios.read('Parameters', 'gofr-general-config', '', 'DEFAULT').then((configRes) => {
    const index = configRes.parameter.findIndex(param => param.name === 'config');
    const _config = JSON.parse(configRes.parameter[index].valueString);
    if (!_config.externalAuth || appConfig.generalConfig.externalAuth.password != _config.externalAuth.password) {
      if (appConfig.generalConfig.externalAuth.password) {
        appConfig.generalConfig.externalAuth.password = mixin.encrypt(appConfig.generalConfig.externalAuth.password);
      }
    } else {
      appConfig.generalConfig.externalAuth.password = _config.externalAuth.password;
    }
    configRes.parameter[index].valueString = JSON.stringify(appConfig.generalConfig);
    fhirAxios.update(configRes, 'DEFAULT').then(() => {
      logger.info('General Config Saved');
      return res.status(200).json({
        status: 'Done',
      });
    }).catch((err) => {
      logger.error(err);
      res.status(500).json({
        error: 'Unexpected error occured,please retry',
      });
    });
  });
});

router.get('/getUserConfig/:userID', (req, res) => {
  let site = JSON.parse(JSON.stringify(config.get('site') || {}));
  if (config.getBool("security:disabled")) {
    site.security = {disabled: true};
  }
  console.log(`gofr-user-config-${req.params.userID}`);
  fhirAxios.read('Parameters', `gofr-user-config-${req.params.userID}`, '', 'DEFAULT').then((response) => {
    const usrConfig = response.parameter.find(param => param.name === 'config');
    return res.status(200).json({
      config: JSON.parse(usrConfig.valueString),
      site
    });
  }).catch((err) => {
    if (err.response && err.response.status === 404) {
      const configRes = {
        resourceType: 'Parameters',
        id: `gofr-user-config-${req.params.userID}`,
        parameter: [{
          name: 'config',
          valueString: '{}',
        }],
      };
      fhirAxios.update(configRes, 'DEFAULT').then(() => {
        logger.info('User Config Saved');
        return res.status(200).json({
          config: {},
          site
        });
      }).catch((err) => {
        logger.error(err);
      });
    } else {
      res.status(500).json({
        error: 'internal error occured while getting configurations',
      });
    }
  });
});

router.get('/getGeneralConfig', (req, res) => {
  const defaultGenerConfig = JSON.parse(req.query.defaultGenerConfig);
  logger.info('Received a request to get general configuration');
  fhirAxios.read('Parameters', 'gofr-general-config', '', 'DEFAULT').then((response) => {
    const resData = response.parameter.find(param => param.name === 'config');
    let merged = {};
    if (resData.valueString) {
      // overwrite array on the left with one on the right
      const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
      merged = deepmerge.all([defaultGenerConfig, JSON.parse(resData.valueString)], {
        arrayMerge: overwriteMerge,
      });
    } else {
      merged = defaultGenerConfig;
    }
    const otherConfig = {
      idp: config.get('app:idp'),
      keycloak: {
        baseURL: config.get('keycloak:baseURL'),
        realm: config.get('keycloak:realm'),
        UIClientId: config.get('keycloak:UIClientId'),
        clientSecret: config.get('keycloak:clientSecret'),
      },
    };
    res.status(200).json({ generalConfig: merged, otherConfig, version: config.get('app:version') });
  }).catch((err) => {
    logger.error(err);
    res.status(500).json({
      error: 'internal error occured while getting configurations',
    });
  });
});

module.exports = router;
