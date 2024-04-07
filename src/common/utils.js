/**
 * 节流 + raf
 */
export const rafThrottle = (callback) => {
  let requestId;

  const throttled = function (...args) {
    if (requestId === undefined) {
      requestId = requestAnimationFrame(() => {
        requestId = undefined;
        callback(args);
      });
    }
  };

  throttled.cancel = () => {
    if (requestId !== undefined) {
      cancelAnimationFrame(requestId);
    }
    requestId = undefined;
  };

  return throttled;
};

/**
 * @param {*} round 是否四舍五入取整
 * @returns 
 */
export const viewportCoordsToSceneUtil = (x, y, zoom, scrollX, scrollY,
  round = false,
) => {
  let newX = scrollX + x / zoom;
  let newY = scrollY + y / zoom;
  if (round) {
    newX = Math.round(newX);
    newY = Math.round(newY);
  }
  return {
    x: newX,
    y: newY,
  };
};

/**
* 找出离 value 最近的 segment 的倍数值
*/
export const getClosestTimesVal = (value, segment) => {
  const n = Math.floor(value / segment);
  const left = segment * n;
  const right = segment * (n + 1);
  return value - left <= right - value ? left : right;
};

/**
 * Canvas 中绘制，必须为 x.5 才能绘制一列单独像素，
 * 否则会因为抗锯齿，绘制两列像素，且一个为半透明，导致一种模糊的效果
 *
 * 这个方法会得到值最接近的 x.5 值。
 */
export const nearestPixelVal = (n) => {
  const left = Math.floor(n);
  const right = Math.ceil(n);
  return (n - left < right - n ? left : right) + 0.5;
};

/**
 * 根据ID获取颜色
 */
export const arbitraryColorFromID = (id) => {
  let hash = 0
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 0x1000193)
  return '#' + (0x1000000 | hash).toString(16).slice(-6)
}