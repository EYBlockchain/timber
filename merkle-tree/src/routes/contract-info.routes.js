/**
 * @module contract-info.routes.js
 * @author PawelLechocki
 * @desc contract-info.routes.js gives an api endpoint to make the Zapps able to push the information about deployed contracts to Timber's MongoDB.
 */
import logger from '../logger';
import config from 'config';
import adminDbConnection from '../db/common/adminDbConnection';
import { COLLECTIONS } from '../../src/db/common/constants'
import DB from '../db/mongodb/db';

/**
 * @param {*} req
 * @param {*} res
 */
async function addContractInfo(req, res, next) {
  logger.info(`addContractInfo called}`);
  try {
    const db = new DB(adminDbConnection, 'admin', undefined, undefined, undefined, true);
    await db.save('deployments', {
      contractId: "0xtesttest",
      txHash: "testtest",
      blockNumber: 50
    })
    logger.info('Done');
    res.data = 'Done';
    next();
  } catch (err) {
    next(err);
  }
}
// initializing routes
export default function(router) {
  router.route('/addContractInfo').post(addContractInfo);
}
