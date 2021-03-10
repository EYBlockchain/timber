import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, dbUrl } = config.get('mongo');
const dbConnections = {};
let url;
if (dbUrl) url = dbUrl;
else url = `${host}:${port}`;

dbConnections.admin = mongoose.createConnection(`${url}/${databaseName}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

const adminDbConnection = dbConnections.admin;

export default adminDbConnection;
