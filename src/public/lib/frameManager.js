class FrameManager {
    /**
     * Client side frame manager.
     *
     * Objective #1: Smoothing for low server sync rate.
     *   -----------
     * --> F2  F1 ---> F23 F22 F21 F13 F12 F11
     *   -----------
     *
     * Objective #2: De-jitter
     *   -----------
     * --> F3   F2 F1 ---> F3 F2 F1
     *   -----------
     *
     * @param serverRate
     * @param config
     */
    constructor(serverRate, config={}) {
        var that = this;

        // Frame queue
        this.queue = [];

        // Expected server sync rate
        this.serverRate = serverRate;

        // Expected buffer size
        this.capacity = config.capacity || 2;

        // Buffer queue init
        this.filled = false;

        // Flow change locked
        this.lockFlow = false;

        // Time to wait until next flow change
        this.lockFreeze = config.lockFreeze || 100;

        // Buffer size tolerance
        this.windowSize = config.windowSize || 1;

        // Allow dynamic flow change
        this.dynamicFlow = config.dynamicFlow || true;

        // Expected output rate
        this.popRate = this.serverRate;

        // Flow adjustment strength
        this.correction = config.correction || 2;

        // Avg stats window
        this.sampleSize = config.sampleSize || 49;

        // Patching frame indicator
        this.skipNextN = 0;

        // Last frame
        this.prev1 = null;

        // 2nd last frame
        this.prev2 = null;

        // Skip first N packets for stats
        this.ignoreCount = config.ignoreCount || 300;

        // Timestamp
        this.timestamp = new Date().getTime();

        // Debug mode
        this.showStats = false;
        this.showStats && $(".debug").show();

        // Average incoming frame rate
        this.avg = this.serverRate;

        // Incoming frame count
        this.pCount = 0;

        // Buffer shortage count
        this.shortage = 0;

        // Start pop
        setTimeout(this.pop.bind(that), 0);

        // Real traffic simulation
        //this.simulatePacketLoss();
    }

    /**
     * Push incoming frames
     * @param frame
     */
    push(frame) {
        this.pCount++;
        if (this.showStats) {
            this.ignoreCount--;
            let gap = Math.min(new Date().getTime() - this.timestamp, this.serverRate * 3);
            if (this.ignoreCount < 0) {
                this.avg = (this.avg * this.sampleSize + gap) / (this.sampleSize + 1);
            }
        }

        // To replacing a patching frame
        if (this.skipNextN > 0) {
            console.log("Overwrite frame");
            this.queue[0] = frame;
            this.skipNextN--;
        } else {
            this.queue.push(frame);
        }

        if (this.queue.length >= this.capacity)  this.filled = true;
    }

    /**
     * Empty frame queue
     */
    refresh() {
        this.queue = [];
    }

    /**
     * Pop frames, trigger flow change
     */
    pop() {
        var that = this;
        this.timestamp = new Date().getTime();
        if (this.filled && this.queue.length > 0) {
            this.prev2 = this.prev1;
            this.prev1 = this.queue.shift();
            (!this.lockFlow && this.dynamicFlow) && this.flowChange();
        }
        setTimeout(function () {
            this.pop();
        }.bind(that), this.popRate);
    }

    /**
     * Serving frames. Triggered by client render loop.
     * @param scene
     * @param delta
     * @return {*}
     */
    peek(scene, delta) {
        // Do refresh in case of frame queue oversize
        this.queue.length > 10 && this.refresh();
        let top = this.queue[0];

        // If queue empty at peek, predict next frame
        if (!top) {
            this.shortage++;
            this.skipNextN++;
            if (this.prev1 && this.prev2) {
                // Progress since last incoming frame
                let r = (new Date().getTime() - this.timestamp) / this.serverRate;
                // Frame prediction in case of shortage
                top = this.predict(r);
                this.queue.push(top);
            }
        }

        // If queue non-empty, render interpolated frame
        top && this.render(top, delta, scene);
        return top;
    }

    /**
     * Predict next frame content based on ratio
     * @param ratio
     * @return {*|*}
     */
    predict(ratio = 1) {
        let top = clone(this.prev1);
        for (let id in this.prev1) {
            let entityStart = this.prev2[id];
            let entityEnd = this.prev1[id];
            if (!entityStart || !entityEnd) continue;
            let dx = entityEnd.x - entityStart.x;
            let dy = entityEnd.y - entityStart.y;
            top[id].x = entityEnd.x + dx * ratio;
            top[id].y = entityEnd.y + dy * ratio;
        }
        return top;
    }

    /**
     * Pass frame data to renders and do update
     * @param data
     * @param delta
     *        client refresh interval
     * @param scene
     */
    render(data, delta, scene) {
        let ratio = delta / this.serverRate;
        let timeElapsed = new Date().getTime() - this.timestamp;
        let steps = timeElapsed / delta;
        // Update all renders
        for (let id in entities) {
            if (!entities[id].update) continue;
            let serverEntity = data[id];
            let refEntity = (this.prev1 && this.prev1[id]) ? this.prev1[id] : entities[id];
            if (!serverEntity || !entities[id])
                continue;
            let refX = refEntity.update? refEntity.phaserBody.x : refEntity.x;
            let refY = refEntity.update? refEntity.phaserBody.y : refEntity.y;
            let dx = (serverEntity.x - refX) * ratio;
            let dy = (serverEntity.y - refY) * ratio;
            let x = refX + dx * steps;
            let y = refY + dy * steps;
            entities[id].update(x, y, serverEntity.rotation, serverEntity, scene);
        }
    }

    /**
     * Change outgoing flow rate based on buffer size
     */
    flowChange() {
        var that = this;
        //  0 No flow change, -1 To Boost, +1 To Conserve
        let action = 0;
        (this.queue.length === 1) && action++;
        (this.queue.length > this.capacity + this.windowSize) && action--;
        if (!action) return;
        this.popRate = action > 0 ? this.serverRate + this.correction : this.serverRate - this.correction;
        this.lockFlow = true;
        setTimeout(function () {
            this.lockFlow = false;
        }.bind(that), that.lockFreeze);
    }

    /**
     * Frames are ready to be served
     * @return {boolean}
     */
    ready() {
        return this.filled;
    }

    /**
     * Periodically dropping frames
     */
    simulatePacketLoss() {
        setInterval(function () {
            this.refresh();
        }.bind(this), 2000);
        setInterval(function () {
            this.refresh();
        }.bind(this), 500);
    }
}

function clone(obj) {
    if (obj == null || typeof (obj) != 'object')
        return obj;
    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}