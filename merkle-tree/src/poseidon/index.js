/*
 * @author Liju Jose
 */
 
import config from './config';

const { SNARK_SCALAR_FIELD, C, M } = config;

function addMod(addMe) {
  return addMe.reduce((e, acc) => (e + acc) % SNARK_SCALAR_FIELD, BigInt(0));
}

function mulMod(mulMe) {
  return mulMe.reduce((e, acc) => (e * acc) % SNARK_SCALAR_FIELD, BigInt(1));
}

function powerMod(base, exponent) {
  let result = BigInt(1);
  let b = base % SNARK_SCALAR_FIELD;
  let e = BigInt(exponent);
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) {
      result = (result * b) % SNARK_SCALAR_FIELD;
    }
    e >>= BigInt(1);
    b = (b * b) % SNARK_SCALAR_FIELD;
  }
  return result;
}

function bigIntMod(_num) {
  const num = BigInt(_num);
  return num >= SNARK_SCALAR_FIELD ? num % SNARK_SCALAR_FIELD : num;
}

export default function poseidonHash(inputs) {
  const N_ROUNDS_F = 8;
  const N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63];

  if (!Array.isArray(inputs) || !inputs.length || !(inputs.length < N_ROUNDS_P.length - 1)) {
    throw Error('Invalid inputs');
  }

  // t = numbers of inputs + 1
  const t = inputs.length + 1;
  const nRoundsF = N_ROUNDS_F;
  const nRoundsP = N_ROUNDS_P[t - 2];

  let state = [...inputs.map(a => bigIntMod(a)), BigInt(0)];

  for (let r = 0; r < nRoundsF + nRoundsP; r++) {
    state = state.map((a, i) => {
      return addMod([a, BigInt(C[t - 2][r * t + i])]);
    });

    if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
      state = state.map(a => powerMod(a, 5));
    } else {
      state[0] = powerMod(state[0], 5);
    }

    // no matrix multiplication in the last round
    if (r < nRoundsF + nRoundsP - 1) {
      // eslint-disable-next-line no-loop-func
      state = state.map((_, i) =>
        state.reduce((acc, a, j) => {
          return addMod([acc, mulMod([BigInt(M[t - 2][j][i]), a])]);
        }, BigInt(0)),
      );
    }
  }
  return `0x${bigIntMod(state[0])
    .toString(16) // hex string - can remove 0s
    .padStart(64, '0')}`; // so pad;
};

