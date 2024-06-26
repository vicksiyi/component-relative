import { ViewportManager } from "./ViewportManager.js";
import { ZoomManager } from "./ZoomManager.js";
import { Setting } from "./Setting.js";
import { Scene } from "./Scene.js";
import { Ruler } from "./Ruler.js";
import { RelativeLine } from "./RelativeLine.js";
import {
    EventManager,
    NodeEventManager,
    CanvasDragger,
    HostEventManager
} from "./event/index.js";
import { DragBox } from "./DragBox.js";
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
        this.windowEventManager = new EventManager(this, window);
        this.sceneEventManager = new EventManager(this, this.canvasElement);
        this.canvasDragger = new CanvasDragger(this);
        this.nodeEventManager = new NodeEventManager(this);
        
        
        this.dragBox = new DragBox(this);
        this.relativeLine = new RelativeLine(this);
        this.ruler = new Ruler(this);
        this.hostEventManager.bindHotkeys();
        this.nodeEventManager.bindEvent();

        this.viewportManager.setViewport({
            x: 0,
            y: 0,
            width,
            height,
        });
        this.render();
    }
    loadData(data) {
        this.scene.load(data);
    }
    /**
     * viewport coords to scene coords
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