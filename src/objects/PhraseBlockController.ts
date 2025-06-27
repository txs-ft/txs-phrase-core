import { PhraseBlock } from './PhraseBlock';

/**
 * 實現{@link PhraseBlock}拖曳及點擊變色邏輯的控制器。
 */
export class PhraseBlockController extends Phaser.GameObjects.GameObject {

  /**
   * 用戶是否曾經拖曳字塊？
   * 
   * 是的話，我們不需要在用戶放手時讓字塊變色。
   * 
   * 否的話，用戶真的是在點擊字塊，所以需要變色。
   */
  private hasDragged: boolean;

  /**
   * 現時控制器正在與之互動的{@link PhraseBlock}實例。
   */
  private block: PhraseBlock | null = null;

  /**
   * 創建一個{@link PhraseBlockController}個例。
   * @param scene 場景
   */
  constructor(scene: Phaser.Scene) {
    super(scene, "PhraseBlockController");
    scene.add.existing(this);
    this.hasDragged = false;
    this.setupInput();
  }
  
  // 使用普通事件
  
  /**
   * 設置用戶輸入邏輯。
   */
  private setupInput() {
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.dragTimeThreshold = 100;
    input.on(Events.GAMEOBJECT_DOWN, this.onDown.bind(this));
    input.on(Events.DRAG_START, this.onDragStart.bind(this));
    input.on(Events.DRAG, this.onDrag.bind(this));
    input.on(Events.DRAG_END, this.onDragEnd.bind(this));
    input.on(Events.GAMEOBJECT_UP, this.onUp.bind(this));

    // ** 對上述五種事件的研究結果** 
    // 前提：input.dragTimeThreshold設定為100ms。
    // 事件觸發次序：onDown → onDragStart → onDrag → onDragEnd → onUp
    // 不設定input.dragTimeThreshold的話，其值默認為0，會導致onDown與onDragStart同步觸發，onDragEnd與onUp同步觸發。

    // ** 初步設計思路 **
    // onDown(): hasDragged → false
    // onDragStart(): hasDragged → true
    // onUp(): hasDragged → false
    // 隱患？如果dragTimeThreshold太長，用戶只要不放手，
    // 依然可以在手指離開TextBlock範圍後拖動TextBlock。
    // 若在TextBlock之外放手，不會觸發onUp。而如果放手時，
    // 手指剛好在另一個TextBlock之上，會觸發另一個TextBlock
    // 的onUp。需要根據情況，考慮存下引用，追蹤被拖曳的個例。

    // ** 測試場景有2個TextBlock時的表現 **
    // 點擊兩個TextBlock重疊的區域：上層TextBlock有onDown和onUp。
    // 拖曳兩個TextBlock重疊的區域：上層TextBlock被拖動
    // 
    // 結果表明，Phaser引擎已經

    // input.on(Events.POINTER_DOWN, this.onPointerDown.bind(this));
  }

  private onDown(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    event: Phaser.Types.Input.EventData
  ): void {
    if (!(gameObject instanceof PhraseBlock))
      return;
    this.hasDragged = false;
    this.block = gameObject as PhraseBlock;
    //this.logBlock(this.block, "onDown");
    event.stopPropagation();
  }

  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject
  ): void {
    this.hasDragged = true;

    // 物理
    const block = gameObject as PhraseBlock;
    //this.logBlock(block, "onDragStart");
    const body = block.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    body.setDirectControl(true);
  }

  private onDrag(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dragX: number,
    dragY: number
  ): void {
    const block = gameObject as PhraseBlock;
    block.setPosition(dragX, dragY);
    // //this.logBlock(gameObject as TextBlock, "onDrag");
  }

  private onDragEnd(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dropped: boolean // 丟在目標物件上了？
  ): void {
    //this.logBlock(gameObject as PhraseBlock, "onDragEnd");

    const block = gameObject as PhraseBlock;
    //this.logBlock(block, "onDragStart");
    const body = block.body as Phaser.Physics.Arcade.Body;
    body.setDirectControl(false);
    body.setAllowGravity(true);
    body.setVelocity(
      pointer.velocity.x * 10,
      pointer.velocity.y * 10
    );
  }

  private onUp(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    event: Phaser.Types.Input.EventData
  ): void {
    if (gameObject !== this.block) {
      return;
    }
    if (!this.hasDragged) { // 物件沒有經歷過拖曳
      //console.log(`${this.constructor.name}.onUp: click!`);
      //this.logBlock(gameObject as PhraseBlock, "onUp, click");
      this.block.cyclePoS();
    } else {
      //this.logBlock(gameObject as PhraseBlock, "onUp, dragged");
    }
    this.hasDragged = false;
    this.block = null;
  }

  private logBlock(block: PhraseBlock, msg: string): void {
    console.log(`TextBlock[${block.text}]: ${msg}`);
  }

}