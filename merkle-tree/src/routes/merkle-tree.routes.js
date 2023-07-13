/**
 * @module node.routes.js
 * @author iAmMichaelConnor
 * @desc merkle-tree.routes.js gives api endpoints to access the functions of the merkle-tree microservice
 */

import contractController from '../contract-controller';
import filterController from '../filter-controller';
import merkleTreeController from '../merkle-tree-controller';
import logger from '../logger';
const axios = require('axios');

const alreadyStarted = {}; // initialises as false
const alreadyStarting = {}; // initialises as false

/**
 * Updates the entire tree based on the latest-stored leaves.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * @param {*} req
 * @param {*} res - returns the tree's metadata
 */
async function startEventFilter(req, res, next) {
  logger.debug('src/routes/merkle-tree.routes startEventFilter()');

  const { contractName, treeId, contractId, contractAddress, block } = req.body; // contractAddress & treeId are optional parameters. Address can instead be inferred by Timber in many cases.
  const { db } = req.user;

  logger.debug(
    `Received data: contractName: ${contractName}, treeId: ${treeId}, contractId: ${contractId}, contractAddress: ${contractAddress}, block: ${block}`,
  );
  // TODO: if possible, make this easier to read and follow. Fewer 'if' statements. Perhaps use 'switch' statements instead?
  try {
    if (
      alreadyStarted[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] &&
      (treeId === undefined || treeId === '')
    ) {
      res.data = { message: `filter already started for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}` };
    } else if (alreadyStarted[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`]) {
      res.data = {
        message: `filter already started for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`,
      };
    } else if (
      alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] &&
      (treeId === undefined || treeId === '')
    ) {
      res.data = {
        message: `filter is already in the process of being started for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`,
      };
    } else if (alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`]) {
      res.data = {
        message: `filter is already in the process of being started for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`,
      };
    } else {
      if (treeId === undefined || treeId === '') {
        alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = true;
        logger.info(`starting filter for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`);
      } else {
        alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = true;
        logger.info(`starting filter for ${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`);
      }

      // get a web3 contractInstance we can work with:
      const contractInstance = await contractController.instantiateContract(
        db,
        contractName,
        contractAddress,
        contractId,
      );

      // start an event filter on this contractInstance:
      const started = await filterController.start(
        db,
        contractName,
        contractInstance,
        treeId,
        contractId,
        block
      );

      if (treeId === undefined || treeId === '') {
        alreadyStarted[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = started; // true/false
        alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = false;
      } else {
        alreadyStarted[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = started; // true/false
        alreadyStarting[`${contractName}${contractId ? '_' + contractId : ''}${treeId ? '_' + treeId : ''}`] = false;
      }

      res.data = { message: 'filter started' };
    }
    next();
  } catch (err) {
    alreadyStarting[contractName] = false;
    next(err);
  }
}

/**
 * Get the siblingPath or 'witness path' for a given leaf.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * req.params {
 *  leafIndex: 1234,
 * }
 * @param {*} req
 * @param {*} res
 */
async function getSiblingPathByLeafIndex(req, res, next) {
  logger.debug('src/routes/merkle-tree.routes getSiblingPathByLeafIndex()');
  logger.silly(`req.params: ${JSON.stringify(req.params, null, 2)}`);

  const { db } = req.user;
  let { leafIndex } = req.params;
  leafIndex = Number(leafIndex); // force to number

  try {
    // first update all nodes in the DB to be in line with the latest-known leaf:
    await merkleTreeController.update(db);

    // get the sibling path:
    const siblingPath = await merkleTreeController.getSiblingPathByLeafIndex(db, leafIndex);

    res.data = siblingPath;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Get the path for a given leaf.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * req.params {
 *  leafIndex: 1234,
 * }
 * @param {*} req
 * @param {*} res
 */
async function getPathByLeafIndex(req, res, next) {
  logger.debug('src/routes/merkle-tree.routes getPathByLeafIndex()');
  logger.silly(`req.params: ${JSON.stringify(req.params, null, 2)}`);

  const { db } = req.user;
  let { leafIndex } = req.params;
  leafIndex = Number(leafIndex); // force to number

  try {
    // first update all nodes in the DB to be in line with the latest-known leaf:
    await merkleTreeController.update(db);

    // get the path:
    const path = await merkleTreeController.getPathByLeafIndex(db, leafIndex);

    res.data = path;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Updates the entire tree based on the latest-stored leaves.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * @param {*} req
 * @param {*} res - returns the tree's metadata
 */
async function update(req, res, next) {
  logger.debug('src/routes/merkle-tree.routes update()');

  const { db } = req.user;

  try {
    const metadata = await merkleTreeController.update(db);

    res.data = metadata;
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router.route('/start').post(startEventFilter);

  router.route('/update').patch(update);

  router.get('/siblingPath/:leafIndex', getSiblingPathByLeafIndex);
  router.get('/path/:leafIndex', getPathByLeafIndex);
}
