import { Temperer } from './base.js';
export declare class NewlineTemperer extends Temperer<string> {
    protected _split(input: string): readonly string[];
    protected _assemble(chunks: readonly string[]): string;
}
