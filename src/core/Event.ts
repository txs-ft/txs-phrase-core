/**
 * 事件處理函數使用的類型。
 */
export type EventHandler<TSender extends object, TEventArgs extends any[] = []> = (sender: TSender, ...args: TEventArgs) => void;

/**
 * 事件。
 */
export class Event<TSender extends object, TEventArgs extends any[] = []> {
  
  private pool = new Array<EventHandler<TSender, TEventArgs>[]>();
  private poolLimit: number;

  /**
   * 創建一個{@link Event}實例。
   * @param poolLimit 緩存池最大數（默認為1）
   */
  constructor(poolLimit: number = 1) {
    this.poolLimit = poolLimit;
  }

  private createCache() {
    let cache = this.pool.pop();
    if (cache)
      cache.length = 0;
    else
      cache = [];
    for (const handler of this.set) {
      cache.push(handler);
    }
    return cache;
  }

  private returnCache(cache: Array<EventHandler<TSender, TEventArgs>>): void {
    cache.length = 0;
    if (this.pool.length < this.poolLimit) {
      this.pool.push(cache);
    }
  }

  private set = new Set<EventHandler<TSender, TEventArgs>>();

  /**
   * 觸發事件。
   * @param sender 觸發事件的實例
   * @param args 事件參數
   */
  public invoke(sender: TSender, ...args: TEventArgs): void {
    const { set } = this;
    if (set.size === 0) return;
    const cache = this.createCache();
    try {
      for (const handler of cache) {
        try {
          handler(sender, ...args);
        } catch (error) {
          console.error("錯誤：", error);
        }
      }
    } finally {
      this.returnCache(cache);
    }
  }

  /**
   * 訂閱事件。
   * @param handler 處理函數（必須bind好或使用箭頭函數，並自行保存引用以備使用{@link Event#off}取消訂閱！）
   */
  public on(handler: EventHandler<TSender, TEventArgs>): void {
    if (this.set.has(handler))
      return;
    this.set.add(handler);
  }

  /**
   * 取消事件訂閱。
   * @param handler 事先已經bind好的處理函數
   * @returns 成功取消訂閱？若false，檢查你的訂閱代碼，看是否忘記bind。
   */
  public off(handler: EventHandler<TSender, TEventArgs>): boolean {
    return this.set.delete(handler);
  }

  /**
   * 清除所有訂閱。
   */
  public clear(): void {
    this.set.clear();
  }

  /**
   * 釋放緩存池記憶。
   */
  public freePoolMemory(): void {
    this.pool.length = 0;
  }

}

