import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, dbUrl } = config.get('mongo');
const dbConnections = {};

let url;
if (dbUrl)
  url = dbUrl;
else
  url = `mongodb://${host}:${port}/${databaseName}`;

dbConnections.admin = mongoose.createConnection(`${url}`);

const adminDbConnection = dbConnections.admin;

export default adminDbConnection;