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
        MatterAttractors.Attractors.gravityConstant = 0.01;

        return Bodies.circle(this.x, this.y, 5, {
            mass: 0.001,
            label: this.id,
            force: {x: 0, y: 0},
            friction: 0,
            restitution: 0.5,
            // plugin: {
            //     // attractors: [
            //     //     function(bodyA, bodyB) {
            //     //         return {
            //     //             x: (1 / (bodyA.position.x - bodyB.position.x)) * 1e-2,
            //     //             y: (1 / (bodyA.position.y - bodyB.position.y)) * 1e-2,
            //     //         };
            //     //     }
            //     // ]
            //     // MatterAttractors.Attractors.gravity
            //     attractors: [
            //         MatterAttractors.Attractors.gravity
            //     ]
            // }
        });
    }

    sync() {
        let myBody = Globals.engine.world.bodies.find(body => body.label === this.id);
        if (myBody) {
            this.x = myBody.position.x;
            this.y = myBody.position.y;
        }

        let v = {x: Math.random() - 0.5, y: Math.random() - 0.5};
        Body.setVelocity(myBody, v);
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
                delete Globals.entities[this.id];
                break;
            case "ProbeRenderB":
                this.destroy();
                delete Globals.entities[this.id];
                break;
            case "ProbeRenderC":
                this.destroy();
                delete Globals.entities[this.id];
                break;
            case "ProbeRenderD":
                this.destroy();
                delete Globals.entities[this.id];
                break;
            case "ChargeRender":
                break;
            case "Laser":
                this.destroy();
                delete Globals.entities[this.id];
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
    }
}

module.exports = Charge;