/**
@module web3.js
@desc
@author liju jose
*/

import Web3 from 'web3';
import config from 'config';
import logger from './logger';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
};


export default {
	connection() {
		if(!this.isConnected())
			this.connect();
		return this.web3;
	},

  buildUrl() {
    if (config.web3.rpcUrl) return config.web3.rpcUrl;
    return `${config.web3.host}:${config.web3.port}`;
  },

  /**
   * Connects to web3 and then sets proper handlers for events
   */
  connect() {
		if (this.isConnected()) {
			logger.debug('Blockchain connection already open');
			return this.web3;
		}

		logger.http("Blockchain Connecting...");
    const provider = new Web3.providers.WebsocketProvider(
      this.buildUrl(),
      config.web3.options,
    );


    provider.on("error", (err) => logger.error(`Blockchain connection error: ${err.reason}`));
		provider.on("connect", () => logger.http("Blockchain Connected"));
		provider.on("close", (err) => {
			logger.error(`Blockchain connection closed. Error code ${err.code}, reason "${err.reason}"`);
			this.isConnectionOpen = false;
			sleep(config.web3.autoReconnectInterval).then(() => {
				this.connect();
			});
		});
		provider.on("end", (err) => logger.error(`Blockchain Disconnected: ${err.reason}`));

		this.web3 = new Web3(provider);
		this.isConnectionOpen = true;


    this.web3.eth.subscribe('newBlockHeaders', function(error, result){
      if (!error) {
        console.log('Timber - Received from Blockchain node the block: ', result.number);
        return;
      }
      console.error('Timber - Subscribed newBlockHeaders events Error: ', error);
    })
    
    return this.web3;
  },

	/**
	 * Checks the status of connection
	 *
	 * @return {Boolean} - Resolves to true or false
	 */
	isConnected() {
		return this.isConnectionOpen;
	}
};
