const Globals = require("../services/globals");
const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body
const Utils = require("../services/utils");
const ProbeConstants = require("../services/probeConstants")
// const EntityControlService = require("../services/entityControlService")
const Charge = require("./game/charge");
const BotService = require("../bot/BotService");

class Probe {
    constructor(config, type = "") {
        this.cfg = ProbeConstants.getConfig(type);
        this.render = type;

        this.visibility = this.cfg.visibility;
        this.shootCd = this.cfg.cd;
        this.shieldCd = 80;
        this.speed = this.cfg.speed;
        this.strength = this.cfg.strength;
        this.ttl = this.cfg.ttl;
        this.r = this.cfg.r;

        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.name = config.name;
        this.color = config.color;
        this.direction = {x: 1, y: 0};
        this.rotation = Math.atan2(1, 0) * 180 / Math.PI + 90;
        this.kills = 0;
        this.dead = 0;
        this.isTop = false;
        this.protected = 0;
        this.charge = 1;
        this.fireImpulse = 0;
        this.breakImpulse = 0;
        this.isBot = config.isBot || false;
        this.AI = this.isBot? new BotService(this) : null;
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
        this.shieldCd > 0 && this.shieldCd--;


        if (this.isBot && Math.random() < 0.01) {
            this.fire();
        }

        this.visibility = this.cfg.visibility + this.charge * this.cfg.deltaVisibility;
        this.cfg.cd = ProbeConstants.getConfig(this.render).cd + this.charge * this.cfg.deltaCd;
        this.speed = this.cfg.speed + this.charge * this.cfg.deltaSpeed;
        this.strength = this.cfg.strength + this.charge * this.cfg.deltaStrength;
        this.ttl = this.cfg.ttl + this.charge * this.cfg.deltaTtl;
        this.AI && this.AI.process();
        return myBody;
    }

    move(dir) {
        this.direction = Utils.normalize(dir, 1);
        this.rotation = Math.atan2(dir.y, dir.x) * 180 / Math.PI + 90;
    }

    hurt(kid) {
        let that = this;
        if (this.protected) {
            setTimeout(() => {
                that.protected = 0;
            }, 100);
            this.breakImpulse = 1 - this.breakImpulse;
            return;
        }
        if (this.charge < 10) {
            this.dead = 1;
            // Reward killer
            let killer = Globals.entities[kid];
            killer && killer.kills++;
            setTimeout(() => {
                that.destroy();
            }, 300);
        } else {
            this.charge = Math.ceil(this.charge / 2);
        }
    }

    onCollision(body) {
        switch (body.render) {
            case "ChargeRender":
                this.charge++;
                break;
            case "BulletRender":
                break;
            case "BulletMRender":
                break;
            case "Laser":
                this.hurt(body.id);
                break;
            default:
                break;
        }
    }

    shield() {
        if (this.shieldCd > 0) {
            return;
        } else {
            this.protected = 1;
            this.shieldCd = 80;
            setTimeout(() => {
                this.protected = 0;
            }, 1000);
        }
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


        for (let i = 0; i < this.charge; i++) {
            let cid = Math.floor(Math.random() * 10000);
            let cfg = {x: this.x, y: this.y + i  * 3, id: cid};
            Globals.entities[cid] = new Charge(cfg);
        }
    }
}

module.exports = Probe;