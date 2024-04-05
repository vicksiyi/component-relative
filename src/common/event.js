/**
 * EventEmitter
 *
 * Publish-Subscribe Design Pattern
 */

export class EventEmitter {
    eventMap = {};

    on(eventName, listener) {
        if (!this.eventMap[eventName]) {
            this.eventMap[eventName] = [];
        }
        this.eventMap[eventName].push(listener);
        return this;
    }

    emit(eventName, ...args) {
        const listeners = this.eventMap[eventName];
        if (!listeners || listeners.length === 0) return false;
        listeners.forEach((listener) => {
            listener(...args);
        });
        return true;
    }

    off(eventName, listener) {
        if (this.eventMap[eventName]) {
            this.eventMap[eventName] = this.eventMap[eventName].filter(
                (item) => item !== listener,
            );
        }
        return this;
    }
}

export default EventEmitter;