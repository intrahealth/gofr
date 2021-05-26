const mongoose = require('mongoose');
const config = require('./config');

const mongoUser = config.get('DB_USER');
const mongoPasswd = config.get('DB_PASSWORD');
const mongoHost = config.get('DB_HOST');
const mongoPort = config.get('DB_PORT');
const database = config.get('DB_NAME');

const options = {
  useNewUrlParser: true,
  keepAlive: true,
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  poolSize: 10,
};
let uri;
if (mongoUser && mongoPasswd) {
  uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${database}`;
} else {
  uri = `mongodb://${mongoHost}:${mongoPort}/${database}`;
}
mongoose.connect(uri, options);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
