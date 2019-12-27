const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Query = Matter.Query,
    Composite = Matter.Composite

const Globals = require("../../services/globals");
const Probe = require('../probe');
const RayTestService = require('../../services/rayTestService');

class ProbeB extends Probe {
    constructor(config) {
        super(config);
        this.speed = 6;
        this.render = "ProbeRenderB";
        this.shootCd = 5;
        this.rayTester = new RayTestService();

        this.laserState = 0;
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        return Bodies.circle(this.x, this.y, 30, {
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
        let offset = 50;
        if (this.shootCd > 0 || this.laserState !== 0) return;
        this.fireImpulse = 1 - this.fireImpulse;


        this.laserState = 1;
        let that = this;

        setTimeout(() => {
            that.laserState = 2;

            let pt0 = { x: this.x + 50 * this.direction.x,
                        y: this.y + 50 * this.direction.y};
            let pt1 = { x: this.x + 500 * this.direction.x,
                        y: this.y + 500 * this.direction.y};
            let bodies = Composite.allBodies(Globals.engine.world);
            let res = Query.ray(bodies, pt0, pt1);
            res.forEach((collision) => {
                let modelA = Globals.entities[collision.bodyA.label];
                modelA && modelA.onCollision({render: "Laser"});
                modelA.dead && this.kills++;
            });

            setTimeout(() => {
                that.laserState = 0;
            }, 300);

        }, 1000);


        this.shootCd = 5;
        // let bid = this.id + '*****' + Math.floor(Math.random() * 10000);
        // let bullet = new Bullet({id: bid, x: this.x + offset * this.direction.x, y: this.y + offset * this.direction.y, rotation: this.rotation});
        // let bBody = Globals.engine.world.bodies.find(body => body.label === bid);
        // let force = {x: this.direction.x * 40, y: this.direction.y * 40};
        // bBody && Body.setVelocity(bBody, force);
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

module.exports = ProbeB;