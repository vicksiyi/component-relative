export class Setting {
    value = {
        /***** paint ****/
        canvasBgColor: '#f4f4f4',
        /*********** zoom *************/
        zoomStep: 0.2325,
        zoomMin: 0.015625,
        zoomMax: 256,
        zoomLevels: [
            0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128,
            256,
        ],
        offsetX: 0, // mouse offset
        offsetY: 0,
        /**** ruler ****/
        enableRuler: true,
        minStepInViewport: 50, // 视口区域下的最小步长
        rulerBgColor: '#fff',
        rulerStroke: '#e6e6e6',
        rulerMarkStroke: '#c1c1c1',
        rulerWidth: 15, // 宽度
        rulerMarkSize: 4, // 刻度高度
        rulerFontSize: 6, // 刻度字体大小
    };
    set(key, value) {
        this.value[key] = value;
    }
    get(key) {
        return this.value[key];
    }
    getAttrs() {
        return { ...this.value };
    }
}