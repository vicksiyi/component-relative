import { EventEmitter } from "../../common/event.js";

export class GlobalEventManager {
    moves = []; // mousemove 事件
    downs = []; // mousedown 事件
    isInit = false;
    eventEmitter = new EventEmitter();
    constructor(editor) {
        this.editor = editor;
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
        onmousemove = e => this.eventEmitter.emit('global-move', e);
        onmousedown = e => this.eventEmitter.emit('global-down', e);
        onmouseup = e => this.eventEmitter.emit('global-up', e);
    }
    on(eventName, cb) {
        this.eventEmitter.on(eventName, cb);
    }
}