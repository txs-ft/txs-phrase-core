/**
 * 一個音素字塊
 */
export class TextBlock extends Phaser.GameObjects.Text {

  /**
   * 獲取此字塊的{@link Phaser.Physics.Arcade.Body}實例。
   */
  public get arcadeBody() : Phaser.Physics.Arcade.Body {
    if (!this.body)
      throw new Error("顯然未正確地使用Phaser.Physics.Arcade.Group的方式創建…");
    return this.body as Phaser.Physics.Arcade.Body;
  }

  constructor(scene: Phaser.Scene, style: Phaser.Types.GameObjects.Text.TextStyle) {
    super(scene, 0, 0, "", style);
    this.setInteractive(TextBlock.defaultInteractive);
    this.setOrigin(0.5, 0.5);
    this.type = "TextBlock";
  }

  public initialize(text: string): void {
    this.text = text;
    this.arcadeBody.setSize();
    this.setActive(true);
    this.setVisible(true);
  }

  /**
   * 所有{@link TextBlock}的默認樣式。
   * 
   * 若變更，會令所有新創建的{@link TextBlock}實例跟從新樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
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
   * 所有子音{@link TextBlock}的默認樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultStyleConsonant: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#FFFFFF", // 文字顏色
  };

  /**
   * 所有母音{@link TextBlock}的默認樣式。
   * 
   * 舊實例不會被影響。
   */
  public static defaultStyleVowel: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#FFAAAA", // 文字顏色
  };

  private static readonly defaultInteractive: Phaser.Types.Input.InputConfiguration = {
    draggable: true
  };

}