import { PhonemeType } from "../english/Phoneme";
import { TextBlock } from "./TextBlock";

/**
 * 一個音素字塊
 */
export class PhonemeBlock extends TextBlock {

  private _soundType: PhonemeType = PhonemeType.VOWEL;
  
  /**
   * 設置此字塊的音素類別。
   */
  public set soundType(value : PhonemeType) {
    this._soundType = value;
    switch (value) {
      case PhonemeType.VOWEL:
        this.setStyle(PhonemeBlock.defaultStyleVowel);
        break;
      case PhonemeType.CONSONANT:
        this.setStyle(PhonemeBlock.defaultStyleConsonant);
        break;
    }
  }
  
  /**
   * 獲取此字塊的音素類別。
   */
  public get soundType() : PhonemeType {
    return this._soundType;
  }

  constructor(scene: Phaser.Scene) {
    super(scene, PhonemeBlock.defaultPhonemeStyle);
  }

  public initializePhonemeBlock(soundType: PhonemeType, text: string): void {
    this.initialize(text);
    this.soundType = soundType;
  }

  /**
   * 所有{@link PhonemeBlock}的默認樣式。
   * 
   * 若變更，會令所有新創建的{@link PhonemeBlock}實例跟從新樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultPhonemeStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    backgroundColor: "#383838",
    fontFamily: "Arial",
    fontSize: "36px",
    fontStyle: "bold",
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

  /**
   * 所有子音{@link PhonemeBlock}的默認樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultPhonemeStyleConsonant: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#FFFFFF", // 文字顏色
  };

  /**
   * 所有母音{@link PhonemeBlock}的默認樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultPhonemeStyleVowel: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#FFAAAA", // 文字顏色
  };

}