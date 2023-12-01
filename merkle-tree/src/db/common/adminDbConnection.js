import mongoose from 'mongoose';
import config from 'config';
import logger from '../../logger';

const { dbUrl, databaseName, admin, adminPassword } = config.get('mongo');
const dbConnections = {};
let adminDbConnection;

export async function connect() {
    logger.info('Attempting to connect to mongo database');
    logger.debug(`Connection parameters: ${JSON.stringify({
        dbUrl,
        databaseName,
        // authSource: 'admin',
        // user: admin,
        // pass: adminPassword,
        dbName: databaseName,
    })}`);
    
    dbConnections.admin = await mongoose.createConnection(dbUrl, {
        // authSource: 'admin',
        // user: admin,
        // pass: adminPassword,
        dbName: databaseName
    });
    
    logger.debug(`DATABASE CONNECTION: ${dbConnections.admin}`);
    adminDbConnection = dbConnections.admin;
}

export function getAdminConnection() {
    return dbConnections.admin;
}

export default adminDbConnection;
