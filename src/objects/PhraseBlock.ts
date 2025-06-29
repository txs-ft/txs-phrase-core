import { PoS, PoSStyles } from '../english';
import { TextBlock } from './TextBlock';

/**
 * 能轉變詞類從而變色的字塊。
 */
export class PhraseBlock extends TextBlock  {

  private partsOfSpeech: PoS = PoS.OTHER;
  private cache = {
    color: "",
    backgroundColor: ""
  }

  public getPartsOfSpeech(): PoS { return this.partsOfSpeech; }

  /**
   * 設定此{@link PhraseBlock}的詞類。
   * @param pos 新的詞類
   */
  public setPartsOfSpeech(pos: PoS): void {
    if (this.partsOfSpeech !== pos) {
      //this.style.color = PoSStyles[pos]
      const style = PoSStyles[pos];
      const cache = this.cache;
      cache.color = style.colorFront;
      cache.backgroundColor = style.colorBack;
      this.setStyle(cache);
      this.partsOfSpeech = pos;
    }
  }

  /**
   * 將此{@link PhraseBlock}的{@link PoS}轉換成下一個。
   */
  public cyclePoS(): void {
    this.setPartsOfSpeech((this.getPartsOfSpeech() + 1) % 6);
  }

  /**
   * 創建一個{@link PhraseBlock}實例。
   * @param scene 場景
   * @param x x位置（世界座標）
   * @param y y位置（世界座標）
   * @param text 初始內容
   */
  constructor(scene: Phaser.Scene) {
    super(scene, PhraseBlock.defaultPhraseStyle);
  }

  /**
   * 每次從Group中甦醒過來，都會必須調用一次。
   * @param text 作為新內容的字符串
   */
  public override initialize(text: string): void {
    super.initialize(text);
    const style = PoSStyles[PoS.OTHER];
    this.cache.color = style.colorFront;
    this.cache.backgroundColor = style.colorBack;
    this.setStyle(this.cache);
  }

  /**
   * 所有{@link PhraseBlock}的默認樣式。
   * 
   * 若變更，會令所有新創建的{@link PhraseBlock}實例跟從新樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultPhraseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: PoSStyles[PoS.OTHER].colorFront, // 文字顏色
    backgroundColor: PoSStyles[PoS.OTHER].colorBack, // 背景顏色
    // 我們只需要改變上面兩個
    fontFamily: "Arial",
    fontSize: "24px",
    fontStyle: "bold",
    //stroke: "#f00",
    //strokeThickness: 5,
    padding: {
      x: 15,
      y: 15
    },
    align: "center",
    maxLines: 1,
    testString: "W",
    lineSpacing: 10,
    letterSpacing: 5
  };

}
