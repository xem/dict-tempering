import { Temperer } from './base.js';
export declare class JSONTemperer extends Temperer<string> {
    protected _banner: string;
    protected _footer: string;
    protected _split(input: string): readonly string[];
    protected _assemble(chunks: readonly string[]): string;
}
