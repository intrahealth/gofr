const mongoose = require('mongoose');
const models = require('./models');
const config = require('./config');

const mongoUser = config.get('DB_USER');
const mongoPasswd = config.get('DB_PASSWORD');
const mongoHost = config.get('DB_HOST');
const mongoPort = config.get('DB_PORT');
const database = config.get('DB_NAME');

// load default configurations
if (mongoUser && mongoPasswd) {
  var uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${database}`;
} else {
  var uri = `mongodb://${mongoHost}:${mongoPort}/${database}`;
}
mongoose.connect(uri, {}, () => {
  models.MetaDataModel.findOne({}, (err, data) => {
    data = JSON.parse(JSON.stringify(data));
    if (data) {
      if (!data.config.hasOwnProperty('generalConfig')) {
        const generalConfig = {
          selfRegistration: false,
          reconciliation: {
            parentConstraint: {
              enabled: true,
              idAutoMatch: true,
              nameAutoMatch: false,
            },
          },
          recoProgressNotification: {
            enabled: false,
          },
        };
        models.MetaDataModel.findOneAndUpdate({
          _id: data._id,
        }, {
          $set: {
            'config.generalConfig': generalConfig,
          },
        }, (err, data) => {

        });
      } else if (!data.config.generalConfig.reconciliation.parentConstraint.hasOwnProperty('enabled')) {
        const parentConstraint = {
          enabled: true,
          idAutoMatch: true,
          nameAutoMatch: false,
        };
        models.MetaDataModel.findOneAndUpdate({
          _id: data._id,
        }, {
          $set: {
            'config.generalConfig.reconciliation.parentConstraint': parentConstraint,
          },
        }, (err, data) => {

        });
      }
    }
  });
});
