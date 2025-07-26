// BV/AV互转算法常量
// 参考 https://github.com/TGSAN/bv2av.js/blob/master/bv2av.js
const TABLE = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
const MAX_AVID = 1n << 51n;
const BASE = 58n;
const BVID_LEN = 12n;
const XOR = 23442827791579n;
const MASK = 2251799813685247n;

// 构建字符索引
const charIndex: Record<string, number> = {};
for (let i = 0; i < Number(BASE); i++) {
    charIndex[TABLE[i]] = i;
}

/**
 * BV号转AV号
 * @param bvid BV号 (如: BVfx411c7Z8)
 * @returns AV号 (如: av114514)
 */
export function bvToAv(bvid: string): string {
    if (!bvid || typeof bvid !== 'string') {
        throw new Error('Invalid BV ID');
    }
    
    // 移除可能的前缀并验证格式
    const cleanBvid = bvid.replace(/^(bv|BV)/i, '');
    if (cleanBvid.length !== 10) {
        throw new Error('Invalid BV ID format');
    }
    
    const fullBvid = 'BV' + cleanBvid;
    const chars = fullBvid.split('');
    
    // 交换字符位置
    [chars[3], chars[9]] = [chars[9], chars[3]];
    [chars[4], chars[7]] = [chars[7], chars[4]];
    
    // 计算av号
    let temp = 0n;
    for (const char of chars.slice(3)) {
        const idx = charIndex[char];
        if (idx === undefined) {
            throw new Error('Invalid character in BV ID');
        }
        temp = temp * BASE + BigInt(idx);
    }
    
    const avid = (temp & MASK) ^ XOR;
    return `av${avid}`;
}

/**
 * AV号转BV号
 * @param avid AV号 (如: av114514 或 114514)
 * @returns BV号 (如: BVfx411c7Z8)
 */
export function avToBv(avid: string | number): string {
    let cleanAvid: string;
    
    if (typeof avid === 'string') {
        cleanAvid = avid.replace(/^av/i, '');
    } else if (typeof avid === 'number') {
        cleanAvid = avid.toString();
    } else {
        throw new Error('Invalid AV ID');
    }
    
    const avidBigInt = BigInt(cleanAvid);
    if (avidBigInt <= 0n || avidBigInt >= MAX_AVID) {
        throw new Error('AV ID out of range');
    }
    
    const result = ['B', 'V', '1', '', '', '', '', '', '', '', '', ''];
    let idx = BVID_LEN - 1n;
    let temp = (MAX_AVID | avidBigInt) ^ XOR;
    
    while (temp !== 0n) {
        result[Number(idx)] = TABLE[Number(temp % BASE)];
        temp /= BASE;
        idx -= 1n;
    }
    
    // 交换字符位置
    [result[3], result[9]] = [result[9], result[3]];
    [result[4], result[7]] = [result[7], result[4]];
    
    return result.join('');
}

/**
 * 标准化视频ID为AV号格式，用于去重比较
 * @param videoId 视频ID (BV号或AV号)
 * @returns 标准化的AV号
 */
export function normalizeVideoId(videoId: string): string {
    if (!videoId || typeof videoId !== 'string') {
        return videoId;
    }
    
    try {
        // 如果是BV号，转换为AV号
        if (/^bv/i.test(videoId)) {
            return bvToAv(videoId);
        }
        
        // 如果是AV号，确保格式统一
        if (/^av/i.test(videoId)) {
            const cleanAv = videoId.replace(/^av/i, '');
            return `av${cleanAv}`;
        }
        
        // 如果是纯数字，当作AV号处理
        if (/^\d+$/.test(videoId)) {
            return `av${videoId}`;
        }
        
        return videoId;
    } catch (error) {
        // 转换失败时返回原值
        return videoId;
    }
}