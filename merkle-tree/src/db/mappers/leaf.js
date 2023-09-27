import utilsMT from '../../utils-merkle-tree';
import logger from '../../logger';

// This 'leaf' mapper differs from the 'node' mapper.
// export default async function(treeHeight, { value, nodeIndex, leafIndex, blockNumber }) {
export default function(treeHeight, { value, nodeIndex, leafIndex, blockNumber }) {
  // to prevent incorrect leaf data from being stored, we ensure the nodeIndex is calculated correctly from the leafIndex:
  const checkNodeIndex = utilsMT.leafIndexToNodeIndex(leafIndex, treeHeight);
  if (!nodeIndex) {
    nodeIndex = checkNodeIndex; // eslint-disable-line no-param-reassign
    logger.debug(`Inserting a nodeIndex of ${nodeIndex} for leafIndex ${leafIndex}`);
    logger.debug(
      `TIMBER-RABBITMQ >>> value ${value}, nodeIndex ${nodeIndex}, leafIndex ${leafIndex}`,
    );
  } else if (nodeIndex !== checkNodeIndex) {
    throw new Error(
      `Intercepted an incorrect nodeIndex of ${nodeIndex} for leafIndex ${leafIndex}. The nodeIndex should have been ${checkNodeIndex}`,
    );
  }
  logger.debug(
    `Right before returning leafMapper >>> value ${value}, nodeIndex ${nodeIndex}, leafIndex ${leafIndex}, blockNumber ${blockNumber}`,
  );
  return {
    value,
    nodeIndex,
    leafIndex,
    blockNumber,
  };
}
