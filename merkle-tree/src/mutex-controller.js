import { Mutex } from 'async-mutex';

const mutex = new Mutex();

export { mutex };