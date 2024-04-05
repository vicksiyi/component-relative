import { viewportCoordsToSceneUtil } from "../common/utils.js";

export class ZoomManager {
    editor;
    zoom = 1;
    constructor(editor) {
        this.editor = editor;
    }
    getZoom() {
        return this.zoom;
    }
    setZoom(zoom) {
        const prevZoom = this.zoom;

        // limit zoom range
        const zoomMax = this.editor.setting.get('zoomMax');
        if (zoom > zoomMax) {
            zoom = zoomMax;
        }

        const zoomMin = this.editor.setting.get('zoomMin');
        if (zoom < zoomMin) {
            zoom = zoomMin;
        }

        this.zoom = zoom;
    }
    /**
     * zoom in
     * reference: https://mp.weixin.qq.com/s/UDnIxjYEsTop51gW7fwxMw
     * @param {*} opts ?: { center?: IPoint; enableLevel?: boolean }
     * @param center zoom center
     * @param enableLevel zoom by level
     */
    zoomIn(opts) {
        const zoomStep = this.editor.setting.get('zoomStep');
        const prevZoom = this.zoom;

        let zoom;
        if (opts?.enableLevel) {
            const levels = this.editor.setting.get('zoomLevels');
            const [, right] = getNearestVals(levels, prevZoom);
            zoom = right;
        } else {
            zoom = Math.min(
                prevZoom * (1 + zoomStep),
                this.editor.setting.get('zoomMax'),
            );
        }

        this.setZoom(zoom);
        this.adjustScroll(prevZoom, opts?.center);
    }
    /**
     * zoom out
     * reference: https://mp.weixin.qq.com/s/UDnIxjYEsTop51gW7fwxMw
     * @param {*} opts ?: { center?: IPoint; enableLevel?: boolean }
     * @param center zoom center
     * @param enableLevel zoom by level
     */
    zoomOut(opts) {
        const zoomStep = this.editor.setting.get('zoomStep');
        const prevZoom = this.zoom;
        let zoom;
        if (opts?.enableLevel) {
            const levels = this.editor.setting.get('zoomLevels');
            const [left] = getNearestVals(levels, prevZoom);
            zoom = left;
        } else {
            zoom = Math.max(
                prevZoom / (1 + zoomStep),
                this.editor.setting.get('zoomMin'),
            );
        }

        this.setZoom(zoom);
        this.adjustScroll(prevZoom, opts?.center);
    }
    /**
     * adjust scroll value
     * if no set (cx, cy), scale by canvas center
     */
    adjustScroll(prevZoom, center) {
        const viewportManager = this.editor.viewportManager;
        const zoom = this.editor.zoomManager.getZoom();

        const { x: scrollX, y: scrollY } = viewportManager.getViewport();

        if (!center) {
            center = this.getCanvasCenter();
        }

        const { x: sceneX, y: sceneY } = viewportCoordsToSceneUtil(
            center.x,
            center.y,
            prevZoom,
            scrollX,
            scrollY,
        );
        const newScrollX = sceneX - center.x / zoom;
        const newScrollY = sceneY - center.y / zoom;

        viewportManager.setViewport({
            x: newScrollX,
            y: newScrollY,
        });
    }
}

/**
 * binary search to find
 * the left and right index of the target value
 */
const getNearestVals = (arr, target) => {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            right = mid - 1;
            left = mid + 1;
            break;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    if (right < 0) right = 0;
    if (left >= arr.length) left = arr.length - 1;
    return [arr[right], arr[left]];
};