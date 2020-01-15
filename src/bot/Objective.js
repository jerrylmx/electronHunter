const Globals = require("../services/globals");
const Utils = require("../services/utils");
class Objective {

    constructor(type, me, target, priority = 1) {
        this.type = type;
        this.me = me;
        this.target = target;
        this.done = false;
        this.priority = priority
    }

    pursue() {
        if (Math.random() < 0.2) {
            let dist = Utils.dist({x: this.me.x, y: this.me.y}, {x: this.target.x, y: this.target.y});
            let dir = {x: this.target.x - this.me.x, y: this.target.y - this.me.y};
            if (dist >= 200) {
                this.me.move && this.me.move(dir);
            }
            Math.random() < 0.02 && this.me.fire && this.me.fire();
            this.done = Objective.AttackComplete(this.me, this.target);
        }
    }

    static AttackComplete(me, target) {
        let th = 1000;
        if (!Globals.entities[target.id]) {
            return true;
        }
        return Utils.dist({x: me.x, y: me.y}, {x: target.x, y: target.y}) > th;

    }

    static AttackTrigger(me) {
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

module.exports = Objective;