const fs = require('fs');
const crypto = require('crypto');

// Don't allow any settings to these values from a remote config
const invalidRemoteKeys = ['fhir', 'config', 'session', 'keys',
  'logs', 'emnutt', 'elasticsearch', 'reports'];

const fhirConfig = {
  checkBoolean: value => /^(true|yes|1)$/i.test(value),
  parseFile: (file) => {
    const configString = fs.readFileSync(file);
    const config = JSON.parse(configString);

    const defaults = {};
    if (config.meta && config.meta.profile
      && config.meta.profile.includes('http://ihris.org/fhir/StructureDefinition/ihris-parameters-local-config')) {
      for (const param of config.parameter) {
        if (param.hasOwnProperty('valueString')) {
          const split = param.name.split(':');
          const last = split.pop();
          let assign = defaults;
          for (const level of split) {
            if (!assign.hasOwnProperty(level)) {
              assign[level] = {};
            }
            assign = assign[level];
          }
          assign[last] = param.valueString;
        } else if (param.hasOwnProperty('part')) {
          if (!defaults.hasOwnProperty(param.name)) {
            defaults[param.name] = {};
          }
          for (const part of param.part) {
            if (part.hasOwnProperty('valueString')) {
              // defaults[param.name][part.name] = part.valueString
              const split = part.name.split(':');
              const last = split.pop();
              let assign = defaults[param.name];
              for (const level of split) {
                if (!assign.hasOwnProperty(level)) {
                  assign[level] = {};
                }
                assign = assign[level];
              }
              assign[last] = part.valueString;
            }
          }
        }
      }
    } else {
      console.warn(`Invalid profile for configuration file: ${file}`);
    }
    return defaults;
  },
  parseRemote: (config, keys, skipSignature) => {
    const defaults = {};
    if (config.meta && config.meta.profile
      && config.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-parameters-remote-config')) {
      let configAccepted = false;
      const addconf = config.parameter.find(param => param.name === 'config');

      if (skipSignature) {
        console.warn('SKIPPING SECURITY CHECK ON REMOTE CONFIG:', config.id, '. This should only be done in development.');
        configAccepted = true;
      } else {
        const sig = config.parameter.find(param => param.name === 'signature');

        const verifier = crypto.createVerify('sha256');
        verifier.update(JSON.stringify(addconf.part));

        for (const key of keys) {
          if (verifier.verify(key, sig.valueSignature.data, 'base64')) {
            configAccepted = true;
            break;
          }
        }
      }

      if (configAccepted) {
        for (const param of addconf.part) {
          if (param.hasOwnProperty('valueString')) {
            const split = param.name.split(':');
            if (invalidRemoteKeys.includes(split[0])) {
              console.warn(`Can't override ${split[0]} from remote config file.`);
              continue;
            }
            const last = split.pop();
            let assign = defaults;
            for (const level of split) {
              if (!assign.hasOwnProperty(level)) {
                assign[level] = {};
              }
              assign = assign[level];
            }
            assign[last] = param.valueString;
          }
        }
      } else {
        console.warn(`No valid key set for configuration Parameters ${config.id}`);
      }
    } else {
      console.warn(`Invalid profile for remote configuration parameters for ${config.id}`);
    }

    return defaults;
  },

};

module.exports = fhirConfig;
