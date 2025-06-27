/**
 * 一個使用{@link Phaser.Time.Clock}的簡單計時器。
 */
export default class StopWatch {

  private clock: Phaser.Time.Clock;
  private s: number;
  private e: number;
  
  /**
   * 生成一個{@link StopWatch}個例。
   * @param clock {@link Phaser.Time.Clock}個例。
   */
  constructor(clock: Phaser.Time.Clock) {
    this.clock = clock;
    this.s = 0;
    this.e = 0;
  }

  /**
   * 開始計時。
   */
  public start(): void {
    this.s = this.clock.now;
  }

  /**
   * 停止計時。
   */
  public stop(): void {
    this.e = this.clock.now;
  }

  /**
   * 重設計時器。
   */
  public reset(): void {
    this.s = 0;
    this.e = 0;
  }

  /**
   * 計算從{@link StopWatch.start()}到{@link StopWatch.stop()}的時長。
   * @returns 時長
   */
  public getSpan(): number {
    return this.e - this.s;
  }

}