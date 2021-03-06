const Matter = require("matter-js");
const World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body
const Globals = require("../../services/globals");
const Bullet = require("./bullet");
const Probe = require('../probe');

class ProbeA extends Probe {
    constructor(config) {
        super(config, "ProbeRenderA");
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        return Bodies.circle(this.x, this.y, this.r, {
            mass: 100,
            label: this.id,
            force: {x: 0, y: 0.01},
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

        if (this.shootCd > 0) return;

        this.fireImpulse = 1 - this.fireImpulse;
        this.shootCd = this.cfg.cd;
        let bid = this.id + '*****' + Math.floor(Math.random() * 10000);
        let bullet = new Bullet({
            id: bid,
            x: this.x + offset * this.direction.x,
            y: this.y + offset * this.direction.y,
            rotation: this.rotation,
            ttl: this.ttl
        });
        let bBody = Globals.engine.world.bodies.find(body => body.label === bid);
        let force = {x: this.direction.x * this.strength, y: this.direction.y * this.strength};
        bBody && Body.setVelocity(bBody, force);
        if (bullet) Globals.entities[bullet.id] = bullet;
        return bullet;
    }

    onCollision(body) {
        super.onCollision(body);
    }

}

module.exports = ProbeA;