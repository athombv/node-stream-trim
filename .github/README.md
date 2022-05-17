# node-stream-trim

Branch | Status
--- | ---
master | [![ESLint](https://github.com/athombv/node-stream-trim/workflows/Lint/badge.svg?branch=master)](https://github.com/athombv/node-stream-trim/actions?query=workflow%3ALint) [![Test](https://github.com/athombv/node-stream-trim/workflows/Test/badge.svg?branch=master)](https://github.com/athombv/node-stream-trim/actions?query=workflow%3ATest)
develop | [![ESLint](https://github.com/athombv/node-stream-trim/workflows/Lint/badge.svg?branch=develop)](https://github.com/athombv/node-stream-trim/actions?query=workflow%3ALint) [![Test](https://github.com/athombv/node-stream-trim/workflows/Test/badge.svg?branch=develop)](https://github.com/athombv/node-stream-trim/actions?query=workflow%3ATest)

## Usage

Installation:
```bash
> npm install --save @athombv/node-stream-trim
```

To trim an input stream from byte 5 until 11, do the following (test.js):

```javascript
const trimStream = require('@athombv/node-stream-trim').default;

const trim = trimStream({ start: 5, end: 12 });

process.stdin.pipe(trim).pipe(process.stdout);
```

Try it out:
```bash
echo "This is a test" | node test.js
is a te
```