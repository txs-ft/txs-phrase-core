import { TextBlock } from "./TextBlock";
import { Event } from '../core';


/**
 * 實現{@link TextBlock}拖曳及點擊邏輯的控制器。
 */
export class TextBlockController<T extends TextBlock> extends Phaser.GameObjects.GameObject {

  /**
   * 本控制器首次接收到任何來自用戶的互動，便會觸發{@link TextBlockController#FirstInteracted}事件。
   */
  public readonly FirstInteracted = new Event<TextBlockController<T>>();

  /**
   * 用戶是否曾經拖曳字塊？
   * 
   * 是的話，我們不需要在用戶放手時當成點擊。
   * 
   * 否的話，用戶真的是在點擊字塊。
   */
  private hasDragged: boolean;
  private interacted: boolean = false;

  /**
   * 現時控制器正在與之互動的{@link PhraseBlock}實例。
   */
  private block: T | null = null;

  /**
   * 創建一個{@link TextBlockController}個例。
   * @param scene 場景
   */
  constructor(scene: Phaser.Scene) {
    super(scene, "TextBlockController");
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
    input.on(Events.GAMEOBJECT_DOWN, this.onDown, this);
    input.on(Events.DRAG_START, this.onDragStart, this);
    input.on(Events.DRAG, this.onDrag, this);
    input.on(Events.DRAG_END, this.onDragEnd, this);
    input.on(Events.GAMEOBJECT_UP, this.onUp, this);

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

  private removeEvents(): void {
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.dragTimeThreshold = 100;
    input.off(Events.GAMEOBJECT_DOWN, this.onDown, this);
    input.off(Events.DRAG_START, this.onDragStart, this);
    input.off(Events.DRAG, this.onDrag, this);
    input.off(Events.DRAG_END, this.onDragEnd, this);
    input.off(Events.GAMEOBJECT_UP, this.onUp, this);
  }

  public override setActive(active: boolean): this {
    super.setActive(active);
    if (active) {
      this.setupInput();
    } else {
      this.removeEvents();
    }
    return this;
  }

  private onDown(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    event: Phaser.Types.Input.EventData
  ): void {
    if (gameObject.type !== "TextBlock")
      return;
    if (!this.interacted) {
      this.interacted = true;
      this.FirstInteracted.invoke(this);
    }
    this.hasDragged = false;
    this.block = gameObject as T;
    //this.logBlock(this.block, "onDown");
    event.stopPropagation();
  }

  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject
  ): void {
    this.hasDragged = true;

    // 物理
    const block = gameObject as T;
    //this.logBlock(block, "onDragStart");
    const body = block.arcadeBody;
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
    const block = gameObject as T;
    block.setPosition(dragX, dragY);
    // //this.logBlock(gameObject as TextBlock, "onDrag");
  }

  private onDragEnd(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dropped: boolean // 丟在目標物件上了？
  ): void {
    //this.logBlock(gameObject as PhraseBlock, "onDragEnd");

    const block = gameObject as T;
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
      this.onClick(this.block);
    } else {
      //this.logBlock(gameObject as PhraseBlock, "onUp, dragged");
    }
    this.hasDragged = false;
    this.block = null;
  }

  /**
   * 在某{@link T}實例被點擊時被調用。繼承此控制器者，可override此方法添加點擊邏輯。
   * @param block 被點擊的{@link T}實例
   */
  protected onClick(block: T) {}

  private logBlock(block: T, msg: string): void {
    console.log(`TextBlock[${block.text}]: ${msg}`);
  }

  public override destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.FirstInteracted.destroy();
    this.removeEvents();
  }

}