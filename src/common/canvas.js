/**
 * 绘制时应用旋转
 */
export const rotateInCanvas = (ctx, angle, cx, cy) => {
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);
};