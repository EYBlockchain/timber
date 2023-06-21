import { Schema } from 'mongoose';


export default new Schema(
  {
    contractId: {
      type: String,
      unique: true
    },
    contractAddress: {
      type: String,
      unique: true
    },
    txHash: {
        type: String,
        unique: true
    },
    blockNumber: {
        type: Number,
        unique: false
    }
  }
);
