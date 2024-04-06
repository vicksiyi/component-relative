import { ViewportManager } from "./ViewportManager.js";
import { ZoomManager } from "./ZoomManager.js";
import { Setting } from "./Setting.js";
import { Scene } from "./Scene.js";
import { HostEventManager } from "./HostEventManager.js";
import { Ruler } from "./Ruler.js";
import { viewportCoordsToSceneUtil } from "../common/utils.js";

export class Editor {
    containerElement;
    canvasElement;
    ctx;
    constructor() {
        this.containerElement = document.body;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.canvasElement = document.createElement('canvas');
        this.containerElement.appendChild(this.canvasElement);
        this.ctx = this.canvasElement.getContext('2d');

        this.setting = new Setting();
        this.scene = new Scene(this);
        this.viewportManager = new ViewportManager(this);
        this.zoomManager = new ZoomManager(this);

        this.hostEventManager = new HostEventManager(this);
        this.ruler = new Ruler(this);
        this.hostEventManager.bindHotkeys();

        this.viewportManager.setViewport({
            x: 0,
            y: 0,
            width,
            height,
        });
        this.render();
    }
    /**
     * viewport coords to scene coords
     *
     * reference: https://mp.weixin.qq.com/s/uvVXZKIMn1bjVZvUSyYZXA
     */
    viewportCoordsToScene(x, y, round = false) {
        const zoom = this.zoomManager.getZoom();
        const { x: scrollX, y: scrollY } = this.viewportManager.getViewport();
        return viewportCoordsToSceneUtil(x, y, zoom, scrollX, scrollY, round);
    }
    getCursorXY(event) {
        return {
            x: event.clientX - this.setting.get('offsetX'),
            y: event.clientY - this.setting.get('offsetY'),
        };
    }
    destroy() {
        this.hostEventManager.destroy();
    }
    render() {
        this.scene.render();
    }
}