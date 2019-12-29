const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Query = Matter.Query,
    Composite = Matter.Composite

const Globals = require("../../services/globals");
const Probe = require('../probe');
const RayTestService = require('../../services/rayTestService');

class ProbeE extends Probe {
    constructor(config) {
        super(config, "ProbeRenderE");
        this.laserState = 0;
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        return Bodies.circle(this.x, this.y, this.r, {
            mass: 100,
            label: this.id,
            force: {x: 0.01, y: 0},
            friction: 0,
            restitution: 0.5
        });
    }

    sync() {
        let myBody = super.sync();
        let v = {x: this.direction.x * this.speed, y: this.direction.y * this.speed};
        myBody && Body.setVelocity(myBody, v);
    }

    fire() {
        if (this.shootCd > 0 || this.laserState !== 0) return;
        let tester = new RayTestService();
        this.fireImpulse = 1 - this.fireImpulse;
        this.laserState = 1;
        let that = this;
        setTimeout(() => {
            that.laserState = 2;
            let base1 = {}
            let pt0 = { x: this.x + 50 * this.direction.x,
                y: this.y + 50 * this.direction.y};
            let pt1 = { x: this.x + 750 * this.direction.x,
                y: this.y + 750 * this.direction.y};

            // let bodies = Composite.allBodies(Globals.engine.world);
            // let res = Query.ray(bodies, pt0, pt1);
            // res.forEach((collision) => {
            //     let modelA = Globals.entities[collision.bodyA.label];
            //     modelA && modelA.onCollision({id: that.id, render: "Laser"});
            // });

            tester.test(pt0, pt1);
            let res = tester.clear();
            Object.keys(res).forEach((id) => {
                let body = res[id];
                let modelA = Globals.entities[body.label];
                modelA && modelA.onCollision({id: that.id, render: "Laser"});
            });
            setTimeout(() => {

                that.laserState = 0;

                // tester.test(pt0, pt1);
                // let res = tester.clear();
                // Object.keys(res).forEach((id) => {
                //     let body = res[id];
                //     let modelA = Globals.entities[body.label];
                //     modelA && modelA.onCollision({id: that.id, render: "Laser"});
                // });
                // res.forEach((collision) => {
                //     let modelA = Globals.entities[collision.bodyA.label];
                //     modelA && modelA.onCollision({id: that.id, render: "Laser"});
                // });
            }, 300);

        }, this.ttl);
        this.shootCd = this.cfg.cd;
        return null;
    }

    onCollision(body) {
        super.onCollision(body);
    }

    // move() {
    //     this.direction = dir;
    //     this.rotation = Math.atan2(dir.y, dir.x) * 180 / Math.PI + 90;
    //     this.laserState = 0;
    // }

}

module.exports = ProbeE;