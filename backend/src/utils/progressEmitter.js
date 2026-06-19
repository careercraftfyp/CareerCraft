import { EventEmitter } from 'events';

class ProgressEmitter extends EventEmitter {
    sendProgress(userId, step, message) {
        this.emit('progress', { userId, step, message });
    }
}

export const progressEmitter = new ProgressEmitter();
