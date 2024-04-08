import { arbitraryColorFromID } from "../common/utils.js";
/**
 * 关系线
 * root/root-child to source/source-child
 */
export class RelativeLine {
    ids = new Map; // string[]
    constructor(editor) {
        this.editor = editor;
        /**
         * 测试数据
         */
        this.ids.set('1:0', true);
        this.ids.set('1:1', true);
    }
    clear() {
        this.ids.clear();
    }
    add(id) {
        this.ids.set(id, true);
    }
    remove(id) {
        this.ids.delete(id);
    }
    draw() {
        if (this.ids.size === 0) return;
        const ids = this.ids;
        const ctx = this.editor.ctx;
        const animatedTreeNodes = this.editor.scene.animatedTreeNodes;
        for (let [id, _] of ids) {
            const startNode = animatedTreeNodes.get(id);
            if(!startNode) break;
            const to = startNode.node.fromId;
            if (!to) break;
            const endNode = animatedTreeNodes.get(to);
            if (!endNode) break;
            const color = arbitraryColorFromID(startNode.node.id);
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(startNode.x, startNode.y);
            ctx.quadraticCurveTo(endNode.x, startNode.y, endNode.x, endNode.y);
            ctx.stroke();
            ctx.save();
            ctx.translate(endNode.x, endNode.y - 1);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-5, +6);
            ctx.lineTo(+5, +6);
            ctx.fill();
            ctx.restore();
        }
    }
}