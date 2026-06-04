export class BitSet {
    private words: Uint32Array;
    constructor(size: number = 64) {
        this.words = new Uint32Array(Math.ceil(size / 32));
    }
    set(n: number) {
        let wordIndex = n >>> 5;
        let bitIndex = n & 31;
        this.words[wordIndex] |= (1 << bitIndex);
    }
    has(n: number) {
        let wordIndex = n >>> 5;//2^5=32
        let bitIndex = n & 31;
        return (this.words[wordIndex] & (1 << bitIndex)) !== 0;
    }
    matches(required: BitSet) {
        //逐个数字比较
        for (let i = 0; i < this.words.length; i++) {
            if ((this.words[i] & required.words[i]) !== required.words[i]) {
                return false;
            }
        }
        return true;
    }
    clear(n: number) {
        let wordIndex = n >>> 5;
        let bitIndex = n & 31;
        this.words[wordIndex] &= ~(1 << bitIndex);
    }
}