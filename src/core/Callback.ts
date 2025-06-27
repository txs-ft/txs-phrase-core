/**
 * 單事件資料的回調類型。
 * @deprecated
 */
export type Callback<TSender, TEventArgs> = (this: object, sender: TSender, eventArgs: TEventArgs) => void;

/**
 * 回調發送器
 * @deprecated
 */
export default class CallbackEmitter<S, E> {

  private receiver: object | null;
  private sender: S;
  private callback: Callback<S, E> | null;

  /**
   * 生成回調發送器個例。
   * @param sender 回調發送者
   */
  constructor(sender: S) {
    this.sender = sender;
    this.receiver = null;
    this.callback = null;
  }

  /**
   * 登記回調。
   * @param receiver 回調接收者
   * @param callback 回調個例
   */
  public register(receiver: object, callback: Callback<S, E>): void {
    this.receiver = receiver;
    this.callback = callback;
  }

  /**
   * 觸發回調。
   * @param eventArgs 事件資料
   * @returns true: 觸發成功; false: 觸發失敗
   */
  public emit(eventArgs: E): boolean {
    if (!this.receiver || !this.callback)
      return false;
    this.callback.call(this.receiver, this.sender, eventArgs)
    return true;
  }

  /**
   * 清除登記了的接收者和回調個例。
   */
  public clear(): void {
    this.receiver = null;
    this.callback = null;
  }

}
