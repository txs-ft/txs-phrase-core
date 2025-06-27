/**
 * 所有能進池的類別必須實現的接口。
 */
export interface IPoolable<TConfig extends object> {

  /**
   * 在從池子出來之前，此方法會被{@link Pool#get}調用，從而進行初始化。
   * @param config 設定個例
   */
  onGetFromPool(config: TConfig): void;

  /**
   * 在返回池子之時，此方法會被{@link Pool#put}調用，從而進入休眠狀態。
   */
  onReturnToPool(): void;

}

/**
 * 泛類池，與任何實現{@link IPoolable}接口的類別結合，減低造新對象的次數。
 * 
 * 但要注意，一個類別在實現{@link IPoolable}之餘，還要準備一個接受單個{@link TConfig}作為參數的構造函數，才能與泛類池相容。
 */
export class Pool<TObject extends IPoolable<TConfig>, TConfig extends object> {

  private array: TObject[];
  private ctor: new (config: TConfig) => TObject;

  /**
   * 生成一個{@link Pool}個例。
   * @param ctor 本池所服務的類別
   */
  constructor(ctor: new (config: TConfig) => TObject) {
    this.array = new Array<TObject>();
    this.ctor = ctor;
  }

  /**
   * 取得一個對象。若池中有空閒個例，便會從池中獲取，否則會使用對象類別的構造函數造一個新的。
   * @param config 設定個例
   * @returns 一個對象
   */
  public get(config: TConfig): TObject {
    if (this.array.length > 0) {
      // 拿舊的
      const obj = this.array.pop();
      obj!.onGetFromPool(config);
      return obj!;
    } else {
      // 弄新的
      return new this.ctor(config);
    }
  }

  /**
   * 將一個或多個對象放回池子。
   * @param objs 放回池子的個例
   */
  public put(...objs: TObject[]): void {
    this.array.push(...objs);
    for (let i=0; i<objs.length; i++) {
      objs[i].onReturnToPool();
    }
  }

}