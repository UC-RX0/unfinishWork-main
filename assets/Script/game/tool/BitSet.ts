/**位集类
 * 用于存储布尔值的位集，每个位表示一个布尔值。
*/
export class BitSet {
    /**位集数组，每个元素表示32位 */
    private words: Uint32Array;
    constructor(size: number = 64) {
        //初始化位集数组
        //每个元素表示32位
        //每个元素的每个位表示一个布尔值
        //每个元素的每个位的索引表示该位在数组中的位置
        this.words = new Uint32Array(Math.ceil(size / 32));
    }
    set(n: number) {
        //获取n的高5位 作为元素索引
        let wordIndex = n >>> 5;
        //检查是否超出边界 ，超出边界则扩展数组
        if (wordIndex >= this.words.length) {
            //如果超出边界 则扩展数组
            let newWords = new Uint32Array(Math.max(wordIndex + 1, this.words.length));
            //将旧数组的内容复制到新数组中
            newWords.set(this.words);
            this.words = newWords;
        }
        //获取n的低5位 作为位索引
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
    /**清除指定位 */
    clear(n: number) {
        let wordIndex = n >>> 5;
        let bitIndex = n & 31;
        //~操作 清除指定位 取反后与操作
        this.words[wordIndex] &= ~(1 << bitIndex);
    }
}