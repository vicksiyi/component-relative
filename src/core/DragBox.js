/**
 * 拖拽Box
 */
export class DragBox {
    start = { x: 0, y: 0 };
    end = { x: 0, y: 0 };
    constructor(editor) {
        this.editor = editor;
    }
    setStart(pos) {
        this.start = pos;
    }
    setEnd(pos) {
        this.end = pos;
    }
    get rect() {
        const startX = Math.min(this.start.x, this.end.x);
        const startY = Math.min(this.start.y, this.end.y);
        const width = Math.abs(this.start.x - this.end.x);
        const height = Math.abs(this.start.y - this.end.y);
        return {
            x: startX,
            y: startY,
            w: width,
            h: height
        }
    }
    get bound() {
        const rect = this.rect;
        return {
            x: rect.x + rect.w / 2,
            y: rect.y + rect.h / 2,
            w: rect.w,
            h: rect.h,
        }
    }
    draw() {
        const {
            ctx,
            canvasDragger
        } = this.editor;
        if (!canvasDragger.isDragging) return;
        const strokeWidth = 1
        ctx.strokeStyle = "rgba(79, 129, 255, 1)";
        ctx.lineWidth = strokeWidth;
        const { x, y, w, h } = this.rect;
        ctx.strokeRect(x - strokeWidth, y - strokeWidth, w + strokeWidth * 2, h + strokeWidth * 2);
        ctx.beginPath();
        ctx.fillStyle = "rgba(79, 129, 255, 0.2)";
        ctx.rect(x, y, w, h);
        ctx.fill();
    }
}