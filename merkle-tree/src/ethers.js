import { ethers } from 'ethers';
import config from 'config';

import logger from './logger';

let etherjsProvider;

/**
 * Establishes a connection to an Ethereum RPCProvider using ethers.js library.
 * @returns {void}
 * @throws {Error} If there's an issue connecting to the RPCProvider.
 * @async
 */
export async function connect() {
  logger.info('Connecting to RPCProvider ...');
  try {
    const { host, port, rpcUrl, networkId } = config.ETHERS_OPTIONS;
    const url = rpcUrl || `${host}:${port}`;
    etherjsProvider = new ethers.providers.WebSocketProvider(url, networkId);
    const handleError = (err) => {
      logger.error(`RPCProvider error event: ${err.message}`);
      logger.info('Reconnecting...');
      connect();
    };

    etherjsProvider.on('error', handleError);
    etherjsProvider.getBlockNumber().then((blockNumber) => {
      logger.info(`Connected to RPCProvider. Current block number: ${blockNumber}`);
    });
  } catch (e) {
    logger.error(`RPCProvider error ${e.stack}`);
  }
}

export function getBlockNumber() {
  return etherjsProvider.getBlockNumber();
}

export function getTransactionReceipt(transactionHash) {
  return etherjsProvider.getTransactionReceipt(transactionHash);
}

/**
 * Retrieves the Ethereum network ID from the connected provider.
 *
 * @async
 * @function getNetworkId
 * @returns {Promise<number>} A promise that resolves to the Ethereum network ID (chain ID).
 * @throws {Error} If there's an issue retrieving the network ID.
 */
export async function getNetworkId() {
  const network = await etherjsProvider.getNetwork();
  return network.chainId;
}

/**
 * Retrieves a list of Ethereum accounts from the connected provider.
 *
 * @async
 * @function getAccounts
 * @returns {Promise<string[]>} A promise that resolves to an array of Ethereum account addresses.
 * @throws {Error} If there's an issue retrieving the accounts.
 */
export async function getAccounts() {
  const accounts = await etherjsProvider.listAccounts();
  return accounts;
}


/**
 * Creates an instance of a smart contract based on its address and ABI using ethers.js library.
 * @param {string} address - The Ethereum address of the smart contract.
 * @param {Array} contractAbi - The ABI (Application Binary Interface) of the smart contract.
 * @returns {ethers.Contract} An instance of the smart contract.
 * @async
 */
export async function getContractInstanceFromAddress(address, contractAbi) {
  return new ethers.Contract(address, contractAbi, etherjsProvider);
}

/**
 * Creates a new instance of a smart contract factory based on its ABI and deployment options using ethers.js library.
 * @param {Array} contractAbi - The ABI (Application Binary Interface) of the smart contract.
 * @param {Object} [options={}] - Deployment options for the contract factory.
 * @returns {ethers.ContractFactory} A factory for deploying and managing smart contracts.
 * @throws {Error} If the ABI is invalid, or if there's an issue creating the contract factory instance.
 * @async
 */
export async function getNewContractInstance(contractAbi, options = {}) {
  return new ethers.ContractFactory(contractAbi, options, etherjsProvider);
}

