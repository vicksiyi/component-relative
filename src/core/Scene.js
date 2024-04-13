import { getDevicePixelRatio } from "../common/index.js";
import { 
    rafThrottle, 
    arbitraryColorFromID, 
    getMergedBound 
} from "../common/utils.js";
import { EventEmitter } from "../common/event.js";
import { Tree } from "./node/Tree.js";
import { type2Size } from "./node/Attr.js";
export class Scene {
    eventEmitter = new EventEmitter();
    animatedTreeNodes = new Map;
    sourceOuterRect = null; // source 外框 bound 注意：x，y表示左上角坐标
    rootOuterRect = null; // root 外框 bound 注意：x，y表示左上角坐标
    get sceneRect() {
        const rect = {
            x: this.sourceOuterRect.x,
            y: this.sourceOuterRect.y,
            w: Math.max(this.sourceOuterRect.w, this.rootOuterRect.w),
            h: this.sourceOuterRect.h + this.rootOuterRect.h + 100
        }
        return rect;
    }
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

        /** drawing relativeLines */
        this.editor.relativeLine.draw();
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
        visit(this.tree.root);
        /**
         * 绘制source 外框
         */
        ctx.save();
        const sourceOuterRect = this.sourceOuterRect;
        const fontSize = 16;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = textColor;
        ctx.setLineDash([10]);
        ctx.lineWidth = 2;
        ctx.strokeRect(sourceOuterRect.x, sourceOuterRect.y, sourceOuterRect.w, sourceOuterRect.h);
        //外框文字
        ctx.fillStyle = textColor
        ctx.textAlign = 'start'
        ctx.textBaseline = 'middle'
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText('Source区', sourceOuterRect.x, sourceOuterRect.y - fontSize);
        ctx.restore();
        /**
         * 绘制所有节点
         */
        for (let [_, detail] of this.animatedTreeNodes) {
            const { x, y, w, node: { id, type } } = detail;
            if (['symbolMaster', 'symbolInstance'].includes(type)) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x, y, w / 2 + 2, 0, 2 * Math.PI, false);
                ctx.fill();
            }
            ctx.fillStyle = arbitraryColorFromID(id);
            ctx.beginPath();
            ctx.arc(x, y, w / 2, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = textColor
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = `${8}px sans-serif`;
            ctx.fillText(id, x, y);
        }
    }
    /**
     * data:
     *  nodes 所有的节点数据
     *  sources 所有的sources id列表
     *  root 当前节点
     */
    load(data) {
        this.tree = new Tree({ data });
        this.calcPos();
        this.bindEvent();
        this.editor.zoomManager.zoomToFit();
        this.render();
    }
    /**
     * 计算节点位置
     */
    calcPos() {
        /**
         * -- 计算所有sources的位置
         * offsetX 节点之间偏移
         * offsetY 上下层级之间偏移
         * start 最开始source tree绘制的位置
         * gap 每个source tree之间的偏移
         */
        const offsetY = 50, offsetX = 40;
        const visit = (id, x, y) => {
            const node = this.tree.nodes.get(id);
            let width = 0, height = 0;
            for (const child of node.children) {
                const bound = visit(child, x + width, y + offsetY);
                width += bound.width + offsetX;
                height = Math.max(height, bound.height + offsetY);
            }
            const size = type2Size(node.type);
            width = Math.max(width - offsetX, 0);
            x += width / 2;
            const info = { x, y, w: size, h: size, node };
            this.animatedTreeNodes.set(node.id, info);
            return { width, height };
        }
        const sources = this.tree.sources;
        const gap = 100;
        const start = { x: 0, y: 0 };
        let offset = 0, width = 0, height = 0;
        sources.forEach((id) => {
            const bound = visit(id, start.x + offset, 0);
            offset += bound.width + gap;
            height = Math.max(bound.height, height);
        });
        if (sources.length) width = offset - gap;

        /**
         * 计算source 外框的位置
         * -- padding 外框距离内元素padding
         */
        const padding = { x: 100, y: 50 };
        const mrSourceBound = this.calcTreeBoundByRootIds(sources);
        this.sourceOuterRect = {
            x: mrSourceBound.x - mrSourceBound.w / 2 - padding.x,
            y: mrSourceBound.y - mrSourceBound.h / 2 - padding.y,
            w: mrSourceBound.w + padding.x * 2,
            h: mrSourceBound.h + padding.y * 2
        };

        /**
         * -- 计算所有root位置
         * gapSource 和source之间的间距
        */
        const gapSource = 100;
        const rootStart = { x: start.x, y: start.y + this.sourceOuterRect.h + gapSource }
        const rootSize = visit(this.tree.root, rootStart.x, rootStart.y);
        this.rootOuterRect = {
            x: rootStart.x,
            y: rootStart.y,
            w: rootSize.width,
            h: rootSize.height
        }
    }
    /**
     * 计算某个树bound
     */
    calcTreeBoundByRootIds(ids) {
        const nodes = [];
        const visit = (id) => {
            const nodeDetail = this.animatedTreeNodes.get(id);
            if (!nodeDetail) return;
            const node = nodeDetail.node;
            nodes.push(nodeDetail);
            node.children?.forEach(child => visit(child));
        }
        ids.forEach(id => visit(id));
        const mrBound = getMergedBound(...nodes);
        return mrBound;
    }
    /**
     * 给节点绑定事件
     */
    bindEvent() {
        const animatedTreeNodes = this.animatedTreeNodes;
        const globalEventManager = this.editor.globalEventManager;
        const relativeLine = this.editor.relativeLine;
        /**
         * 节点hover事件
         */
        for (let [_, detail] of animatedTreeNodes) {
            globalEventManager.add('move', {
                cursor: 'pointer',
                bound: {
                    x: detail.x,
                    y: detail.y,
                    w: detail.w,
                    h: detail.h
                }
            });
        }

        const visit = (id, cb) => {
            const nNode = this.animatedTreeNodes.get(id);
            if (!nNode) return;
            const node = nNode.node;
            globalEventManager.add('down', {
                bound: {
                    x: nNode.x,
                    y: nNode.y,
                    w: nNode.w,
                    h: nNode.h
                },
                action: (e) => cb(node.id)
            });
            for (const child of node.children) {
                visit(child, cb);
            }
        }
        /**
         * 开启/关闭关系线
         */
        visit(this.tree.root, (id) => {
            if (relativeLine.has(id)) {
                relativeLine.remove(id);
            } else {
                relativeLine.active(id);
            }
            this.editor.render();
        });
        /**
         * 跳转选中节点
         */
        this.tree.sources.forEach(rootId => {
            visit(rootId, (id) => {
                if (relativeLine.has(id)) {
                    relativeLine.remove(id);
                } else {
                    relativeLine.active(id);
                }
                this.editor.render();
            });
        })
    }
    on(eventName, handler) {
        this.eventEmitter.on(eventName, handler);
    }
    off(eventName, handler) {
        this.eventEmitter.off(eventName, handler);
    }
}