export interface ITemperer<T> {
    process(input: T): T;
}
export interface Options {
    readonly maxRounds: number;
}
export declare type LogLevel = 'error' | 'warning' | 'info' | 'progress' | 'debug';
interface Variant<T> {
    readonly chunks: readonly T[];
    readonly nucleusStart: number;
    readonly nucleusEnd: number;
    score: number;
}
export declare abstract class Temperer<T extends string | Uint8Array> implements ITemperer<T> {
    private _maxRounds;
    constructor(options?: Partial<Options>);
    /**
     * Implement your own in a subclass!
     * @param input stuff to break up into movable chunks
     * @returns an array of chunks (without header and banner)
     */
    protected abstract _split(input: T): readonly T[];
    /**
     * Implement your own in a subclass!
     * @param chunks an array of chunks (without header and banner)
     * @returns glued up stuff
     */
    protected abstract _assemble(chunks: readonly T[]): T;
    process(input: T): T;
    protected _combinations(variant: Variant<T>): Generator<Variant<T>, void, void>;
    protected _estimate(chunks: readonly T[]): number;
    protected _log(message: string, logLevel?: LogLevel): void;
}
export {};
