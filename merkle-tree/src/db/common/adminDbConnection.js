import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, dbUrl, admin, adminPassword } = config.get('mongo');
const dbConnections = {};
let url;
if (dbUrl) url = dbUrl;
else url = `mongodb://${host}:${port}`;

console.log(`Creating connection to ${url}/${databaseName}`)
dbConnections.admin = mongoose.createConnection(`${url}/${databaseName}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  authSource: "admin",
  user: admin,
  pass: adminPassword,
  useUnifiedTopology: true,
  useFindAndModify: false 
});

const adminDbConnection = dbConnections.admin;

export default adminDbConnection;