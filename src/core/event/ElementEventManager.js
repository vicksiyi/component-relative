import { EventEmitter } from "../../common/event.js";

/**
 * 元素事件管理
 */
export class EventManager {
    moves = []; // mousemove 事件
    downs = []; // mousedown 事件
    isInit = false;
    eventEmitter = new EventEmitter();
    constructor(editor, target) {
        this.editor = editor;
        this.target = target ?? window;
        this.initListener();
    }
    clear() {
        this.eventEmitter.clear();
    }
    initListener() {
        /**
         * 禁止重复监听
         */
        if (this.isInit) return;
        this.isInit = true;
        const target = this.target;
        target.onmousemove = e => this.eventEmitter.emit('move', e);
        target.onmousedown = e => this.eventEmitter.emit('down', e);
        target.onmouseup = e => this.eventEmitter.emit('up', e);
    }
    on(eventName, cb) {
        this.eventEmitter.on(eventName, cb);
    }
}