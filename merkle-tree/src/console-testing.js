/**
This is just a scrapbook for quick debugging of utility functions
*/

/*
Execute this from the command line:
cd path/to/src
npx babel-node console-testing
*/

import utilsMT from './utils-merkle-tree';
import logger from './logger';

// logger.info(utilsMT.rightChildBinaryIndex(0b11).toString(2));

// logger.info(utilsMT.getSiblingPathIndices('50'));

// logger.info(utilsMT.testMerkleRecursion(0));

async function main() {
  logger.info(utilsMT.numberOfHashes(2 ** 31, 5, 32));
}

main();
