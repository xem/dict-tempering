import { Temperer } from './base.js';
export class NewlineTemperer extends Temperer {
    _split(input) {
        if (input.includes('\r\n')) {
            this._log('CRLF (Windows) newlines will be replaced with LF (Unix)!', 'warning');
        }
        const lines = input.split(/\r?\n/);
        const chunks = lines.filter(Boolean);
        if (chunks.length !== lines.length) {
            this._log('Empty lines and a trailing newline will be ignored!', 'warning');
        }
        return chunks;
    }
    _assemble(chunks) {
        return chunks.join('\n');
    }
}
