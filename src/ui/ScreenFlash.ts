/**
 * 亮瞎你的狗眼！
 */
export class ScreenFlash {
  private flashElement: HTMLDivElement;

  constructor(zIndex: bigint = 10000n) {
    // 创建全屏覆盖的div元素
    this.flashElement = document.createElement("div");
    Object.assign(this.flashElement.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "red",
      opacity: "0",
      pointerEvents: "none",
      zIndex: `${zIndex}`,  // 确保在最顶层
      transition: "none" // 初始无过渡效果
    });
    
    // 添加到body
    document.body.appendChild(this.flashElement);
  }

  /**
   * 閃爍之亮瞎你的狗眼！
   * @param color 顏色
   * @param opacity 透明度（0-1）
   * @param fadeDuration 持續時間
   */
  flash(color: string, opacity: number, fadeDuration: number): void {
    // 1. 立即重置状态（无过渡）
    this.flashElement.style.transition = "none";
    this.flashElement.style.backgroundColor = color;
    this.flashElement.style.opacity = `${opacity}`;

    // 2. 强制浏览器重绘（触发新状态）
    void this.flashElement.offsetHeight; // 触发reflow

    // 3. 应用褪色效果
    this.flashElement.style.transition = `opacity ${fadeDuration}ms linear`;
    this.flashElement.style.opacity = "0";
  }
}