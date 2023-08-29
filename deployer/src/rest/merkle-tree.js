import axios from 'axios';
import config from 'config';
import utilsPoll from '../utils-poll';

const url = `${config.merkleTree.host}:${config.merkleTree.port}`;

/**
Start the event filter in the merkle-tree microservice, for the given contract
*/
async function startEventFilter(contractName) {
  console.log(`\nCalling startEventFilter(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/start`,
      method: 'post',
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
Get the nodes on the sibling path from the given leafIndex to the root.
*/
async function getSiblingPathByLeafIndex(contractName, leafIndex) {
  console.log(`\nCalling getSiblingPathByLeafIndex(${contractName}, ${leafIndex})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/siblingPath/${leafIndex}`,
      method: 'post',
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
Gets the interface of a deployed MerkleTree.sol contract
*/
async function getContractInterface(contractName) {
  console.log(`\nCalling getContractInterface(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/metadata/contractInterface`,
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
Gets the address of a deployed MerkleTree.sol contract
*/
async function getContractAddress(contractName) {
  console.log(`\nCalling getContractAddress(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/metadata/contractAddress`,
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

async function postInterface(contractName, contractInterface) {
  console.log(`\nCalling postContractInterface(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/metadata/contractInterface`,
      method: 'post',
      json: true,
      data: { contractName, contractInterface },
    };
    axios(options).then(response => {
      resolve(response.data);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
Posts a contract interface to the merkle-tree microservice
@returns {false | object} Polling functions MUST return FALSE if the poll is unsuccessful. Otherwise we return the response from the merkle-tree microservice
*/
const postContractInterfacePollingFunction = async args => {
  try {
    const { contractName, contractInterface } = args;

    await postInterface(contractName, contractInterface);

    return true;
  } catch (err) {
    console.log(
      `Got a polling error "${err}", but that might be because the external server missed our call - we'll poll again...`,
    );
    return false;
  }
};

async function postContractInterface(contractName, contractInterface) {
  console.log('\nPosting the contract interface to the merkle-tree microservice...');
  try {
    await utilsPoll.poll(postContractInterfacePollingFunction, config.POLLING_FREQUENCY, {
      contractName,
      contractInterface,
    });
  } catch (err) {
    throw new Error('Could not post the contract interface to the merkle-tree microservice');
  }
}

async function postAddress(contractName, contractAddress) {
  console.log(`\nCalling postContractAddress(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/metadata/contractAddress`,
      method: 'post',
      json: true,
      data: { contractName, contractAddress },
    };
    axios(options).then(response => {
      resolve(response.data);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
Posts a contract address to the merkle-tree microservice
@returns {false | object} Polling functions MUST return FALSE if the poll is unsuccessful. Otherwise we return the response from the merkle-tree microservice
*/
const postContractAddressPollingFunction = async args => {
  try {
    const { contractName, contractAddress } = args;

    await postAddress(contractName, contractAddress);

    return true;
  } catch (err) {
    console.log(
      `Got a polling error "${err}", but that might be because the external server missed our call - we'll poll again...`,
    );
    return false;
  }
};

async function postContractAddress(contractName, contractAddress) {
  console.log('\nPosting the contract interface to the merkle-tree microservice...');
  try {
    await utilsPoll.poll(postContractAddressPollingFunction, config.POLLING_FREQUENCY, {
      contractName,
      contractAddress,
    });
  } catch (err) {
    throw new Error('Could not post the contract address to the merkle-tree microservice');
  }
}

async function insertTreeHeight(contractName, treeHeight) {
  console.log('\nPosting a request to insert the treeHeight into the merkle-tree microservice...');
  try {
    console.log(`\nCalling insertTreeHeight(${contractName}, ${treeHeight})`);
    return new Promise((resolve, reject) => {
      const options = {
        url: `${url}/metadata/treeHeight`,
        method: 'post',
        json: true,
        data: { contractName, treeHeight },
      };
      axios(options).then(response => {
        resolve(response.data);
      }).catch(err => {
        reject(err);
      });
    });
  } catch (err) {
    throw new Error(
      'Could not post a request to insert a treeHeight into the merkle-tree microservice',
    );
  }
}

async function insertLeaves(contractName, leaves) {
  // console.log('\nPosting a request to insert leaves into the merkle-tree microservice...');
  try {
    // console.log(`\nCalling insertLeaves(${contractName})`);
    return new Promise((resolve, reject) => {
      const options = {
        url: `${url}/leaves`,
        method: 'post',
        json: true,
        data: { contractName, leaves },
      };
      axios(options).then(response => {
        resolve(response.data);
      }).catch(err => {
        reject(err);
      });
    });
  } catch (err) {
    throw new Error('Could not post a request to insert leaves into the merkle-tree microservice');
  }
}

async function update(contractName) {
  try {
    return new Promise((resolve, reject) => {
      const options = {
        url: `${url}/update`,
        method: 'patch',
        json: true,
        data: { contractName },
      };
      axios(options).then(response => {
        resolve(response.data);
      }).catch(err => {
        reject(err);
      });
    });
  } catch (err) {
    throw new Error('Could not post a request to insert leaves into the merkle-tree microservice');
  }
}

export default {
  startEventFilter,
  getSiblingPathByLeafIndex,
  getContractInterface,
  getContractAddress,
  postContractInterface,
  postContractAddress,
  insertTreeHeight,
  insertLeaves,
  update,
};
