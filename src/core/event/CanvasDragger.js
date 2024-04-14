import { EventEmitter } from "../../common/event.js";
export class CanvasDragger {
    _isInit = false;
    isDragging = false;
    eventEmitter = new EventEmitter();
    constructor(editor) {
        this.editor = editor;
        this.bindEvents();
    }
    bindEvents() {
        if (this._isInit) return;
        this._isInit = true;
        const editor = this.editor;
        editor.sceneEventManager.on('down', this.handlePointerDown.bind(this));
        editor.windowEventManager.on('move', this.handlePointerMove.bind(this));
        editor.windowEventManager.on('up', this.handlePointerUp.bind(this));
    }
    _getCursorInScene(e) {
        const cursorXY = this.editor.getCursorXY(e);
        const { x, y } = this.editor.viewportCoordsToScene(cursorXY.x, cursorXY.y);
        return { x, y };
    }
    handlePointerDown(e) {
        this.isDragging = true;
        const pos = this._getCursorInScene(e);
        this.editor.dragBox.setStart(pos);
        this.editor.render();
    }
    handlePointerMove(e) {
        const pos = this._getCursorInScene(e);
        this.editor.dragBox.setEnd(pos);
        if (this.isDragging) this.editor.render();
    }
    handlePointerUp(e) {
        this.isDragging = false;
        this.eventEmitter.emit('up');
        this.editor.render();
    }
    on(eventName, callback) {
        this.eventEmitter.on(eventName, callback);
    }
}