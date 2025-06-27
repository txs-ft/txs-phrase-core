/**
 * {@link CameraController}三個可能的狀態
 */
export enum CameraControllerAction {

  /**
   * 就緒
   */
  READY = 0,

  /**
   * 平移中
   */
  PANNING = 1,

  /**
   * 縮放中
   */
  ZOOMING = 2

}

/**
 * {@link CameraController}的額外設置選項。
 */
export interface CameraControllerOptions {

  /**
   * 最小縮放比
   */
  minZoom: number,

  /**
   * 最大縮放比
   */
  maxZoom: number,

  /**
   * 縮放敏感度（作用於PC端鼠標）
   */
  zoomSensitivityMouse: number,

  /**
   * 縮放敏感度（作用於雙指手勢）
   */
  zoomSensitivityPinch: number
}

/**
 * 一個{@link CameraController}個例，能控制單個{@link Phaser.Cameras.Scene2D.Camera}個例，實現下列功能。
 * 
 * 在PC端…
 * - 以鼠標拖曳平移鏡頭至新位置；
 * - 以鼠標輪控制鏡頭縮放。
 * 
 * 在移動端
 * - 以單指拖曳平移鏡頭至新位置；
 * - 以雙指手勢控制鏡頭縮放。
 */
export class CameraController extends Phaser.GameObjects.GameObject {

  // 通用成員
  private action = CameraControllerAction.READY;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private options: CameraControllerOptions = {
    minZoom: 0.5,
    maxZoom: 1.5,
    zoomSensitivityMouse: 0.001,
    zoomSensitivityPinch: 0.01
  };
  
  // 平移邏輯相關成員
  private dragStart: { x: number, y: number } = { x: 0, y: 0 };
  private startScroll: { x: number, y: number } = { x: 0, y: 0 };
  
  /**
   * 縮放邏輯相關成員
  */
  private finger1: Phaser.Input.Pointer;
  private finger2: Phaser.Input.Pointer;
  private initialZoom = 0;
  private initialPinchDistance = 0;
  private initialWorldPoint: { x: number, y: number } = { x: 0, y: 0 };

  /**
   * 創建一個{@link CameraController}個例。
   * @param scene 場景
   * @param camera 鏡頭
   * @param finger1 代表第一隻手指的指針
   * @param finger2 代表第二隻手指的指針
   * @param options 額外設置
   */
  constructor(
    scene: Phaser.Scene,
    camera: Phaser.Cameras.Scene2D.Camera,
    finger1: Phaser.Input.Pointer,
    finger2: Phaser.Input.Pointer,
    bounds?: Phaser.Geom.Rectangle,
    options?: CameraControllerOptions
  ) {
    super(scene, "CameraController");
    this.camera = camera;
    camera.centerOn(0, 0);
    this.finger1 = finger1;
    this.finger2 = finger2;
    if (bounds) {
      const { x, y, width, height } = bounds;
      camera.setBounds(x, y, width, height);
    }
    if (options) {
      this.options.maxZoom = options.maxZoom;
      this.options.minZoom = options.minZoom;
      this.options.zoomSensitivityMouse = options.zoomSensitivityMouse;
      this.options.zoomSensitivityPinch = options.zoomSensitivityPinch;
    } else {
      this.options.maxZoom = 1.5;
      this.options.minZoom = 0.5;
      this.options.zoomSensitivityMouse = 0.001;
      this.options.zoomSensitivityPinch = 0.01
    }
    this.setupEvents();
  }

  /**
   * 準備系統輸入事件。
   */
  private setupEvents(): void {
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.on(Events.POINTER_WHEEL, this.onWheel, this);
    input.on(Events.POINTER_DOWN, this.onPointerDown, this);
    input.on(Events.POINTER_UP, this.onPointerUp, this);
    input.on(Events.POINTER_MOVE, this.onPointerMove, this);
  }
  
  /**
   * 幹掉控制器，與輸入系統脫鈎。
   * @param fromScene 是場景要我死嗎？
   */
  public override destroy(fromScene?:boolean): void {
    super.destroy(fromScene);
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.off(Events.POINTER_WHEEL, this.onWheel, this);
    input.off(Events.POINTER_DOWN, this.onPointerDown, this);
    input.off(Events.POINTER_UP, this.onPointerUp, this);
    input.off(Events.POINTER_MOVE, this.onPointerMove, this);
  }

