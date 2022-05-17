'use strict';

import { Transform, TransformCallback } from 'stream';

class TrimStream extends Transform {

  startByte = 0;
  endByte = -1;
  index = 0;

  constructor(start: number | undefined, end: number | undefined) {
    super();
    this.startByte = start || 0;
    this.endByte = end || -1;
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    const startChunk = this.index;
    const endChunk = this.index + chunk.byteLength;

    if (startChunk <= this.startByte && endChunk > this.startByte) {
      // We need the last part of this chunk
      this.push(chunk.slice(this.startByte - startChunk, Math.min(endChunk, this.endByte) - startChunk));
    } else if (startChunk >= this.startByte && endChunk <= this.endByte) {
      // We need the entire chunk
      this.push(chunk);
    } else if (startChunk < this.endByte && endChunk > this.endByte && startChunk >= this.startByte) {
      // We need the first part of this chunk
      this.push(chunk.slice(0, this.endByte - startChunk));
    } else if (startChunk <= this.startByte && endChunk >= this.endByte) {
      // We need the middle part of this chunk
      this.push(chunk.slice(this.startByte - startChunk, this.endByte - (startChunk - this.startByte)));
    }
    this.index += chunk.byteLength;
    callback();
  }

}

type Options = {
  start: number | undefined;
  end: number | undefined;
}

function trimStream(options: Options) {
  return new TrimStream(options.start, options.end);
}

export default trimStream;
