/**
@module filter-controller.js
@desc file that starts up the filter
@author iAmMichaelConnor
*/
const axios = require('axios');
import config from 'config';
import utilsWeb3 from './utils-web3';

import { LeafService, MetadataService } from './db/service';
import logger from './logger';
import adminDbConnection from '../src/db/common/adminDbConnection';
import DB from '../src/db/mongodb/db';

// global subscriptions object:
const subscriptions = {};

/**
TODO: description
*/
const newLeafResponseFunction = async (eventObject, args) => {
  // NEW - function remains the same, for detecting single leaves, but can now specify the event name
  // NOTE - events must have same parameters as newLeaf / newLeaves
  // We make some hardcoded presumptions about what's contained in the 'args':
  const { db, contractName, treeId } = args;

  const eventName = args.eventName === undefined ? 'NewLeaf' : args.eventName; // hardcoded, as inextricably linked to the name of this function.

  let eventParams;
  logger.debug(`eventname: ${eventName}`);

  if (treeId === undefined || treeId === '') {
    eventParams = config.contracts[contractName].events[eventName].parameters;
  } else {
    eventParams = config.contracts[contractName].treeId[treeId].events[eventName].parameters;
  }

  // Now some generic eventObject handling code:
  const { eventData } = eventObject;

  /*
  extract each relevent event parameter from the eventData and create an eventInstance: {
    eventParamName_0: eventParamValue_0,
    eventParamName_1: eventParamValue_1,
    ...
  }
  */
  const eventInstance = {};
  eventParams.forEach(param => {
    eventInstance[param] = eventData.returnValues[param];
  });
  logger.silly(`eventInstance: ${JSON.stringify(eventInstance, null, 2)}`);

  const metadataService = new MetadataService(db);
  const { treeHeight } = await metadataService.getTreeHeight();

  // Now some bespoke code; specific to how our application needs to deal with this eventObject:
  // construct a 'leaf' document to store in the db:
  const { blockNumber } = eventData;
  const { leafIndex, leafValue } = eventInstance;
  const leaf = {
    value: leafValue,
    leafIndex,
    blockNumber,
  };

  const leafService = new LeafService(db);
  leafService.insertLeaf(treeHeight, leaf); // no need to await this
};

/**
TODO: description
*/
const newLeavesResponseFunction = async (eventObject, args) => {
  // We make some hardcoded presumptions about what's contained in the 'args':
  const { db, contractName, treeId } = args;

  const eventName = args.eventName === undefined ? 'NewLeaves' : args.eventName; // hardcoded, as inextricably linked to the name of this function.

  let eventParams;

  if (treeId === undefined || treeId === '') {
    eventParams = config.contracts[contractName].events[eventName].parameters;
  } else {
    eventParams = config.contracts[contractName].treeId[treeId].events[eventName].parameters;
  }

  // Now some generic eventObject handling code:
  const { eventData } = eventObject;

  /*
  extract each relevent event parameter from the eventData and create an eventInstance: {
    eventParamName_0: eventParamValue_0,
    eventParamName_1: eventParamValue_1,
    ...
  }
  */
  const eventInstance = {};
  eventParams.forEach(param => {
    eventInstance[param] = eventData.returnValues[param];
  });
  logger.silly(`eventInstance: ${JSON.stringify(eventInstance, null, 2)}`);
  const metadataService = new MetadataService(db);
  const { treeHeight } = await metadataService.getTreeHeight();

  // Now some more bespoke code; specific to how our application needs to deal with this eventObject:
  // construct an array of 'leaf' documents to store in the db:
  const { blockNumber } = eventData;
  const { minLeafIndex, leafValues } = eventInstance;

  const leaves = [];
  let leafIndex;
  leafValues.forEach((leafValue, index) => {
    leafIndex = Number(minLeafIndex) + Number(index);
    const leaf = {
      value: leafValue,
      leafIndex,
      blockNumber,
    };
    leaves.push(leaf);
  });

  const leafService = new LeafService(db);
  leafService.insertLeaves(treeHeight, leaves); // no need to await this
};

/**
This function is triggered by the 'event' contract subscription, every time a new event is received via the websocket.
@param {object} eventObject - An event object.
*/
const newEventResponder = async (eventObject, responseFunction, responseFunctionArgs = {}) => {
  logger.debug('Responding to New Event...');
  /*
    Although this function appears to be redundant (because it's passing data straight through), we retain it for the sake of example. Hopefully it demonstrates most generally how this eventResponder structure can be applied to respond to other events.
  */
  responseFunction(eventObject, responseFunctionArgs); // we don't need to await this
};

/**
Config object for the above response functions.
Naming convention:
{
  eventName: eventNameResponseFunction
}
*/
const responseFunctions = {
  NewLeaf: newLeafResponseFunction,
  NewLeaves: newLeavesResponseFunction,
};

