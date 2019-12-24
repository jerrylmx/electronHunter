define([], function() {
    return class FrameManager {
        constructor(config = {}) {
            // Server rate
            this.rate = config.rate || 25;

            // Circular frame queue
            this.queue = [];

            // Queue size
            this.capacity = config.capacity || 3;

            // Next slot
            this.top = 0;

            // Ready
            this.ready = false;

        }

        push(data) {
            let frame = {
                time: new Date().getTime(),
                payload: data
            };
            if (this.queue.length < this.capacity) {
                this.queue.push(frame);
            } else {
                this.top = this.top % this.capacity;
                this.ready = true;
                this.queue[this.top] = frame;
            }
            this.top++;
        }

        // x0 ----- x1
        pop() {
            let x1 = this.queue[(this.top - 1 + this.capacity) % this.capacity];
            let x0 = this.queue[(this.top - 2 + this.capacity) % this.capacity];
            let res = {};
            for (let i = 0; i < Object.keys(x1.payload).length; i++) {
                let key = Object.keys(x1.payload)[i];
                let entity = x1.payload[key];
                res[key] = clone(entity);

                // No interpolation on non-spacial, or new objects
                if (!entity.x || !entity.y || !x0.payload[key]) {
                    continue;
                } else {
                    let r = (new Date().getTime() - x0.time) / this.rate;
                    if (r > 1.5) {
                        continue;
                    }
                    let dx = x1.payload[key].x - x0.payload[key].x;
                    let dy = x1.payload[key].y - x0.payload[key].y;
                    res[key].x = x0.payload[key].x + dx * r;
                    res[key].y = x0.payload[key].y + dy * r;
                }
            }
            return res;
        }
    }
});


function clone(obj) {
    if (obj == null || typeof (obj) != 'object')
        return obj;
    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}