/**
 * 用於處理數據的工具函數。
 */
export default class DataUtils {
  
  /**
   * 不能碰！
   */
  private constructor() {}

  /**
   * 不改變原本陣列，以Fisher-Yates算法洗牌。
   * @param array 要洗牌的陣列
   * @returns 一個新的、已洗牌的陣列
   */
  public static shuffleArray<T>(array: T[]): T[] {
      // 創建一個陣列的副本以避免修改原陣列
      const shuffled = [...array];
      
      // Fisher-Yates 洗牌演算法
      for (let i = shuffled.length - 1; i > 0; i--) {
          // 隨機選擇一個索引 (0 到 i)
          const j = Math.floor(Math.random() * (i + 1));
          
          // 交換元素
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled;
  }

  /**
   * 將一個陣列的內容原地洗牌。
   * @param array 要洗牌的陣列
   * @returns 已洗牌的陣列
   */
  public static shuffleArrayInPlace<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}