'use strict';

import * as assert from 'assert';
// const assert = require('assert');
import trimStream from '../lib/index';

describe('TrimStream', () => {
  describe('small chunk', () => {
    it('should return last part of chunk', async () => {
      const stream = trimStream({ start: 2, end: 4 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert.strictEqual(result.toString(), 'st');
    });
    it('should return first part of chunk', async () => {
      const stream = trimStream({ start: 0, end: 1 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert(result.toString() === 't');
    });
  });

  describe('multiple chunks', () => {
    it('should return last part of chunk', async () => {
      const stream = trimStream({ start: 2, end: 4 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      let chunk = Buffer.from('t');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('e');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('s');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('t');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert(result.toString() === 'st');
    });
    it('should return all it gets if not enough is available', async () => {
      const stream = trimStream({ start: 2, end: 40 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      let chunk = Buffer.from('t');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('e');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('s');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from('t');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert(result.toString() === 'st');
    });
    it('should not return anything if none matches', async () => {
      const stream = trimStream({ start: 20, end: 40 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert(result.byteLength === 0);
    });
    it('should return middle part of chunk', async () => {
      const stream = trimStream({ start: 5, end: 6 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      let chunk = Buffer.from('this');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from(' is');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from(' a');
      stream._transform(chunk, 'binary', () => {});
      chunk = Buffer.from(' test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert(result.toString() === 'i');
    });
  });
});

// import transportStream from '../lib/index';

// process.stdin.pipe(transportStream({ start: Number.parseInt(process.argv[2], 10), end: Number.parseInt(process.argv[3], 10) })).pipe(process.stdout);