/**
An 'orchestrator' which oversees the various filtering steps of the filter
@param {number} blockNumber
*/
async function filterBlock(db, contractName, contractInstance, fromBlock, treeId, contractId) {
  logger.debug(
    `src/filter-controller filterBlock(db, contractInstance, fromBlock=${fromBlock}, treeId)`,
  );
  const metadataService = new MetadataService(db);

  let eventNames;

  // TODO: if possible, make this easier to read and follow. Fewer 'if' statements. Perhaps use 'switch' statements instead?
  if (treeId === undefined || treeId === '') {
    eventNames = Object.keys(config.contracts[contractName].events);
    if (config.treeHeight !== undefined || config.treeHeight !== '') {
      const { treeHeight } = config;
      metadataService.insertTreeHeight({ treeHeight });
    }
  } else {
    const { treeHeightDb } = await metadataService.getTreeHeight();
    const { treeHeight } = config.contracts[contractName].treeId[treeId];
    if (treeHeightDb !== treeHeight && (treeHeight !== undefined || treeHeight !== '')) {
      metadataService.insertTreeHeight({ treeHeight });
    }
    eventNames = Object.keys(config.contracts[contractName].treeId[treeId].events);
  }

  const { treeHeight } = await metadataService.getTreeHeight();
  const { latestRecalculation } = await metadataService.getLatestRecalculation();
  const { frontier } =
    latestRecalculation.frontier === undefined ? new Array(treeHeight) : latestRecalculation;
  if (frontier.length !== treeHeight + 1 && treeHeight !== 32) {
    latestRecalculation.frontier = new Array(treeHeight + 1);
    await metadataService.updateLatestRecalculation({ latestRecalculation });
  }

  eventNames.forEach(async eventName => {
    const responder = newEventResponder;
    const responseFunction =
      eventName === eventNames[0] ? responseFunctions.NewLeaf : responseFunctions.NewLeaves;
    const responseFunctionArgs = { db, contractName, eventName, treeId };

    const eventSubscription = await utilsWeb3.subscribeToEvent(
      contractName,
      contractInstance,
      null, // if null, the deployedAddress will be gleaned from the contractInstance
      eventName,
      fromBlock,
      responder,
      responseFunction,
      responseFunctionArgs,
    );

    subscriptions[eventName] = eventSubscription; // keep the subscription object for this event in global memory; to enable 'unsubscribe' in future.
  });
}

/**
Check which block was the last to be filtered.
@return {number} the next blockNumber which should be filtered.
*/
// Extended this with contractId, we'll need to change the logic to use our cached info from Mongo, instead of Truffle's interface file
async function getFromBlock(db, contractName, contractId) {
  const metadataService = new MetadataService(db);
  const metadata = await metadataService.getLatestLeaf();

  let latestLeaf;
  let blockNumber;

  logger.debug(`Fetched metadata (should be empty for the first call but not null): ${metadata}`);
  switch (metadata) {
    case null: // no document exists in the metadata db
      throw new Error('Unexpected null response from db: no document found in the metadata db.');
    default:
      latestLeaf = metadata.latestLeaf || {};
      blockNumber = latestLeaf.blockNumber || undefined;
      break;
  }

  logger.info(
    `Stats at restart, from the merkle-tree's mongodb: latestLeaf, ${latestLeaf}; blockNumber, ${blockNumber}`,
  );

  // lines above are common regardless if there is contractId or not, so we'll keep them. Our main interest is the line with getDeployedContractTransactionHash(contractName);
  // Instead of figuring out the hash and calculating the block number, we'll just ask Mongo to give us the block number by looking up the contract

  // only from this line, the logic changes
  if (!contractId) {
    if (blockNumber === undefined) {
      let receipt;
      let transactionHash = await utilsWeb3.getDeployedContractTransactionHash(contractName);
      logger.debug(` ${contractName} deployed transactionHash:  ${transactionHash}`);

      if (transactionHash) {
        receipt = await utilsWeb3.getTransactionReceipt(transactionHash);
        logger.debug(`receipt: ${receipt}`);
      }

      blockNumber = receipt ? receipt.blockNumber : config.FILTER_GENESIS_BLOCK_NUMBER;
      logger.warn(
        `No filtering history found in mongodb, so starting filter from the contract's deployment block ${blockNumber}`,
      );
    }

    const currentBlockNumber = await utilsWeb3.getBlockNumber();
    logger.debug(`Current blockNumber: ${currentBlockNumber}`);

    logger.debug(
      `The filter is ${currentBlockNumber - blockNumber} blocks behind the current block.`,
    );

    return blockNumber;
  } else {
    // Logic with contract ID
    // We need to build a new db connection because the one points to the nodes/metadata collections and we need access to the deployments collection.
    // We have the contractID, let's look it up

    // this points us to the
    

    const contractInfo = await axios.get("http://contractapi:1234/contracts/" + contractId); // Replace with a real API
    
    if (blockNumber === undefined) {
      const result = contractInfo.data.deploymentBlock

      logger.info(`Fetched block ID for ${contractId} from API`);
      logger.info(result);


      blockNumber = result ? result : config.FILTER_GENESIS_BLOCK_NUMBER; // if result is undefined, use the genesis from config
      logger.warn(
        `No filtering history found in mongodb, so starting filter from the contract's deployment block ${blockNumber}`,
      );
    }

    const currentBlockNumber = await utilsWeb3.getBlockNumber();
    logger.debug(`Current blockNumber: ${currentBlockNumber}`);

    logger.debug(
      `The filter is ${currentBlockNumber - blockNumber} blocks behind the current block.`,
    );
    return blockNumber;
  }
}

/**
Commence filtering
*/
async function start(db, contractName, contractInstance, treeId, contractId) {
  try {
    logger.info('Starting filter...');
    // check the fiddly case of having to re-filter any old blocks due to lost information (e.g. due to a system crash).
    const fromBlock = await getFromBlock(db, contractName, contractId); // the blockNumber we get is the next WHOLE block to start filtering.
    // Now we filter indefinitely:
    await filterBlock(db, contractName, contractInstance, fromBlock, treeId, contractId);
    return true;
  } catch (err) {
    throw new Error(err);
  }
}

export default {
  start,
};
