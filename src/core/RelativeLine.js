import { arbitraryColorFromID } from "../common/utils.js";
/**
 * 关系线
 * root/root-child to source/source-child
 */
export class RelativeLine {
    ids = new Map; // string[]
    constructor(editor) {
        this.editor = editor;
    }
    clear() {
        this.ids.clear();
    }
    active(id) {
        this.ids.set(id, true);
    }
    has(id) {
        return this.ids.has(id) && this.ids.get(id);
    }
    remove(id) {
        this.ids.set(id, false);
    }
    delete(id) {
        this.ids.delete(id);
    }
    draw() {
        if (this.ids.size === 0) return;
        const ids = this.ids;
        const ctx = this.editor.ctx;
        const animatedTreeNodes = this.editor.scene.animatedTreeNodes;
        for (let [id, val] of ids) {
            if (!val) continue;
            const startNode = animatedTreeNodes.get(id);
            if(!startNode) continue;
            const to = startNode.node.fromId;
            if (!to) continue;
            const endNode = animatedTreeNodes.get(to);
            if (!endNode) continue;
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