const Matter = require("matter-js");
const World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Query = Matter.Query,
      Composite = Matter.Composite
const Globals = require("./globals");

class RayTestService {
    constructor(config = {}) {
        this.collisions = {};
        this.poll = null;
        this.rate = config.rate || 100;
        this.started = false;

    }

    start() {
        this.collisions = {};
        this.started = true;
    }

    end() {
        this.started = false;
        return this.collisions;
    }

    test(pt0, pt1) {
        if (!this.started) return;
        let bodies = Composite.allBodies(Globals.engine.world);
        let res = Query.ray(bodies, pt0, pt1);
        res.forEach((item) => {
            this.collisions[item.bodyA.label] = item.bodyA;
        });
    }

}
module.exports = RayTestService;