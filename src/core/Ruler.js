import {
    getClosestTimesVal,
    nearestPixelVal
} from "../common/utils.js";
import {
    rotateInCanvas
} from "../common/canvas.js";
import {
    HALF_PI
} from "../common/constant.js";

const getStepByZoom = (zoom) => {
    /**
     * 步长研究，参考 figma
     * 1
     * 2
     * 5
     * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
     * 25（对应 200% 往上）
     * 50（对应 100% 往上）
     * 100（对应 50% 往上）
     * 250
     * 500
     * 1000
     * 2500
     * 5000
     */
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const step = 50 / zoom;
    for (let i = 0, len = steps.length; i < len; i++) {
        if (steps[i] >= step) return steps[i];
    }
    return steps[0];
};

export class Ruler {
    visible = true;

    constructor(editor) {
        this.editor = editor;
    }
    open() {
        this.visible = true;
    }
    close() {
        this.visible = false;
    }
    draw() {
        const ctx = this.editor.ctx;
        ctx.save();
        this.drawXRuler();
        this.drawYRuler();
        ctx.restore();
    }
    drawXRuler() {
        // 绘制刻度线和刻度值
        // 计算 x 轴起点和终点范围
        const setting = this.editor.setting;
        const ctx = this.editor.ctx;
        const zoom = this.editor.zoomManager.getZoom();
        const viewport = this.editor.viewportManager.getViewport();
        const stepInScene = getStepByZoom(zoom);

        const startX = setting.get('rulerWidth');
        let startXInScene = viewport.x + startX / zoom;
        startXInScene = getClosestTimesVal(startXInScene, stepInScene);

        const endX = viewport.width;
        let { x: endXInScene } = this.editor.viewportCoordsToScene(endX, 0);
        endXInScene = getClosestTimesVal(endXInScene, stepInScene);

        ctx.textAlign = 'center';
        const y = 0;
        while (startXInScene <= endXInScene) {
            ctx.strokeStyle = setting.get('rulerMarkStroke');
            ctx.fillStyle = setting.get('rulerMarkStroke');
            const x = nearestPixelVal((startXInScene - viewport.x) * zoom);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + setting.get('rulerMarkSize'));
            ctx.stroke();
            ctx.closePath();
            ctx.font = `${setting.get('rulerFontSize')}px sans-serif`;
            ctx.fillText(String(startXInScene), x, y + setting.get('rulerFontSize') * 2);
            startXInScene += stepInScene;
        }
    }
    drawYRuler() {
        // 绘制刻度线和刻度值
        const setting = this.editor.setting;
        const ctx = this.editor.ctx;
        const zoom = this.editor.zoomManager.getZoom();
        const viewport = this.editor.viewportManager.getViewport();
        const stepInScene = getStepByZoom(zoom);

        const startY = setting.get('rulerWidth');
        let startYInScene = viewport.y + startY / zoom;
        startYInScene = getClosestTimesVal(startYInScene, stepInScene);

        const endY = viewport.height;
        let endYInScene = viewport.y + endY / zoom;
        endYInScene = getClosestTimesVal(endYInScene, stepInScene);
        const x = 0;
        ctx.textAlign = 'center';
        while (startYInScene <= endYInScene) {
            ctx.fillStyle = setting.get('rulerMarkStroke');
            const y = nearestPixelVal((startYInScene - viewport.y) * zoom);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + setting.get('rulerMarkSize'), y);
            ctx.stroke();
            ctx.closePath();
            rotateInCanvas(ctx, -HALF_PI, x, y);
            ctx.font = `${setting.get('rulerFontSize')}px sans-serif`;
            ctx.fillText(String(startYInScene), x, y + setting.get('rulerFontSize') * 2);
            rotateInCanvas(ctx, HALF_PI, x, y);
            startYInScene += stepInScene;
        }
    }
}