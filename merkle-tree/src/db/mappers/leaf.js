import utilsMT from '../../utils-merkle-tree';
import logger from '../../logger';
import amqp from 'amqplib';
const amqpUrl =
  `${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}` || 'amqp://localhost:5672';

const publishLeaf = async (leafValue, leafIndex) => {
  logger.debug(`Inside leaf publishing >>> leafValue ${leafValue} and leafIndex ${leafIndex}`);
  const connection = await amqp.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();
  try {
    console.log('Publishing');
    const exchange = 'user.timber_nfc';
    const queue = 'user.commitments';
    const routingKey = 'commitments';
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    const msg = JSON.parse(`{"${leafValue}":"${leafIndex}"}`);
    await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)));
    console.log('Message published');
  } catch (e) {
    console.error('Error in publishing message', e);
  } finally {
    await channel.close();
    await connection.close();
  }
  return 0;
};

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
    publishLeaf(value, leafIndex);
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
