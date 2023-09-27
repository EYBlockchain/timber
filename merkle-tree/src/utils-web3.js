/**
@module utils-web3.js
@author MichaelConnorOfficial
@desc Set of utilities to make web3 methods easier to use
*/

// First we need to connect to a websocket provider.
// Important Note: Subscribe method only works with a websocket provider!

import fs from 'fs';
import logger from './logger';
import _ from 'lodash';
import config from 'config';
import { ethers } from 'ethers';

import {
  getBlockNumber as getBlockNumberFromEthers,
  getTransactionReceipt as getTransactionReceiptFromEthers,
  getContractInstanceFromAddress,
  getNewContractInstance,
  getNetworkId,
} from './ethers';

const options = config.ETHERS_OPTIONS;

// GETTERS!!!

/**
@returns {Number} Returns the current block number.
*/
async function getBlockNumber() {
  const blockNumber = await getBlockNumberFromEthers();
  return blockNumber;
}

async function getTransactionReceipt(transactionHash) {
  const receipt = await getTransactionReceiptFromEthers(transactionHash);
  return receipt;
}

// EVENTS!!!

// a list for saving subscribed event instances
// let events = {};

function getContractInterface(contractName) {
  logger.debug(`./src/utils-web3 getContractInterface(${contractName})`);

  const path = `./build/contracts/${contractName}.json`;
  const contractInterface = JSON.parse(fs.readFileSync(path));
  // logger.silly(`contractInterface: ${JSON.stringify(contractInterface, null, 2)}`);
  return contractInterface;
}

async function getContractAddress(contractName) {
  logger.debug(`./src/utils-web3 getContractAddress(${contractName})`);
  let deployedAddress;
  const contractInterface = getContractInterface(contractName);

  const networkId = await getNetworkId();
  logger.silly(`networkId: ${networkId}`);

  if (contractInterface && contractInterface.networks && contractInterface.networks[networkId]) {
    deployedAddress = contractInterface.networks[networkId].address;
  }

  logger.silly(`deployed address: ${deployedAddress}`);

  return deployedAddress;
}

async function getDeployedContractTransactionHash(contractName) {
  logger.debug(`./src/utils-web3 getDeployedContractTransactionHash(${contractName})`);
  let transactionHash;
  const contractInterface = getContractInterface(contractName);

  const networkId = await getNetworkId();
  logger.silly(`networkId: ${networkId}`);

  if (contractInterface && contractInterface.networks && contractInterface.networks[networkId]) {
    transactionHash = contractInterface.networks[networkId].transactionHash;
  }

  logger.silly(`deployed transactionHash: ${transactionHash}`);

  return transactionHash;
}

// returns a web3 contract instance (as opposed to a truffle-contract instance)
async function getContractInstance(contractName, deployedAddress) {
  logger.debug(`./src/utils-web3 getContractInstance(${contractName}, ${deployedAddress})`);

  // interface:
  const contractInterface = getContractInterface(contractName);

  // address:
  // eslint-disable-next-line no-param-reassign
  if (!deployedAddress) deployedAddress = await getContractAddress(contractName);

  const { gas, gasPrice, from } = options.options;
  const deployOptions = {
    gasLimit: gas,
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
    from,
  };
  const contractInstance = deployedAddress
      ? getContractInstanceFromAddress(deployedAddress, contractInterface.abi)
      : getNewContractInstance(contractInterface.abi, deployOptions);

  return contractInstance;
};

// TODO: Determine if we really need this, because it seems to be more a history stuff than other thing...
// function addNewEvent(eventObject) {
//   const { blockNumber } = eventObject.eventData;
//   const { address } = eventObject.eventData;
//   const eventName = eventObject.eventData.event;

//   events[address] = events[address] === undefined ? {} : events[address];

//   events[address][eventName] =
//     events[address][eventName] === undefined ? {} : events[address][eventName];

//   events[address][eventName][blockNumber] =
//     events[address][eventName][blockNumber] === undefined
//       ? []
//       : events[address][eventName][blockNumber];

//   events[address][eventName][blockNumber].push(eventObject);

//   return events;
// }

async function subscribeToEvent(
  contractName,
  contractInstance,
  deployedAddress,
  eventName,
  fromBlock = null,
  responder,
  responseFunction,
  responseFunctionArgs = {},
) {
  logger.info(`Subscribing to event...`);
  logger.info(`contractName: ${contractName}`);
  logger.info(`eventName: ${eventName}`);
  logger.info(`fromBlock: ${fromBlock}`);

  const eventFilter = contractInstance.filters[eventName]();
  contractInstance.on(eventFilter, (...eventData) => {
    const eventObject = eventData.at(-1);
    logger.debug(`Event ${eventName} on contract ${contractName} was listened: ${JSON.stringify(eventObject)}`);
    responder(eventObject, responseFunction, responseFunctionArgs);
  });
}

async function unsubscribe(subscription) {
  logger.debug('Unsubscribing...');
  if (!subscription) {
    logger.warn('There is nothing to unsubscribe from');
    return;
  }
  logger.silly(JSON.stringify(subscription, null, 2));
  // unsubscribes the subscription
  await subscription.unsubscribe((error, success) => {
    logger.silly(`we're in subscription.unsubscribe, ${error}, ${success}`);
    if (success) {
      logger.info('Successfully unsubscribed!');
    }
    if (error) {
      throw new Error(error);
    }
  });
}

export default {
  getBlockNumber,
  getContractInterface,
  getContractAddress,
  getContractInstance,
  subscribeToEvent,
  unsubscribe,
  getDeployedContractTransactionHash,
  getTransactionReceipt,
};