  private onPointerDown(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Array<Phaser.GameObjects.GameObject>
  ): void {
    const p0 = this.scene.input.mousePointer;
    const p1 = this.finger1;
    const p2 = this.finger2;
    switch (this.action) {
      case CameraControllerAction.READY: {
        if (pointer === p0) {
          // PC端
          this.action = CameraControllerAction.PANNING;
          this.onStartPan(pointer);
        } else if (pointer === p1 || pointer === p2) {
          // 移動端
          if (p1.isDown && p2.isDown) {
            // 雙指
            this.action = CameraControllerAction.ZOOMING;
            this.onStartPinch(p1, p2);
          } else if (p1.isDown) {
            // 單指
            this.action = CameraControllerAction.PANNING;
            this.onStartPan(pointer);
          } else if (p2.isDown) {
            // 單指
            this.action = CameraControllerAction.PANNING;
            this.onStartPan(pointer);
          }
        }
        break;
      }
      case CameraControllerAction.PANNING: {
        // 移動端，在用戶平移之時，添一根手指變為縮放
        if (pointer === p1 || pointer === p2) {
          this.action = CameraControllerAction.ZOOMING;
          this.onStartPinch(p1, p2);
        }/* else {
          // 除非有第三根手指
          // 或者在一部既能觸屏又能用鼠標的電腦上
          // 第三個或更多指針摁下了
          // 才會走這條路
          // 我們不處理
        }*/
        break;
      }
      case CameraControllerAction.ZOOMING: {
        // 除非有第三根手指
        // 或者在一部既能觸屏又能用鼠標的電腦上
        // 第三個或更多指針摁下了
        // 才會走這條路
        // 我們不處理
        break;
      }
    }
  }

  private onStartPan(pointer: Phaser.Input.Pointer): void {
    this.dragStart.x = pointer.x;
    this.dragStart.y = pointer.y;
    this.startScroll.x = this.camera.scrollX;
    this.startScroll.y = this.camera.scrollY;
  }

  private onStartPinch(
    p1: Phaser.Input.Pointer,
    p2: Phaser.Input.Pointer
  ): void {
    // 計算雙指距離
    this.initialPinchDistance = Phaser.Math.Distance.Between(
      p1.x, p1.y, 
      p2.x, p2.y
    );
    
    // 計算雙指中心點（屏幕坐標）
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;

    // 修復：記錄初始世界坐標而不是屏幕坐標
    this.initialWorldPoint = this.camera.getWorldPoint(centerX, centerY);
    
    // 記錄當前縮放值
    this.initialZoom = this.camera.zoom;
  }

  private onPointerMove(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Array<Phaser.GameObjects.GameObject>
  ): void {
    const p0 = this.scene.input.mousePointer;
    const p1 = this.finger1;
    const p2 = this.finger2;
    switch (this.action) {
      case CameraControllerAction.PANNING: {
        // PC端，用戶使用鼠標平移
        // 移動端，用戶使用單指平移
        // 兩者代碼一致
        const dx = (this.dragStart.x - pointer.x) / this.camera.zoom;
        const dy = (this.dragStart.y - pointer.y) / this.camera.zoom;
        
        // 更新相机位置
        let newScrollX = this.startScroll.x + dx;
        let newScrollY = this.startScroll.y + dy;
        
        this.camera.setScroll(newScrollX, newScrollY);
        break;
      }
      case CameraControllerAction.ZOOMING: {
        if (pointer === p1 || pointer === p2) {
          // 移動端，用戶使用雙指縮放
          this.onPinching(p1, p2);
        }
        break;
      }
      default:
        // 比如CameraControllerAction.IDLE，啥也不用幹
        return;
    }
    
    
  }

