const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body
const Globals = require("../../services/globals");
const MatterAttractors = require("../../../node_modules/matter-attractors/build/matter-attractors");
class Charge {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.ttl = 2000;
        this.render = "ChargeRender";
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        // return Bodies.circle(this.x, this.y, 10, {
        //     mass: 10,
        //     label: this.id,
        //     force: {x: 0.01, y: 0},
        //     friction: 0,
        //     restitution: 0.5
        // });

        return Bodies.circle(this.x, this.y, 5, {
            mass: 0.001,
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
        // let v = {x: Math.random() - 0.5, y: Math.random() - 0.5};
        // Body.setVelocity(myBody, v);
    }

    box() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        }
    }

    onCollision(body) {
        switch (body.render) {
            case "ProbeRenderA":
                this.destroy();
                break;
            case "ProbeRenderB":
                this.destroy();
                break;
            case "ProbeRenderC":
                this.destroy();
                break;
            case "ProbeRenderD":
                this.destroy();
                break;
            case "ProbeRenderE":
                this.destroy();
                break;
            case "ChargeRender":
                break;
            case "Laser":
                this.destroy();
                break;
            default:
                break;
        }
    }

    destroy() {
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            Matter.Composite.remove(Globals.engine.world, myBody);
        }
        delete Globals.entities[this.id];
    }
}

module.exports = Charge;