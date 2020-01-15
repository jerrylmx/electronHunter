const Globals = require("../services/globals");
const Utils = require("../services/utils");
const Objective = require("./Objective");

class ObjectiveA extends Objective {

    constructor(type, me, target, priority = 1) {
        super(type, me, target, priority = 1);
        this.engageRate = 0.2;
        this.attackRate = 0.02;
    }

    pursue() {
        let that = this;
        let fn1 = () => {this.me.fire && this.me.fire();};
        let fn2 = () => {
            let dist = Utils.dist({x: this.me.x, y: this.me.y}, {x: this.target.x, y: this.target.y});
            let dir = {x: this.target.x - this.me.x, y: this.target.y - this.me.y};
            dist >= 200 && this.me.move && this.me.move(dir);
            Utils.callAtProb(that.attackRate, fn1);
            this.done = this.isDone();
        };
        Utils.callAtProb(this.engageRate, fn2);
    }

    isDone() {
        const th = 1000;
        if (!Globals.entities[this.target.id]) return true;
        return Utils.dist({x: this.me.x, y: this.me.y}, {x: this.target.x, y: this.target.y}) > th;
    }

    static trigger(me) {
        let th = 500;
        for (let i = 0; i < Globals.probeEntities.length; i++) {
            let entity = Globals.probeEntities[i];
            if (entity.render && entity.render.startsWith("ProbeRender") && entity.id !== me.id) {
                if (Utils.dist({x: me.x, y: me.y}, {x: entity.x, y: entity.y}) < th) {
                    return new Objective("A", me, entity, 1);
                }
            }
        }
        return null;
    }

}

module.exports = ObjectiveA;