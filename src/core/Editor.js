import { ViewportManager } from "./ViewportManager.js";
import { ZoomManager } from "./ZoomManager.js";
import { Setting } from "./Setting.js";
import { Scene } from "./Scene.js";
import { HostEventManager } from "./HostEventManager.js";
export class Editor {
    containerElement;
    canvasElement;
    ctx;
    constructor(options) {
        this.containerElement = options?.containerElement ?? document.body;
        const width = options?.width ?? window.innerWidth;
        const height = options?.height ?? window.innerHeight;
        this.canvasElement = document.createElement('canvas');
        this.containerElement.appendChild(this.canvasElement);
        this.ctx = this.canvasElement.getContext('2d');

        this.setting = new Setting();
        this.scene = new Scene(this);
        this.viewportManager = new ViewportManager(this);
        this.zoomManager = new ZoomManager(this);

        this.hostEventManager = new HostEventManager(this);
        this.hostEventManager.bindHotkeys();

        this.viewportManager.setViewport({
            x: -width / 2,
            y: -height / 2,
            width,
            height,
        });
        Promise.resolve().then(() => {
            this.render();
        });
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