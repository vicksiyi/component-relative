/**
 * 类型
 */
const TYPE = {
    SYMBOL_MASTER : 'symbolMaster',
    SYMBOL_INSTANCE: 'symbolInstance',
}
const DEFAULT_SIZE = 24;

/**
 * 对应的ICON [SVG字符串]
 */
const ICON = {
    [TYPE.SYMBOL_MASTER]: '',
    [TYPE.SYMBOL_INSTANCE]: ''
}

/**
 * 通过类型获取大小
 */
export function type2Size(type) {
    if (type === TYPE.SYMBOL_MASTER) return DEFAULT_SIZE * 1.5;
    if (type === TYPE.SYMBOL_INSTANCE) return DEFAULT_SIZE * 1.2;
    return DEFAULT_SIZE;
}

/**
 * 通过类型获取icon
 */
export function type2Icon(type) {
    const icon = ICON[type];
    if (icon) return icon;
    return '';
}