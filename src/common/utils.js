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
export const viewportCoordsToSceneUtil = (x,y,zoom,scrollX,scrollY,
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