const Globals = require("../services/globals");
const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body
const Utils = require("../services/utils");
class Probe {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.name = config.name;
        this.direction = {x: 1, y: 0};
        this.rotation = Math.atan2(1, 0) * 180 / Math.PI + 90;
        this.kills = 0;
        this.dead = false;
        this.charge = 1;
        this.fireImpulse = 0;
        this.isBot = config.isBot || false;

        Globals.probeEntities.push(this);
    }

    sync() {
        // Location sync
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            this.x = myBody.position.x;
            this.y = myBody.position.y;
        }

        // Cd sync
        this.shootCd > 0 && this.shootCd--;


        if (this.isBot && Math.random() < 0.01) {
            this.fire();
        }

        if (this.isBot && Math.random() > 0.9) {
            let randX = Math.random() - 0.5;
            let randY = Math.random() - 0.5;
            this.move({x: randX, y: randY});
        }

        return myBody;
    }

    move(dir) {
        this.direction = Utils.normalize(dir, 1);
        this.rotation = Math.atan2(dir.y, dir.x) * 180 / Math.PI + 90;
    }

    hurt(killer) {
        if (this.charge < 10) {
            this.dead = true;
            this.destroy();

        } else {
            this.charge = Math.ceil(this.charge / 2);
        }
        if (killer) {
            this.dead && killer.kills && killer.kills++;
        }

    }

    onCollision(body) {
        let killer = this.dead ? body : null;
        switch (body.render) {
            case "ChargeRender":
                this.charge++;
                break;
            case "BulletRender":
                this.hurt(killer);
                break;
            case "BulletMRender":
                this.hurt(killer);
                break;
            case "Laser":
                this.hurt(killer);
                break;
            default:
                break;
        }
        return killer;
    }

    destroy() {
        let target = Globals.entities[this.id];
        target && delete Globals.entities[this.id];
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            Matter.Composite.remove(Globals.engine.world, myBody);
        }
        Globals.probeCount--;
        let index = Globals.probeEntities.indexOf(this);
        index > -1 && Globals.probeEntities.splice(index, 1);
    }
}

module.exports = Probe;