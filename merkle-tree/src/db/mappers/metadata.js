export default function({ contractAddress, latestRecalculation, latestLeaf }) {
  let lrbn;
  let lrli;
  let lrr;
  let llbn;
  let llli;
  if (latestRecalculation) {
    lrbn = latestRecalculation.blockNumber;
    lrli = latestRecalculation.leafIndex;
    lrr = latestRecalculation.root;
  }
  if (latestLeaf) {
    llbn = latestLeaf.blockNumber;
    llli = latestLeaf.leafIndex;
  }

  return {
    [contractAddress ? 'contractAddress' : undefined]: contractAddress || undefined,

    // the initial ternary-operator logic on the object keys prevents us from overwriting values with 'undefined' when we do updates to the db
    [latestRecalculation ? 'latestRecalculation' : undefined]: {
      blockNumber: lrbn,
      leafIndex: lrli,
      root: lrr,
    },

    [latestLeaf ? 'latestLeaf' : undefined]: {
      blockNumber: llbn,
      leafIndex: llli,
    },
  };
}
