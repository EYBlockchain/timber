import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, dbUrl, admin, adminPassword } = config.get('mongo');
const dbConnections = {};

let url;
if (dbUrl) {
  url = dbUrl;
} else {
  url = `mongodb://${admin}:${adminPassword}@${host}:${port}/${databaseName}?authSource=admin`;
}

dbConnections.admin = mongoose.createConnection(`${url}`);

const adminDbConnection = dbConnections.admin;

export default adminDbConnection;
