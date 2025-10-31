import { deflateRawSync } from 'zlib';
export class Temperer {
    constructor(options) {
        this._maxRounds = (options && options.maxRounds !== undefined
            ? Math.round(options.maxRounds)
            : Infinity);
        if (isNaN(this._maxRounds) || this._maxRounds < 1) {
            throw new RangeError('maxRounds should be > 1');
        }
    }
    process(input) {
        let chunks = this._split(input);
        if (chunks.length > 100) {
            this._log('Looks like it will take a long time. Sit back and enjoy', 'debug');
        }
        if (chunks.length < 2) {
            this._log('There\'s nothing to shuffle', 'info');
            return this._assemble(chunks);
        }
        let startOfRoundScore = this._estimate(chunks);
        for (let round = 1; round <= this._maxRounds; round++) {
            this._log(`Round #${round}...`, 'info');
            let variants = [];
            for (let i = 0; i < chunks.length; i++) {
                variants.push({
                    chunks: chunks,
                    nucleusStart: i,
                    nucleusEnd: i + 1,
                    score: startOfRoundScore,
                });
            }
            while (variants[0].nucleusEnd - variants[0].nucleusStart < variants[0].chunks.length) {
                this._log(`${variants[0].score} so far`, 'progress');
                const newVariants = [];
                for (const oldVariant of variants) {
                    for (const newVariant of this._combinations(oldVariant)) {
                        newVariant.score = this._estimate(newVariant.chunks);
                        newVariants.push(newVariant);
                    }
                }
                variants = newVariants.sort(sortByScore).slice(0, chunks.length);
            }
            ;
            const bestVariant = variants[0];
            if (!bestVariant || bestVariant.score >= startOfRoundScore) {
                this._log(`Round #${round} finished: no size reduction`, 'info');
                break;
            }
            this._log(`Round #${round} finished: ${startOfRoundScore - bestVariant.score} B size reduction`, 'info');
            chunks = bestVariant.chunks;
            startOfRoundScore = bestVariant.score;
        }
        return this._assemble(chunks);
    }
    *_combinations(variant) {
        const nucleus = [];
        const pool = [];
        //  ╭ "nucleus" ╮ ╭─── "pool" ────╮
        // ╔══════╤══════╦─────┬─────┬─────┐
        // ║ woot │ root ║ foo │ bar │ baz │
        // ╚══════╧══════╩─────┴─────┴─────┘
        //  ╰─────────── chunks ──────────╯
        for (let i = 0; i < variant.chunks.length; i++) {
            if (i >= variant.nucleusStart && i < variant.nucleusEnd) {
                nucleus.push(variant.chunks[i]);
            }
            else {
                pool.push(variant.chunks[i]);
            }
        }
        for (let i = 0; i < pool.length; i++) {
            //                  ╭─────────→ ────╮
            // ╔══════╤══════╗ ┌─────┬─────┬─────┐
            // ║ woot │ root ║ │ baz │ foo │ bar │
            // ╚══════╧══════╝ └─────┴─────┴─────┘
            //                  ╰──── ←─────────╯
            pool.unshift(pool.pop());
            {
                // ╔══════╤══════╤═════╦─────┬─────┐
                // ║ woot │ root │ baz ║ foo │ bar │
                // ╚══════╧══════╧═════╩─────┴─────┘
                const chunks = [...nucleus, ...pool];
                yield {
                    chunks: chunks,
                    nucleusStart: 0,
                    nucleusEnd: nucleus.length + 1,
                    score: 0,
                };
            }
            {
                // ┌─────┬─────╦══════╤══════╤═════╗
                // │ foo │ bar ║ woot │ root │ baz ║
                // └─────┴─────╩══════╧══════╧═════╝
                const chunks = [...pool, ...nucleus];
                yield {
                    chunks: chunks,
                    nucleusStart: chunks.length - nucleus.length - 1,
                    nucleusEnd: chunks.length,
                    score: 0,
                };
            }
        }
    }
    _estimate(chunks) {
        return deflateRawSync(this._assemble(chunks)).byteLength;
    }
    _log(message, logLevel) {
        // Does nothing in the base class
    }
}
function sortByScore(v1, v2) {
    return v1.score - v2.score;
}
