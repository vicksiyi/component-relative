import { getDevicePixelRatio } from "../common/index.js";
import { rafThrottle } from "../common/utils.js";
import { EventEmitter } from "../common/event.js";
export class Scene {
    eventEmitter = new EventEmitter();

    constructor(editor) {
        this.editor = editor;
    }
    // 全局重渲染
    render = rafThrottle(() => {
        // 获取视口区域
        const {
            viewportManager,
            canvasElement: canvas,
            ctx,
            setting,
        } = this.editor;
        const viewport = viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // 2. 清空画布，然后绘制所有可见元素
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景色
        ctx.save();
        ctx.fillStyle = setting.get('canvasBgColor');
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();

        // 场景坐标转换为视口坐标
        const dpr = getDevicePixelRatio();

        const dx = -viewport.x;
        const dy = -viewport.y;
        ctx.scale(dpr * zoom, dpr * zoom);
        ctx.translate(dx, dy);

        ctx.save();
        // 随便绘制一个图形
        ctx.fillStyle = "#fa0000";
        ctx.fillRect(0, 0, 20, 20);
        ctx.fill();

        ctx.restore();

        this.eventEmitter.emit('render');
    });
    on(eventName, handler) {
        this.eventEmitter.on(eventName, handler);
    }
    off(eventName, handler) {
        this.eventEmitter.off(eventName, handler);
    }
}