const Matter = require("matter-js");
const Query = Matter.Query,
      Composite = Matter.Composite
const Globals = require("./globals");

class RayTestService {
    constructor() {
        this.collisions = {};
    }

    clear() {
        let ret = this.collisions;
        this.collisions = {};
        return ret;
    }

    test(pt0, pt1) {
        let bodies = Composite.allBodies(Globals.engine.world);
        let res = Query.ray(bodies, pt0, pt1);
        res.forEach((item) => {
            this.collisions[item.bodyA.label] = item.bodyA;
        });
    }

}
module.exports = RayTestService;