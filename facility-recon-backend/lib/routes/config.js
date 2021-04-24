const crypto = require('crypto');
const express = require('express');

const router = express.Router();
const fhirWrapper = require('../fhirWrapper');
const config = require('../config');

const outcomes = require('../../config/operationOutcomes');
const fhirDefinition = require('../modules/fhirDefinition');
const logger = require('../winston');

const getUKey = () => Math.random().toString(36).replace(/^[^a-z]+/, '') + Math.random().toString(36).substring(2, 15);

const getDefinition = (resource) => {
  const structureDef = resource.split('/');
  return fhirWrapper.getResource({
    resource: structureDef[0],
    id: structureDef[1],
  });
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

router.get('/questionnaire/:questionnaire', (req, res) => {
  fhirWrapper.getResource({
    resource: 'Questionnaire',
    id: req.params.questionnaire,
  }).then(async (resource) => {
    let vueOutput = `<ihris-questionnaire :edit=\"isEdit\" :view-page="viewPage" :constraints="constraints" url="${resource.url}" id="${resource.id}" title="${resource.title
    }" description="${resource.description}" purpose="${resource.purpose
    }"__SECTIONMENU__>` + '\n';


    const sectionMenu = [];
    const templateData = { sectionMenu: {}, hidden: {}, constraints: {} };

    const processConstraints = (extension, fieldDef) => {
      const constraintKeys = [];
      if (fieldDef && fieldDef.hasOwnProperty('constraint')) {
        for (const constraint of fieldDef.constraint) {
          if (constraint.key && constraint.key.startsWith('ihris-')) {
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
            if (key.startsWith('ihris-')) {
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
          vueOutput += `<ihris-array :edit="isEdit" path="${item.linkId}" label="${
            item.text}" max="*" min="${item.required ? '1' : '0'}"><template #default="slotProps">\n`;
        }
        const itemType = fhirDefinition.camelToKebab(item.type);
        if (itemType === 'group') {
          const label = item.text.split('|', 2);
          vueOutput += `<ihris-questionnaire-group :edit=\"isEdit\" path="${item.linkId}" label="${label[0]}"`;
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
          vueOutput += '</ihris-questionnaire-group>\n';
        } else if (item.readOnly) {
          vueOutput += `<ihris-hidden path="${item.linkId}" label="${
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
          vueOutput += '></ihris-hidden>\n';
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
                } else if (config.getConf(`defaults:components:${itemType}:${attr}`)) {
                  vueOutput += ` ${attr}="${config.getConf(`defaults:components:${itemType}:${attr}`)}"`;
                }
              }
            }

            if (!displayType) {
              if (config.getConf(`defaults:fields:${field.id}:type`)) {
                displayType = config.getConf(`defaults:fields:${field.id}:type`);
              }
            }

            if (config.getConf(`defaults:fields:${field.id}:user_filter`)) {
              let resource = field.id.substring(0, field.id.indexOf('.'));
              let regex = '(.+)';
              let replace = '$1';
              if (config.getConf(`defaults:fields:${field.id}:user_filter:regex`)) {
                regex = config.getConf(`defaults:fields:${field.id}:user_filter:regex`);
              }
              if (config.getConf(`defaults:fields:${field.id}:user_filter:replace`)) {
                replace = config.getConf(`defaults:fields:${field.id}:user_filter:replace`);
              }
              if (config.getConf(`defaults:fields:${field.id}:user_filter:resource`)) {
                resource = config.getConf(`defaults:fields:${field.id}:user_filter:resource`);
              }
            }

            const field_attrs = ['initialValue'];
            for (const attr of field_attrs) {
              if (config.getConf(`defaults:fields:${field.id}:${attr}`)) {
                vueOutput += ` ${attr}="${
                  config.getConf(`defaults:fields:${field.id}:${attr}`)}"`;
              }
            }
          } else {
            for (const mm of minmax) {
              for (const type of ['min', 'max']) {
                const attr = `${type}Value${mm}`;
                if (config.getConf(`defaults:components:${itemType}:${attr}`)) {
                  vueOutput += ` ${attr}="${
                    config.getConf(`defaults:components:${itemType}:${attr}`)}"`;
                }
              }
            }
          }
          const def_attrs = ['calendar'];
          for (const attr of def_attrs) {
            if (config.getConf(`defaults:components:${itemType}:${attr}`)) {
              vueOutput += ` ${attr}="${
                config.getConf(`defaults:components:${itemType}:${attr}`)}"`;
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
          vueOutput += '</template></ihris-array>\n';
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
        vueOutput += `<ihris-questionnaire-section id="${sectionId}" path="${item.linkId}" label="${label[0]}"`;
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
        vueOutput += '</ihris-questionnaire-section>\n';
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
    vueOutput += '</ihris-questionnaire>\n';

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


module.exports = router;
