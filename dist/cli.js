#!/usr/bin/env node
import yargs from 'yargs'; //[31;1m You need Node.js >= 12.0.0! [m
import { NewlineTemperer } from './newline.js';
import { JSONTemperer } from './json.js';
import { JSON5Temperer } from './json5.js';
const availTypes = ['json', 'json5', 'newline'];
async function readEntireStream(inputStream) {
    const chunks = [];
    for await (const chunk of inputStream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
const progressChars = ['⡈', '⠔', '⠢', '⢁'];
let progressCounter = 0;
async function main() {
    const argv = (yargs(process.argv.slice(2))
        .usage(`dict-tempering`)
        .usage('Change properties order for better GZIPpability.')
        .usage('Pass the input sting into stdin and the the result from stdout.')
        .options({
        type: { choices: availTypes, default: 'json5', description: 'Type of the input and output' },
        'max-rounds': { type: 'number', description: 'Max amount of rounds' },
    })
        .example('$0 <input.json5 >output.json5', '')
        .example('$0 --type=json <input.json5 >output.json5', '')
        .example('$0 --type=newline <input.txt >output.txt', '')
        .argv);
    if (process.stdin.isTTY && process.stderr.isTTY) {
        process.stderr.write('Pipe or type the string into stdin!\n');
    }
    let Implementation = (argv.type === 'json5' ? JSON5Temperer :
        argv.type === 'json' ? JSONTemperer :
            argv.type === 'newline' ? NewlineTemperer :
                null);
    class LoggingImpl extends Implementation {
        _log(message, logLevel) {
            const usesColor = process.stderr.hasColors ? process.stderr.hasColors() : process.stderr.isTTY;
            const formatted = usesColor ? logFmtTeletype(message, logLevel) : logFmtRaw(message, logLevel);
            if (formatted) {
                process.stderr.write(formatted);
            }
        }
    }
    const res = new LoggingImpl({ maxRounds: argv['max-rounds'] }).process(await readEntireStream(process.stdin));
    process.stdout.write(res);
    if (process.stdout.isTTY) {
        process.stdout.write('\n');
    }
}
function logFmtTeletype(message, logLevel) {
    if (logLevel === 'progress') {
        progressCounter = (progressCounter + 1) % progressChars.length;
        return (
        // Erase up to the end of the line
        '\u001b[K' +
            // Animated progress indicator
            progressChars[progressCounter] + ' ' +
            message +
            // Move to caret back to the
            `\r`);
    }
    if (logLevel === 'error') {
        return ('\u001b[K' +
            // Black on red
            '\u001b[41;30m' + 'ERR!' + '\u001b[m' + ' ' +
            message +
            '\n');
    }
    if (logLevel === 'warning') {
        return ('\u001b[K' +
            // Black on orange
            '\u001b[43;30m' + 'WARN' + '\u001b[m' + ' ' +
            message +
            '\n');
    }
    if (logLevel === 'debug') {
        return ('\u001b[K' +
            // Blue on default
            '\u001b[34m' +
            message +
            `\u001b[m` +
            '\n');
    }
    return ('\u001b[K' +
        message +
        '\n');
}
function logFmtRaw(message, logLevel) {
    if (logLevel === 'progress') {
        return undefined;
    }
    if (logLevel === 'warning') {
        return 'WARN ' + message + '\n';
    }
    if (logLevel === 'error') {
        return 'ERR! ' + message + '\n';
    }
    return message + '\n';
}
main().catch((error) => {
    console.error(error.stack);
    process.exit(1);
});
