# General purpose JavaScript deobfuscator

A simple but powerful deobfuscator to remove common JavaScript obfuscation techniques.
Open an issue if there is a feature you think should be implemented.

Online version at [deobfuscate.io](https://deobfuscate.io)

Looking for a deobfuscator specific to Obfuscator.io/javascript-obfuscator? Try [this repo](https://github.com/ben-sb/deobfuscator-io)

If you would like to discuss/learn about JavaScript obfuscation and deobfuscation you can join the [Discord server](https://discord.com/invite/KQjZx2X28n)

## Installation

### Standalone Linux Binary

Download the latest Linux executable from the [GitHub Releases](../../releases) page. No Node.js required.

```shell
chmod +x js-deobfuscator-linux
./js-deobfuscator-linux input.js -o output.js
```

### Via npm

Install globally via npm:

```shell
npm install -g js-deobfuscator
```

Or install locally as a library:

```shell
npm install js-deobfuscator
```

## CLI Usage

```shell
> js-deobfuscator -h
Usage: js-deobfuscator [options] [input_file]

Deobfuscate a javascript file

Arguments:
  input_file                   The input file to deobfuscate

Options:
  -V, --version                output the version number
  -i, --input <input_file>     The input file to deobfuscate
  -o, --output <output_file>   The deobfuscated output file
  -m, --module                 Parse as an ECMAScript module
  -v, --verbose                Show verbose output
  -r, --rename                 Rename hex identifiers to readable names
  --no-beautify                Disable code beautification
  --no-simplify-expressions    Disable expression simplification
  --no-simplify-properties     Disable computed to static property conversion
  --no-unpack-arrays           Disable array unpacking
  --no-remove-dead-branches    Disable dead branch removal
  --no-remove-proxy-functions  Disable proxy function removal
  -h, --help                   display help for command
```

### Examples

Deobfuscate a file (output defaults to `<filename>.deobfuscated.js`):

```shell
js-deobfuscator obfuscated.js
```

Specify input and output files:

```shell
js-deobfuscator -i obfuscated.js -o clean.js
```

Deobfuscate with verbose logging and hex identifier renaming:

```shell
js-deobfuscator -v -r obfuscated.js -o clean.js
```

### Library Usage

```javascript
const { deobfuscate } = require('js-deobfuscator');

const source = '...'; // obfuscated source code
const output = deobfuscate(source, { verbose: true });
console.log(output);
```

## Features

-   Unpacks arrays containing literals (strings, numbers etc) and replaces all references to them
-   Removes simple proxy functions (calls to another function), array proxy functions and arithmetic proxy functions (binary expressions)
-   Simplifies arithmetic expressions
-   Simplifies string concatenation
-   Renames unreadable hexadecimal identifiers (e.g. \_0xca830a)
-   Converts computed to static member expressions and beautifies the code

## Examples

See bottom for more complicated example with features chained together.

### Array Unpacking

Before

```javascript
const a = ['\x20', '\x57\x6f\x72\x6c\x64', '\x48\x65\x6c\x6c\x6f'];

console.log(a[2] + a[0] + a[1]);
```

After

```javascript
console.log('Hello' + ' ' + 'World');
```

<br/>

### Proxy Functions

#### An example with simple proxy functions for other functions

Before

```javascript
function a(b, c) {
    return someFunction(b, c);
}

const result = a(5, 6);
```

After

```javascript
const result = someFunction(5, 6);
```

<br/>

#### An example with proxy functions for arithmetic

Before

```javascript
function a(b, c) {
    return c + 2 * b;
}

const result = a(5, 6);
```

After

```javascript
const result = 6 + 2 * 5;
```

<br/>

#### An example with chained proxy functions

Before

```javascript
function a(b, c) {
    return c + 2 * b;
}
function b(c, d) {
    return a(c, d);
}
function c(d, e) {
    return b(d, e);
}

const result = c(5, 6);
```

After

```javascript
const result = 6 + 2 * 5;
```

<br/>

### Expression Simplification

#### An example with numbers

Before

```javascript
let total = 0x2 * 0x109e + -0xc * -0x16a + -0x3234;
for (let i = 0x1196 + 0x97b * 0x3 + -0x2e07; i < -0x95 * -0x38 + -0x1a75 + -0x619; i++) {
    total += i;
}
```

After

```javascript
let total = 0;
for (let i = 0; i < 10; i++) {
    total += i;
}
```

<br/>

#### An example with strings.

Before

```javascript
console.log('He' + 'll' + 'o' + ' Wo' + 'r' + 'ld');
```

After

```javascript
console.log('Hello World');
```

<br/>

### Overall Example

All these features can be chained together to simplify code.

Before

```javascript
const ar = [
    '\x48\x65\x6c\x6c\x6f',
    0x95,
    '\x20',
    0x1a75,
    '\x57\x6f\x72\x6c\x64',
    -0x53,
    '\x6c\x6f\x67'
];
const a = function (b, c) {
        return c + 2 * b;
    },
    b = function (c, d) {
        return a(c, d);
    },
    c = function (d, e) {
        return b(d, e);
    };
const message = ar[0] + ar[2] + ar[4];
const result = c(ar[1] * 0x38 + ar[3] + 0x619, 0x12 * ar[5] + 0x1a13 + 0x621);
console[ar[6]](message + ' ' + result);
```

After

```javascript
const message = 'Hello World';
const result = 40106;
console.log(message + ' ' + result);
```

## Config

```typescript
interface Config {
    verbose: boolean;
    isModule: boolean;
    arrays: {
        unpackArrays: boolean;
        removeArrays: boolean;
    };
    proxyFunctions: {
        replaceProxyFunctions: boolean;
        removeProxyFunctions: boolean;
    };
    expressions: {
        simplifyExpressions: boolean;
        removeDeadBranches: boolean;
    };
    miscellaneous: {
        beautify: boolean;
        simplifyProperties: boolean;
        renameHexIdentifiers: boolean;
    };
}
```

## Building from Source

```shell
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build standalone Linux executable
npm run build:binary
```

The Linux executable will be created at `build/js-deobfuscator-linux`.

## Automated Builds

This project uses GitHub Actions to automatically build a standalone Linux executable on every push to the main branch. Tagged releases (e.g. `v1.2.0`) will automatically create a GitHub Release with the binary attached.

Alternatively use the online version at [deobfuscate.io](https://deobfuscate.io)
