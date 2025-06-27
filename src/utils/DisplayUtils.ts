export class DisplayUtils {
  
  private constructor(){}

  /**
   * 创建居中对称的背景网格 DeepSeek🐳
   * @param scene Phaser 场景实例
   * @param backgroundWidth 背景宽度
   * @param backgroundHeight 背景高度
   * @param gridWidth 网格单元宽度
   * @param gridHeight 网格单元高度
   * @param backgroundColor 背景颜色 (CSS 颜色字符串)
   * @param gridColor 网格线颜色 (CSS 颜色字符串)
   * @returns 包含网格的 Phaser.GameObjects.Graphics 对象
   */
  public static createBackgroundGrid(
    scene: Phaser.Scene,
    backgroundWidth: number,
    backgroundHeight: number,
    gridWidth: number,
    gridHeight: number,
    backgroundColor: string,
    gridColor: string
  ): Phaser.GameObjects.Graphics {
    if (
        backgroundWidth <= 0
    || backgroundHeight <= 0
    || gridWidth <= 0
    || gridHeight <= 0
    )
      throw new Error("任何輸入參數不得為0或負數！");
    const graphics = scene.add.graphics();

    // 解析颜色
    const bgColor = Phaser.Display.Color.ValueToColor(backgroundColor).color;
    const lineColor = Phaser.Display.Color.ValueToColor(gridColor).color;

    // 绘制背景
    graphics.fillStyle(bgColor, 1);
    graphics.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // 计算起始位置以确保居中对称
    const offsetX = (backgroundWidth % gridWidth) / 2;
    const offsetY = (backgroundHeight % gridHeight) / 2;

    // 设置线条样式
    graphics.lineStyle(1, lineColor, 1);

    // 绘制垂直线
    for (let x = offsetX; x <= backgroundWidth; x += gridWidth) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, backgroundHeight);
    }

    // 绘制水平线
    for (let y = offsetY; y <= backgroundHeight; y += gridHeight) {
    graphics.moveTo(0, y);
    graphics.lineTo(backgroundWidth, y);
    }

    // 绘制所有线条
    graphics.strokePath();

    return graphics;

  }

}