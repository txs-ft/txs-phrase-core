/**
 * 词性位掩码枚举
 * 每个值对应特定词性的位标识
 */
export enum DictPoS {
    NONE = 0,
    NOUN = 1 << 0,         // 1
    VERB = 1 << 1,         // 2
    ADJECTIVE = 1 << 2,    // 4
    ADVERB = 1 << 3,       // 8
    PREPOSITION = 1 << 4,  // 16
    CONJUNCTION = 1 << 5,  // 32
    DETERMINER = 1 << 6,   // 64
    NUMBER = 1 << 7,       // 128
    PRONOUN = 1 << 8,      // 256
    EXCLAMATION = 1 << 9,  // 512
    PHRASAL_VERB = 1 << 10, // 1024
    IDIOM = 1 << 11        // 2048
}

// ===================== 辅助接口定义 =====================
interface Pronunciation {
  uk: string;
  us: string;
}

interface AudioInfo {
  uk: {
    ipa: string;
    audioPath: string;
  };
  us: {
    ipa: string;
    audioPath: string;
  };
}

interface DefinitionDetail {
  level: string | null;
  longDef: {
    en: string;
      cn: string;
  };
  examples: Array<{
    gram: string | null;
    en: string;
    cn: string | null;
  }>;
}

interface DefGroup {
  simple: string | null;
  defs: DefinitionDetail[];
}

interface DefinitionGroup {
  pos: string;
  defBitmask: number;
  pron: Pronunciation;
  audio: AudioInfo;
  defGroups: DefGroup[];
  syllableCount: number;
  stressIndex: number;
}

interface DictionaryEntryData {
  title: string;
  generalBitmask: number;
  time?: number;
  allDefinitions: DefinitionGroup[];
}

/**
 * 错误码枚举
 */
export enum DictionaryEntryErrorCode {

  /**
   * 尝试访问未加载的数据
   */
  NOT_LOADED = "NOT_LOADED",

  /**
   * 网络请求失败
   */
  NETWORK_ERROR = "NETWORK_ERROR",

  /**
   * 数据格式无效
   */
  INVALID_DATA = "INVALID_DATA",

  /**
   * 其他加载失败
   */
  LOAD_FAILURE = "LOAD_FAILURE",

  /**
   * 連結無效
   */
  INVALID_LINK = "INVALID_LINK"
}

/**
 * 詞條错误类
 */
export class DictionaryEntryError extends Error {
  constructor(
    public readonly code: DictionaryEntryErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = "DictionaryEntryError";
    // 保持正确的原型链
    Object.setPrototypeOf(this, DictionaryEntryError.prototype);
  }

  public override toString(): string {
    return `[${this.name}:${this.code}] ${this.message}`;
  }
}

/**
 * 詞條
 */
export class DictionaryEntry {
  private data: DictionaryEntryData | null = null;
  private loaded = false;
  private _url: string | null = null;

  /**
   * 獲取調用{@link DictionaryEntry.load}時使用的url。
   * 
   * 若未調用過{@link DictionaryEntry.load}（無論成功與否），{@link DictionaryEntry.url}為null。
   */
  public get url(): string | null {
    return this._url;
  }

  /**
   * 检查词条是否已加载数据
   * @returns boolean - 是否已加载
   * O(1)
   */
  public get isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 获取词条标题
   * @returns string - 词条标题
   * O(1)
   */
  public get title(): string {
    this.ensureLoaded();
    return this.data!.title;
  }

  /**
   * 获取通用位掩码
   * @returns number - 位掩码值
   * O(1)
   */
  public get generalBitmask(): number {
    this.ensureLoaded();
    return this.data!.generalBitmask;
  }

  /**
   * 获取时间戳
   * @returns number | undefined - UTC时间戳（毫秒）
   * O(1)
   */
  public get time(): number | undefined {
    this.ensureLoaded();
    return this.data!.time;
  }

  /**
   * 获取所有定义组
   * @returns DefinitionGroup[] - 定义组数组
   * O(1)
   */
  public get allDefinitions(): DefinitionGroup[] {
    this.ensureLoaded();
    return this.data!.allDefinitions;
  }

