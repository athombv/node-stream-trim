'use strict';

import * as assert from 'assert';
// const assert = require('assert');
import StreamTrim from '../dist/index';

describe('StreamTrim', () => {
  describe('small chunk', () => {
    it('should return last part of chunk', async () => {
      const stream = new StreamTrim({ start: 2, end: 4 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert.equal(result.toString(), 'st');
    });
    it('should return first part of chunk', async () => {
      const stream = new StreamTrim({ start: 0, end: 1 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert.equal(result.toString(), 't');
    });
  });

  describe('multiple chunks', () => {
    it('should return last part of chunk', async () => {
      const stream = new StreamTrim({ start: 2, end: 4 });
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
      assert.equal(result.toString(), 'st');
    });
    it('should return all it gets if not enough is available', async () => {
      const stream = new StreamTrim({ start: 2, end: 40 });
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
      assert.equal(result.toString(), 'st');
    });
    it('should not return anything if none matches', async () => {
      const stream = new StreamTrim({ start: 20, end: 40 });
      const bufs: Array<Buffer> = [];
      stream.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      const chunk = Buffer.from('test');
      stream._transform(chunk, 'binary', () => {});
      stream.end();
      await new Promise(fulfill => stream.on('finish', fulfill));
      const result = Buffer.concat(bufs);
      assert.equal(result.byteLength, 0);
    });
    it('should return middle part of chunk', async () => {
      const stream = new StreamTrim({ start: 5, end: 6 });
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
      assert.equal(result.toString(), 'i');
    });
  });

  describe('Error handling', () => {
    it('should throw an error when start > end', () => {
      assert.throws(() => {
        // eslint-disable-next-line
        new StreamTrim({ start: 10, end: 2 });
      });
    });
    it('should throw an error when start or end is negative', () => {
      assert.throws(() => {
        // eslint-disable-next-line
        new StreamTrim({ start: -10, end: 2 });
      });
      assert.throws(() => {
        // eslint-disable-next-line
        new StreamTrim({ start: 10, end: -2 });
      });
      assert.throws(() => {
        // eslint-disable-next-line
        new StreamTrim({ start: -10, end: -2 });
      });
    });
  });

  describe('Unset parameters', () => {
    it('should return until the end when end is undefined', async () => {
      const stream = new StreamTrim({ start: 5 });
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
      assert.equal(result.toString(), 'is a test');
    });
    it('should return everything when end and start are undefined', async () => {
      const stream = new StreamTrim({ });
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
      assert.equal(result.toString(), 'this is a test');
    });
    it('should return from 0 when start is undefined', async () => {
      const stream = new StreamTrim({ end: 4 });
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
      assert.equal(result.toString(), 'this');
    });
  });
});
