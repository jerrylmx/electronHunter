const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies
const Globals = require("../../services/globals");

class Bullet {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.rotation = config.rotation;
        this.ttl = config.ttl || 160;
        this.render = "BulletRender";
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        return Bodies.circle(this.x, this.y, 10, {
            mass: 10,
            label: this.id,
            force: {x: 0, y: 0},
            friction: 0,
            restitution: 0.5
        });
    }

    sync() {
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            this.x = myBody.position.x;
            this.y = myBody.position.y;
        }
        this.ttl--;
        if (this.ttl <= 0) {
            this.destroy();
        }
    }

    onCollision(body) {
        if (!body.render) return;
        let kid = this.id.split('*****')[0];
        let killer = Globals.entities[kid];
        switch (body.render) {
            case "ProbeRenderA":
                this.destroy();
                killer && body.charge < 10 && killer.kills++;
                break;
            case "ProbeRenderB":
                this.destroy();
                killer && body.charge < 10 && killer.kills++;
                break;
            case "ProbeRenderC":
                this.destroy();
                killer && body.charge < 10 && killer.kills++;
                break;
            case "ProbeRenderD":
                this.destroy();
                killer && body.charge < 10 && killer.kills++;
                break;
            case "ProbeRenderE":
                this.destroy();
                killer && body.charge < 10 && killer.kills++;
                break;
            case "ChargeRender":
                this.destroy();
                break;
            case "WallRender":
                this.destroy();
                break;
            default:
                this.destroy();
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

module.exports = Bullet;