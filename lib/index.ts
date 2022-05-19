'use strict';

import { Transform, TransformCallback } from 'stream';

class StreamTrim extends Transform {

  startByte = 0;
  endByte = -1;
  index = 0;

  constructor({ start, end }:{ start?: number, end?: number }) {
    super();
    if (start && start < 0) {
      throw new Error('start must be greater than 0');
    }
    if (end && end < 0) {
      throw new Error('end must be greater than 0');
    }
    if (start && end && start > end) {
      throw new Error('end must be lower than start');
    }
    this.startByte = start || 0;
    this.endByte = end || -1;
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    const startChunk = this.index;
    const endChunk = this.index + chunk.byteLength;

    if (startChunk <= this.startByte && endChunk > this.startByte) {
      // We need the last part of this chunk
      this.push(chunk.slice(this.startByte - startChunk, this.endByte !== -1 ? (Math.min(endChunk, this.endByte) - startChunk) : endChunk));
    } else if (startChunk >= this.startByte && (this.endByte === -1 || endChunk <= this.endByte)) {
      // We need the entire chunk
      this.push(chunk);
    } else if (startChunk < this.endByte && endChunk > this.endByte && startChunk >= this.startByte) {
      // We need the first part of this chunk (when endByte is -1 we hit the previous if)
      this.push(chunk.slice(0, this.endByte - startChunk));
    } else if (startChunk <= this.startByte && (this.endByte !== -1 && endChunk >= this.endByte)) {
      // We need the middle part of this chunk
      this.push(chunk.slice(this.startByte - startChunk, this.endByte - (startChunk - this.startByte)));
    }
    this.index += chunk.byteLength;
    callback();
  }

}

module.exports = StreamTrim;
