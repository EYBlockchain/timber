/**
 * @module node.routes.js
 * @author iAmMichaelConnor
 * @desc gateway for querying contract details from some external contract deployment microservice.
 */

import axios from 'axios';
import config from 'config';
import logger from '../logger';
import { getContractInstanceFromAddress } from '../ethers';

/**
Gets an instance of a MerkleTree.sol contract interface from some external contract deployment microservice, a.k.a. 'deployer'
*/
async function getContractInterface(contractName) {
  logger.debug(`Calling getContractInterface(${contractName})`);
  const url = `${config.deployer.host}:${config.deployer.port}`;
  logger.debug(`url:, ${url}`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/contract/interface`,
      method: 'get',
      data: { contractName },
    };
    axios(options).then(response => {
      resolve(response.data);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
Gets the address of a deployed MerkleTree.sol contract from some external contract deployment microservice, a.k.a. 'deployer'
*/
async function getContractAddress(contractName) {
  logger.debug(`Calling getContractAddress(${contractName})`);
  const url = `${config.deployer.host}:${config.deployer.port}`;
  logger.debug(`url: ${url}`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/contract/address`,
      method: 'get',
      data: { contractName },
    };
    axios(options).then(response => {
      resolve(response.data);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
Gets MerkleTree.sol contract data from some external contract deployment microservice (a.k.a. 'deployer') and assembles a MerkleTree.sol contract instance
*/
async function getContractInstance(contractName) {
  try {
    logger.debug(`Calling getContractInstance(${contractName})`);
    const { contractAddress } = await getContractAddress(contractName);
    logger.silly(`contractAddress, ${contractAddress}`);
    const { contractInterface } = await getContractInterface(contractName);
    logger.silly(`contractInterface ${JSON.stringify(contractInterface)}`);
    const { abi } = contractInterface;
    logger.silly(`abi, ${JSON.stringify(abi, null, 2)}`);

    const contractInstance = await getContractInstanceFromAddress(contractAddress, abi);

    logger.silly(`MerkleTree.sol contract instance: ${JSON.stringify(contractInstance, null, 2)}`);
    if (typeof contractInstance === 'undefined')
      throw new Error('Could not retrieve contractInstance');

    return contractInstance;
  } catch (err) {
    throw new Error(err);
  }
}

export default {
  getContractInstance,
};
