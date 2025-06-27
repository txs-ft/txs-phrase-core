import DataUtils from '../utils/DataUtils';

/**
 * 簡化版的詞類(Parts of Speech)
 */
export const enum PoS {

  /**
   * 名詞
   */
  NOUN = 0,

  /**
   * 動詞
   */
  VERB = 1,
  
  /**
   * 形容詞
   */
  ADJECTIVE = 2,

  /**
   * 介詞
   */
  PREPOSITION = 3,

  /**
   * 副詞
   */
  ADVERB = 4,

  /**
   * 其他
   */
  OTHER = 5
}

/**
 * 管理不同{@link PoS}物件樣式的接口協議。
 */
export interface IPoSStyle {

  /**
   * 代表{@link PoS}的字符串
   */
  readonly key: string;

  /**
   * 代表{@link PoS}的顏色圓點表情符號
   */
  readonly dot: string;

  /**
   * 代表{@link PoS}的16位顏色字符串，用於背景
   */
  readonly colorBack: string;

  /**
   * 代表{@link PoS}的16位顏色字符串，用於前景
   */
  readonly colorFront: string;
}

export const PoSStyles: IPoSStyle[] = [
  {
    key: "n",
    dot: "🔵",
    colorBack: "#0078D7",
    colorFront: "#FFFFFF"
  },
  {
    key: "v",
    dot: "🔴",
    colorBack: "#E81224",
    colorFront: "#FFFFFF"
  },
  {
    key: "adj",
    dot: "🟢",
    colorBack: "#16C60C",
    colorFront: "#000000"
  },
  {
    key: "prep",
    dot: "🟠",
    colorBack: "#F7630C",
    colorFront: "#000000"
  },
  {
    key: "adv",
    dot: "🟡",
    colorBack: "#FFF100",
    colorFront: "#000000"
  },
  {
    key: "other",
    dot: "⚫",
    colorBack: "#383838",
    colorFront: "#FFFFFF"
  },
] as const;


/**
 * 詞條管理集合，管理簡化版的詞類，包括名詞、動詞、形容詞、
 */
export class PoSCollection {

  private data: [
    string[], // nouns
    string[], // verbs
    string[], // adjectives
    string[], // prepositions
    string[], // adverbs
    string[]  // others
  ];

  /**
   * 產生一個空白的{@link PoSCollection}個例。
   * 
   * 若要產生一個有初始數據的個例，應使用{@link PoSCollection.fromQueryString(string)}。
   */
  public constructor() {
    this.data = [
      [], // nouns
      [], // verbs
      [], // adjectives
      [], // prepositions
      [], // adverbs
      []  // others
    ];
  }

  /**
   * 生成一個{@link PoSCollection}個例。
   * 
   * @example PoSCollection.fromQueryString("https://examples.com?parts=The%20quick%20brown%20fox%7cjumps%7cover%7cthe%20lazy%20dog%7c,%7cand%7cfalls%7cinto%7ca%20rubbish%20bin%7c.&n=The%20quick%20brown%20fox%7cthe%20lazy%20dog%7ca%20rubbish%20bin&v=jumps`&adj=quick%7clazy&prep=over%7cinto&other=.%7c,%7cand", true);
   * @param queryString 取自瀏覽器URL欄的queryString
   * @param shuffle 是否要把零件陣列洗牌
   * @returns 一個新的{@link PoSCollection
   *}
   */
  public static fromQueryString(queryString: string, shuffle: boolean): PoSCollection {
    const ret = new PoSCollection();
    const params = new URLSearchParams(queryString);
    
    // 加入所有queryString裡有的詞類
    add(PoS.NOUN);
    add(PoS.VERB);
    add(PoS.ADJECTIVE);
    add(PoS.PREPOSITION);
    add(PoS.ADVERB);
    add(PoS.OTHER);

    return ret;

    function add(partsOfSpeech: PoS) {
      const ss = params.get(PoSStyles[partsOfSpeech].key)?.split("|"); // 裝載詞類為pos陣列，可為undefined，因為用戶沒加到queryString中
      if (ss !== undefined) {
        ret.data[partsOfSpeech].push(...ss);
        if (shuffle) DataUtils.shuffleArrayInPlace(ret.data[partsOfSpeech]);
      }
    }
  }

  /**
   * 基於{@link PoSCollection}中的內容，生成相應的queryString。
   * @returns queryString，即url中?及以後的部分
   */
  public toQueryString(): string {
    const params = new URLSearchParams();
    
    // 遍歷所有詞類
    for (let i = 0; i < this.data.length; i++) {
      const pos = i as PoS; // 確保類型為 PoS
      const key = PoSStyles[pos].key;
      const items = this.data[pos];
      
      // 如果該詞類有項目，則添加到參數中
      if (items.length > 0) {
        const value = items.join("|");
        params.append(key, value);
      }
    }
    
    return params.toString();
  }

  /**
   * 根據{@link PoSCollection}的內容，生成完整的網址。
   * @param host 服務器網址，如https://examples.com
   * @returns 完整的網址，如"https://examples.com?parts=The%20quick%20brown%20fox%7cjumps%7cover%7cthe%20lazy%20dog%7c,%7cand%7cfalls%7cinto%7ca%20rubbish%20bin%7c.&n=The%20quick%20brown%20fox%7cthe%20lazy%20dog%7ca%20rubbish%20bin&v=jumps`&adj=quick%7clazy&prep=over%7cinto&other=.%7c,%7cand"
   */
  public toFullURL(host: string): string {
    return `${host}?${this.toQueryString()}`;
  }

  /**
   * 向特定詞類({@link PoS})加入一個新詞條。
   * @param pos 詞類({@link PoS})
   * @param item 詞條
   */
  public add(pos: PoS, item: string): void {
    this.data[pos].push(item);
  }

}