  private onPinching(
    p1: Phaser.Input.Pointer,
    p2: Phaser.Input.Pointer
  ): void {
    
    // 計算當前雙指距離
    const currentDistance = Phaser.Math.Distance.Between(
      p1.x, p1.y, 
      p2.x, p2.y
    );

    const {
      zoomSensitivityPinch: CAMERA_ZOOM_SENSITIVITY,
      minZoom: CAMERA_MIN_ZOOM,
      maxZoom: CAMERA_MAX_ZOOM
    } = this.options;
    
    // 計算縮放比例
    const zoomDelta = (currentDistance - this.initialPinchDistance) * 
                     CAMERA_ZOOM_SENSITIVITY;
    
    // 應用新的縮放值
    const newZoom = Phaser.Math.Clamp(
      this.initialZoom + zoomDelta, 
      CAMERA_MIN_ZOOM, 
      CAMERA_MAX_ZOOM
    );
    this.camera.setZoom(newZoom);
    
    // 修復：使用初始世界坐標保持中心點穩定
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    
    // 計算當前中心點的世界坐標
    const currentWorldPoint = this.camera.getWorldPoint(centerX, centerY);
    
    // 計算偏移量
    const dx = this.initialWorldPoint.x - currentWorldPoint.x;
    const dy = this.initialWorldPoint.y - currentWorldPoint.y;
    
    // 調整相機位置以保持中心點穩定
    this.camera.scrollX += dx;
    this.camera.scrollY += dy;

  }

  private onPointerUp(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Array<Phaser.GameObjects.GameObject>
  ): void {
    const p0 = this.scene.input.mousePointer;
    const p1 = this.finger1;
    const p2 = this.finger2;
    switch (this.action) {
      case CameraControllerAction.READY: {
        // 其他來源的POINTER_UP可能會在這裡被捕捉到
        // 不管就是了
        break;
      }
      case CameraControllerAction.ZOOMING: {
        // 數數剩只根手指
        let fingersLeft = 2n; 
        if (!p1.isDown) fingersLeft--;
        if (!p2.isDown) fingersLeft--;
        if (fingersLeft === 0n) {
          // 沒手指了，停止一切
          this.action = CameraControllerAction.READY;
        } else if (fingersLeft === 1n) {
          // 還有一根，變成平移模式
          this.action = CameraControllerAction.PANNING;
          this.onStartPan(p1.isDown ? p1 : p2);
        }
        break;
      }
      case CameraControllerAction.PANNING: {
        if (pointer === p0) {
          // PC端鼠標鬆開
          this.action = CameraControllerAction.READY;
        } else if (pointer === p1 || pointer === p2) {
          if (!p1.isDown && !p2.isDown) {
            this.action = CameraControllerAction.READY;
          }
        }
        break;
      }
    }
  }
  
  /**
   * PC端使用的縮放邏輯。
   * @param pointer 鼠標
   * @param currentlyOver 鼠標下方的{@link Phaser.GameObjects.GameObject}
   * @param deltaX 無關
   * @param deltaY 鼠標輪移動參數
   * @param deltaZ 無關
   */
  private onWheel(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Array<Phaser.GameObjects.GameObject>,
    deltaX: number,
    deltaY: number,
    deltaZ: number
  ): void {
    const {
      zoomSensitivityMouse: CAMERA_ZOOM_SENSITIVITY,
      minZoom: CAMERA_MIN_ZOOM,
      maxZoom: CAMERA_MAX_ZOOM
    } = this.options;
    
    // 1. 计算缩放前的世界坐标（正确位置）
    const worldPoint = this.camera.getWorldPoint(pointer.x, pointer.y);
    
    // 2. 计算并应用新缩放值
    const zoomDelta = -deltaY * CAMERA_ZOOM_SENSITIVITY;
    const newZoom = Phaser.Math.Clamp(
      this.camera.zoom + zoomDelta, 
      CAMERA_MIN_ZOOM, 
      CAMERA_MAX_ZOOM
    );
    
    // 3. 直接设置相机缩放和位置
    this.camera.zoom = newZoom;
    
    // 4. 将鼠标位置重新映射到缩放后的世界坐标
    this.camera.pan(
      worldPoint.x, 
      worldPoint.y, 
      50, // 瞬时移动
      undefined, // 缓动函数
      undefined, // 允许超出边界
      (camera, progress, x, y) => {
        // 强制更新相机位置（避免缓动动画）
        camera.scrollX = x;
        camera.scrollY = y;
      }
    );
  }

}
