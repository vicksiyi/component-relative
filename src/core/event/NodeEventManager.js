import { isInBound } from "../../common/utils.js";
/**
 * 节点绑定事件
 */
export class NodeEventManager {
    moves = []; // mousemove 事件
    downs = []; // mousedown 事件
    isInit = false;
    constructor(editor) {
        this.editor = editor;
    }
    /**
     * data:
     *  type 事件类型
     *  cursor 鼠标指针
     *  bound {x,y,w,h} 注意：x，y为中心点
     *  action 可选值
     */
    add(type, data) {
        let events;
        switch (type) {
            case 'move':
                events = this.moves;
                break;
            case 'down':
                events = this.downs;
                break;
        }
        if (events) events.push(data);
    }
    bindEvent() {
        if (this.isInit) return;
        this.isInit = true;
        
        const {
            windowEventManager,
            canvasDragger,
            dragBox,
            scene,
            relativeLine
        } = this.editor;
        windowEventManager.on('move', (e) => {
            const events = this.moves;
            const cursorXY = this.editor.getCursorXY(e);
            const { x, y } = this.editor.viewportCoordsToScene(cursorXY.x, cursorXY.y);
            for (const event of events) {
                // select first event
                if (isInBound(event.bound, { x, y })) {
                    document.body.style.cursor = event.cursor;
                    return;
                }
            }
            document.body.style.cursor = 'auto';
        });
        windowEventManager.on('down', e => {
            const events = this.downs;
            const cursorXY = this.editor.getCursorXY(e);
            const { x, y } = this.editor.viewportCoordsToScene(cursorXY.x, cursorXY.y);
            for (const event of events) {
                if (isInBound(event.bound, { x, y })) {
                    e.preventDefault();
                    if (event.action) event.action(e);
                    return;
                }
            }
        });
        canvasDragger.on('up', () => {
            const bound = dragBox.bound;
            const animatedTreeNodes = scene.animatedTreeNodes;
            for (let [_, detail] of animatedTreeNodes) {
                const { x, y, node: { id } } = detail;
                if (isInBound(bound, { x, y })) {
                    if (relativeLine.has(id)) {
                        relativeLine.remove(id);
                    } else {
                        relativeLine.active(id);
                    }
                }
            }
        })
    }
}