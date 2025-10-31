import { Temperer } from './base.js';
export class JSONTemperer extends Temperer {
    _split(input) {
        const stuff = JSON.parse(input);
        if (Array.isArray(stuff)) {
            this._banner = '[';
            this._footer = ']';
            const chunks = [];
            for (const value of stuff) {
                chunks.push(JSON.stringify(value));
            }
            return chunks;
        }
        if (stuff !== null && typeof stuff === 'object') {
            this._banner = '{';
            this._footer = '}';
            const chunks = [];
            for (const [key, value] of Object.entries(stuff)) {
                chunks.push(`${JSON.stringify(key)}:${JSON.stringify(value)}`);
            }
            return chunks;
        }
        throw new TypeError('A JSON object or array is expected');
    }
    _assemble(chunks) {
        return `${this._banner}${chunks.join(',')}${this._footer}`;
    }
}
