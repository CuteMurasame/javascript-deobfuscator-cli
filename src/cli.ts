#!/usr/bin/env node
import { deobfuscate } from './index';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
const version: string = packageJson.version;

program
  .name('js-deobfuscator')
  .version(version)
  .description('Deobfuscate a javascript file')
  .argument('[input_file]', 'The input file to deobfuscate')
  .option('-i, --input <input_file>', 'The input file to deobfuscate')
  .option('-o, --output <output_file>', 'The deobfuscated output file')
  .option('-m, --module', 'Parse as an ECMAScript module')
  .option('-v, --verbose', 'Show verbose output')
  .option('-r, --rename', 'Rename hex identifiers to readable names')
  .option('--no-beautify', 'Disable code beautification')
  .option('--no-simplify-expressions', 'Disable expression simplification')
  .option('--no-simplify-properties', 'Disable computed to static property conversion')
  .option('--no-unpack-arrays', 'Disable array unpacking')
  .option('--no-remove-dead-branches', 'Disable dead branch removal')
  .option('--no-remove-proxy-functions', 'Disable proxy function removal');

program.parse(process.argv);
const options = program.opts();

// Determine input file: positional argument takes precedence, then --input flag
const inputFile = program.args[0] || options.input;
if (!inputFile) {
  console.error('Error: No input file specified. Use js-deobfuscator <input_file> or -i <input_file>');
  program.help();
  process.exit(1);
}

// Determine output file: --output flag, or default to <input_basename>.deobfuscated.js
const outputFile = options.output || (() => {
  const ext = path.extname(inputFile);
  const base = path.basename(inputFile, ext);
  const dir = path.dirname(inputFile);
  return path.join(dir, `${base}.deobfuscated${ext}`);
})();

// Check if the input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: The input file '${inputFile}' does not exist`);
  process.exit(1);
}

const source = fs.readFileSync(inputFile, 'utf-8');
const config = {
  verbose: options.verbose || false,
  isModule: options.module || false,
  arrays: {
    // Both controlled by --no-unpack-arrays since removing without unpacking has no effect
    unpackArrays: options.unpackArrays,
    removeArrays: options.unpackArrays,
  },
  proxyFunctions: {
    // Both controlled by --no-remove-proxy-functions since replacing without removing is incomplete
    replaceProxyFunctions: options.removeProxyFunctions,
    removeProxyFunctions: options.removeProxyFunctions,
  },
  expressions: {
    simplifyExpressions: options.simplifyExpressions,
    removeDeadBranches: options.removeDeadBranches,
    // String operations are a form of expression simplification
    undoStringOperations: options.simplifyExpressions,
  },
  miscellaneous: {
    beautify: options.beautify,
    simplifyProperties: options.simplifyProperties,
    renameHexIdentifiers: options.rename || false,
  }
};

try {
  const output = deobfuscate(source, config);

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, output, 'utf-8');
  console.info(`Deobfuscated output written to: ${outputFile}`);
} catch (err: any) {
  console.error(`Error during deobfuscation: ${err.message}`);
  process.exit(1);
}
