import { getDevicePixelRatio } from "../common/index.js";
import { rafThrottle, arbitraryColorFromID } from "../common/utils.js";
import { EventEmitter } from "../common/event.js";
import { Tree } from "./node/Tree.js";
import { type2Size } from "./node/Attr.js";
export class Scene {
    eventEmitter = new EventEmitter();
    animatedTreeNodes = new Map;
    sourceOuterPos = null;
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
        this.draw();
        ctx.restore();

        /** drawing rulers */
        if (setting.get('enableRuler')) {
            this.editor.ruler.draw();
        }
        ctx.restore();

        this.eventEmitter.emit('render');
    });
    draw() {
        const ctx = this.editor.ctx;
        const textColor = getComputedStyle(document.body).color;
        /**
         * 层级线
         */
        const visit = (id) => {
            const { x: nodeX, y: nodeY, node } = this.animatedTreeNodes.get(id);
            for (const childId of node.children) {
                const { x: childX, y: childY } = this.animatedTreeNodes.get(childId);
                ctx.beginPath();
                ctx.moveTo(nodeX, nodeY);
                ctx.quadraticCurveTo(childX, nodeY, childX, childY);
                ctx.stroke()
                visit(childId);
            }
        }
        ctx.fillStyle = textColor;
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1;
        this.tree.sources.forEach(id => visit(id));
        /**
         * 绘制source 外框
         */
        ctx.save();
        const sourceOuterPos = this.sourceOuterPos;
        const fontSize = 16;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = textColor;
        ctx.setLineDash([10]);
        ctx.lineWidth = 2;
        ctx.strokeRect(sourceOuterPos.x, sourceOuterPos.y, sourceOuterPos.w, sourceOuterPos.h);
        //外框文字
        ctx.fillStyle = textColor
        ctx.textAlign = 'start'
        ctx.textBaseline = 'middle'
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText('Source区', sourceOuterPos.x, sourceOuterPos.y - fontSize);
        ctx.restore();
        /**
         * 绘制所有节点
         */
        for (let [_, detail] of this.animatedTreeNodes) {
            ctx.fillStyle = arbitraryColorFromID(detail.node.id);
            const size = type2Size(detail.node.type);
            ctx.beginPath();
            ctx.arc(detail.x, detail.y, size, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }
    load(data) {
        this.tree = new Tree({ data });
        this.calcPos();
        this.render();
    }
    /**
     * 计算节点位置
     */
    calcPos() {
        /**
         * offsetX 节点之间偏移
         * offsetY 上下层级之间偏移
         */
        const offsetY = 50, offsetX = 40;
        const visit = (id, x, y) => {
            const node = this.tree.nodes.get(id);
            let width = 0, height = 0;
            for (const child of node.children) {
                const bound = visit(child, x + width, y + offsetY);
                width += bound.width + offsetX;
                height += bound.height + offsetY;
            }
            const size = type2Size(node.type);
            width = Math.max(width - offsetX, 0);
            x += width / 2;
            const info = { x, y, size, node };
            this.animatedTreeNodes.set(node.id, info);
            return { width, height };
        }
        const sources = this.tree.sources;
        /**
         * start 最开始source tree绘制的位置
         * gap 每个source tree之间的偏移
         */
        const gap = 100;
        const start = { x: 0, y: 0 };
        let offset = 0, width = 0, height = 0;
        /**
         * 计算所有souces的位置
         */
        sources.forEach((id) => {
            const bound = visit(id, start.x + offset, 0);
            offset += bound.width + gap;
            height = Math.max(bound.height - offsetY, height);
        });
        if (sources.length) width = offset - gap;

        /**
         * padding 外框距离内元素padding
         */
        const padding = { x: 100, y: 50 };
        this.sourceOuterPos = {
            x: start.x - padding.x,
            y: start.y - padding.y,
            w: width + padding.x * 2,
            h: height + padding.y * 2
        };

        /**
         * 计算所有root位置
         * gapSource 和source之间的间距
        */
        const gapSource = 100;
        visit(this.tree.root, width / 2, height + padding.y + gapSource);
    }
    on(eventName, handler) {
        this.eventEmitter.on(eventName, handler);
    }
    off(eventName, handler) {
        this.eventEmitter.off(eventName, handler);
    }
}