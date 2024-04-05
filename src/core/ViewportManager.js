import { getDevicePixelRatio } from "../common/index.js";
export class ViewportManager {
  scrollX = 0;
  scrollY = 0;
  editor;

  constructor(editor) {
    this.editor = editor;
  }
  getViewport() {
    return {
      x: this.scrollX,
      y: this.scrollY,
      width: parseFloat(this.editor.canvasElement.style.width),
      height: parseFloat(this.editor.canvasElement.style.height),
    };
  }
  setViewport({ x, y, width, height }) {
    const prevX = this.scrollX;
    const prevY = this.scrollY;
    const dpr = getDevicePixelRatio();
    if (x !== undefined) {
      this.scrollX = x;
    }
    if (y !== undefined) {
      this.scrollY = y;
    }
    if (width !== undefined) {
      this.editor.canvasElement.width = width * dpr;
      this.editor.canvasElement.style.width = width + 'px';
    }
    if (height !== undefined) {
      this.editor.canvasElement.height = height * dpr;
      this.editor.canvasElement.style.height = height + 'px';
    }
  }
  translate(dx, dy) {
    this.scrollX += dx;
    this.scrollY += dy;
  }
}