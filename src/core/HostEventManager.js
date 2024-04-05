import { EventEmitter } from "../common/event.js";
/**
 * 按键、鼠标等事件管理
 */
export class HostEventManager {
    eventEmitter = new EventEmitter();
    unbindHandlers = [];

    constructor(editor) {
        this.editor = editor;
    }
    bindHotkeys() {
        this.bindWheelEvent();
    }
    /**
     * bind wheel event, to zoom or move canvas
     */
    bindWheelEvent() {
        const editor = this.editor;
        const onWheel = (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                const point = this.editor.getCursorXY(event);
                let isZoomOut = event.deltaY > 0;
                if (isZoomOut) {
                    editor.zoomManager.zoomOut({
                        center: point,
                    });
                } else {
                    editor.zoomManager.zoomIn({
                        center: point,
                    });
                }
                editor.render();
            } else {
                const zoom = editor.zoomManager.getZoom();
                editor.viewportManager.translate(
                    event.deltaX / zoom,
                    event.deltaY / zoom,
                );
                editor.render();
            }
        };

        // prevent default scale page action in win
        const preventDefaultScalePage = (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
            }
        };

        editor.canvasElement.addEventListener('wheel', onWheel);
        window.addEventListener('wheel', preventDefaultScalePage, {
            passive: false,
        });
        this.unbindHandlers.push(() => {
            editor.canvasElement.removeEventListener('wheel', onWheel);
            window.removeEventListener('wheel', preventDefaultScalePage);
        });
    }
    destroy() {
        this.unbindHandlers.forEach((fn) => fn());
        this.unbindHandlers = [];
    }
}
