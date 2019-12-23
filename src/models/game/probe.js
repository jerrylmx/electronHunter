const Matter = require("matter-js");
const World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body
const Globals = require("../../services/globals");
const MatterAttractors = require("../../../node_modules/matter-attractors/build/matter-attractors");
MatterAttractors.Attractors.gravityConstant = 0.01;
var Bullet = require("./bullet");

class Probe {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.name = config.name;
        this.direction = {x: 1, y: 0};
        this.rotation = Math.atan2(1, 0) * 180 / Math.PI + 90;
        this.speed = 6;
        this.charge = 1;
        this.render = "ProbeRender";
        this.shootCd = 40;
        this.kills = 0;
        this.dead = false;

        this.fireImpulse = 0;
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        return Bodies.circle(this.x, this.y, 30, {
            mass: 100,
            label: this.id,
            force: {x: 0.01, y: 0},
            friction: 0,
            restitution: 0.5,
            plugin: {
                // attractors: [
                //     function(bodyA, bodyB) {
                //         return {
                //             x: (1 / (bodyA.position.x - bodyB.position.x)) * 1e-2,
                //             y: (1 / (bodyA.position.y - bodyB.position.y)) * 1e-2,
                //         };
                //     }
                // ]
                // MatterAttractors.Attractors.gravity
            }
        });
    }

    sync() {
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            this.x = myBody.position.x;
            this.y = myBody.position.y;
        }
        let v = {x: this.direction.x * this.speed, y: this.direction.y * this.speed};
        Body.setVelocity(myBody, v);
        this.shootCd > 0 && this.shootCd--;
    }

    move(dir) {
        this.direction = dir;
        this.rotation = Math.atan2(dir.y, dir.x) * 180 / Math.PI + 90;
    }

    fire() {
        let offset = 50;
        if (this.shootCd > 0) return;

        this.fireImpulse = 1 - this.fireImpulse;
        this.shootCd = 80;
        let bid = this.id + '*****' + Math.floor(Math.random() * 10000);
        let bullet = new Bullet({id: bid, x: this.x + offset * this.direction.x, y: this.y + offset * this.direction.y, rotation: this.rotation});
        let bBody = Globals.engine.world.bodies.find(body => body.label === bid);
        let force = {x: this.direction.x * 40, y: this.direction.y * 40};
        bBody && Body.setVelocity(bBody, force);
        return bullet;
    }

    hurt() {
        if (this.charge < 10) {
            this.dead = true;
            this.destroy();

        } else {
            this.charge = Math.ceil(this.charge / 2);
        }
    }

    box() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            name: this.name
        }
    }

    onCollision(body) {
        switch (body.render) {
            case "ProbeRender":
                break;
            case "ChargeRender":
                this.charge++;
                break;
            case "BulletRender":
                this.hurt();
                break;
            default:
                break;
        }
    }

    destroy() {
        let target = Globals.entities[this.id];
        target && delete Globals.entities[this.id];
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            Matter.Composite.remove(Globals.engine.world, myBody);
        }
    }
}

module.exports = Probe;