  /**
   * 检查词条是否包含指定词性
   * @param pos - 要检查的词性
   * @returns boolean - 是否包含该词性
   * O(1)
   */
  public isOfPoS(pos: DictPoS): boolean {
    this.ensureLoaded();
    return (this.data!.generalBitmask & pos) !== 0;
  }

  /**
   * 随机获取音频URL（可指定词性）
   * @param pos - 可选的目标词性
   * @returns string - 音频文件路径
   * 时间复杂度: O(n) n为定义组数量
   */
  public getRandomAudioURL(pos?: DictPoS): string {
      this.ensureLoaded();
      const groups = this.data!.allDefinitions;
      
      // 处理空定义组情况
      if (groups.length === 0) {
          return '';
      }

      let candidateGroups: AudioInfo[];
      
      if (pos === undefined) {
          // 未指定词性：使用所有定义组
          candidateGroups = groups.map(group => group.audio);
      } else {
          // 指定词性：优先匹配组，若无则使用全部组
          const matchingGroups = groups.filter(group => (group.defBitmask & pos) !== 0);
          candidateGroups = matchingGroups.length > 0 
              ? matchingGroups.map(group => group.audio) 
              : groups.map(group => group.audio);
      }

      // 随机选择目标组
      const targetGroup = candidateGroups[Math.floor(Math.random() * candidateGroups.length)];
      
      // 随机选择英式或美式发音
      return Math.random() > 0.5 
          ? targetGroup.uk.audioPath 
          : targetGroup.us.audioPath;
  }

  /**
   * 从URL加载词典数据
   * @param url - 数据源URL
   * @returns Promise<DictionaryEntry> - 加载完成的实例
   * 时间复杂度: O(1) 网络操作不计入
   */
  public async load(url: string): Promise<this> {
    if (!url)
      throw new DictionaryEntryError(
        DictionaryEntryErrorCode.INVALID_LINK,
        `url為null！`
      );
    this._url = url;
    this.loaded = false;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new DictionaryEntryError(
          DictionaryEntryErrorCode.NETWORK_ERROR,
          `Failed to fetch data: HTTP ${response.status}`,
          { status: response.status, url }
        );
      }
      
      try {
        this.data = await response.json() as DictionaryEntryData;
        // 添加基本数据验证
        if (!this.data?.title || !Array.isArray(this.data.allDefinitions)) {
          throw new DictionaryEntryError(
            DictionaryEntryErrorCode.INVALID_DATA,
            "Invalid data structure received"
          );
        }
        
        this.loaded = true;
        return this;
      } catch (parseError) {
        throw new DictionaryEntryError(
          DictionaryEntryErrorCode.INVALID_DATA,
          "Failed to parse response data",
          parseError
        );
      }
    } catch (error) {
      // 处理非预期错误
      if (error instanceof DictionaryEntryError) throw error;
      
      throw new DictionaryEntryError(
        DictionaryEntryErrorCode.LOAD_FAILURE,
        `Unexpected load failure: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * 获取音节数量（取第一个定义组）
   * @returns number - 音节数
   * O(1)
   */
  public get syllableCount(): number {
    this.ensureLoaded();
    return this.data!.allDefinitions[0]?.syllableCount || 1;
  }

  /**
   * 获取重音位置（取第一个定义组）
   * @returns number - 重读音节索引
   * O(1)
   */
  public get stressIndex(): number {
    this.ensureLoaded();
    return this.data!.allDefinitions[0]?.stressIndex || 0;
  }

  /**
   * 获取所有音频路径（去重）
   * @returns string[] - 唯一音频路径数组
   * 时间复杂度: O(n) n为定义组数量
   */
  public getAllAudioPaths(): string[] {
    this.ensureLoaded();
    const paths = new Set<string>();
    this.data!.allDefinitions.forEach(group => {
      paths.add(group.audio.uk.audioPath);
      paths.add(group.audio.us.audioPath);
    });
    return Array.from(paths);
  }

  private ensureLoaded(): void {
    if (!this.loaded || !this.data) {
      throw new DictionaryEntryError(
        DictionaryEntryErrorCode.NOT_LOADED,
        "數據未載入。請先調load()！"
      );
    }
  }
}